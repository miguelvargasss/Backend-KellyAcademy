import { Controller, Post, UseInterceptors, UploadedFile, Param, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post(':context')
  @ApiOperation({ summary: 'Subir archivo (context=library|submission)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('context') context: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Archivo no proporcionado');
    if (!['library', 'submission'].includes(context)) {
      throw new BadRequestException('Contexto inválido. Debe ser library o submission');
    }

    // Límite dinámico de tamaño (en bytes)
    // Library: 100MB, Submission: 15MB
    const maxSize = context === 'library' ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
    
    if (file.size > maxSize) {
      throw new BadRequestException(`El archivo excede el tamaño máximo permitido para este contexto (${maxSize / (1024 * 1024)}MB)`);
    }

    const result = await this.cloudinaryService.uploadFile(file);
    return { url: result.secure_url, public_id: result.public_id };
  }
}
