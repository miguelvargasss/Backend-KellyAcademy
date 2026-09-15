import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto, TokenResponseDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

/**
 * auth.service.ts — Lógica de negocio de autenticación.
 * ───────────────────────────────────────────────────────
 * SRP: solo gestiona login, refresh y logout.
 * DIP: depende de la entidad User via TypeORM (abstracción de BD).
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Verifica credenciales y devuelve access + refresh tokens.
   */
  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (user.status === 'suspendido' || user.status === 'inactivo') {
      throw new UnauthorizedException('Tu cuenta está suspendida o inactiva');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (dto.requestedRole && user.role !== dto.requestedRole) {
      throw new UnauthorizedException('Las credenciales no pertenecen al perfil seleccionado');
    }

    // Actualizar último login
    await this.userRepository.update(user.id, { lastLogin: new Date() });

    return this.generateTokens(user);
  }

  /**
   * Renueva el access token usando el refresh token.
   */
  async refresh(
    dto: RefreshTokenDto,
  ): Promise<Pick<TokenResponseDto, 'accessToken'>> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    } satisfies JwtPayload);

    return { accessToken };
  }

  /**
   * Devuelve el perfil del usuario autenticado (sin password).
   */
  async getMe(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...profile } = user;
    return profile;
  }

  // ── Helpers privados ─────────────────────────────────────────────

  private generateTokens(user: User): TokenResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as '7d',
    });

    return { accessToken, refreshToken, role: user.role };
  }
}
