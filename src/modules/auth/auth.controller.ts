import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/**
 * auth.controller.ts — Endpoints de autenticación.
 * ──────────────────────────────────────────────────
 * SRP: único punto de entrada para auth. No contiene lógica de negocio.
 * Todos los DTOs están validados por el ValidationPipe global.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Pública — no requiere JWT.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso — devuelve access y refresh tokens',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales incorrectas o cuenta suspendida',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/refresh
   * Pública — el refresh token es la credencial.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  /**
   * POST /auth/logout
   * Protegido — solo indica al cliente que limpie sus tokens.
   * (Stateless: el servidor no mantiene lista de tokens revocados en v1)
   */
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión (cliente debe eliminar sus tokens)' })
  logout() {
    return { message: 'Sesión cerrada exitosamente' };
  }

  /**
   * GET /auth/me
   * Devuelve el perfil del usuario autenticado.
   */
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }
}
