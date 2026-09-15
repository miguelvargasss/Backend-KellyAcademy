import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { CreateSubmissionDto } from './dto/submission.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission) private readonly repo: Repository<Submission>,
  ) {}

  async create(
    dto: CreateSubmissionDto,
    studentId: string,
  ): Promise<Submission> {
    const exists = await this.repo.findOne({
      where: { itemId: dto.itemId, studentId },
    });
    if (exists)
      throw new ConflictException('Ya existe una entrega para esta actividad');
    return this.repo.save({ ...dto, studentId });
  }

  async findMy(studentId: string) {
    return this.repo.find({
      where: { studentId },
      relations: ['item'],
      order: { submittedAt: 'DESC' },
    });
  }

  async findByItem(itemId: string) {
    return this.repo.find({
      where: { itemId },
      relations: ['student'],
      order: { submittedAt: 'ASC' },
    });
  }

  async findByCourse(courseId: string) {
    return this.repo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.item', 'item')
      .leftJoinAndSelect('item.week', 'week')
      .leftJoinAndSelect('s.student', 'student')
      .where('week.courseId = :courseId', { courseId })
      .orderBy('s.submittedAt', 'DESC')
      .getMany();
  }

  /**
   * Para la vista de Libro de Calificaciones del profesor.
   * Retorna TODOS los alumnos matriculados al curso, con su submission (o null)
   * y calificación (o null) para la actividad dada.
   */
  async findByItemWithAllStudents(itemId: string, courseId: string) {
    // 1. Submissions para este item con relaciones
    const submissions = await this.repo.find({
      where: { itemId },
      relations: ['student', 'grade'],
      order: { submittedAt: 'ASC' },
    });

    // 2. Alumnos matriculados en el curso (via subquery a enrollments)
    const enrolledStudents = await this.repo.manager
      .createQueryBuilder(User, 'u')
      .innerJoin('course_enrollments', 'e', 'e.student_id = u.id AND e.course_id = :courseId', { courseId })
      .where("u.role = 'estudiante'")
      .getMany();

    // 3. Merge: cada alumno + su submission (o null)
    const submissionByStudent = new Map(submissions.map(s => [s.studentId, s]));

    return enrolledStudents.map(student => {
      const sub = submissionByStudent.get(student.id) ?? null;
      return {
        student: { id: student.id, fullName: student.fullName, email: student.email },
        submission: sub ? {
          id: sub.id,
          fileUrl: sub.fileUrl,
          textContent: sub.textContent,
          status: sub.status,
          isLate: sub.isLate,
          submittedAt: sub.submittedAt,
        } : null,
        grade: sub?.grade ? {
          id: sub.grade.id,
          score: sub.grade.score,
          feedback: sub.grade.feedback,
          gradedAt: sub.grade.gradedAt,
        } : null,
      };
    });
  }
}
