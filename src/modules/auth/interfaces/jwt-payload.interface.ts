/**
 * jwt-payload.interface.ts — Contrato del payload del JWT.
 * ISP: interfaz pequeña y específica.
 */
export class JwtPayload {
  sub: string; // user UUID
  email: string;
  role: 'profesor' | 'estudiante';
  iat?: number;
  exp?: number;
}
