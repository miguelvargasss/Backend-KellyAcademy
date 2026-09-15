import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppRoute } from './entities/app-route.entity';
import { RoleRoutePermission } from './entities/role-route-permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(AppRoute)
    private readonly routeRepo: Repository<AppRoute>,
    @InjectRepository(RoleRoutePermission)
    private readonly permRepo: Repository<RoleRoutePermission>,
  ) {}

  /** Lista todas las rutas con sus permisos por rol */
  async findAllRoutes() {
    return this.routeRepo.find({ order: { sortOrder: 'ASC' } });
  }

  /** Verifica si un rol puede acceder a una ruta específica */
  async canAccess(path: string, role: string): Promise<{ canAccess: boolean }> {
    const route = await this.routeRepo.findOne({
      where: { path, isActive: true },
    });
    if (!route) return { canAccess: false };
    if (route.isPublic) return { canAccess: true };
    const perm = await this.permRepo.findOne({
      where: { routeId: route.id, role: role as 'profesor' | 'estudiante' },
    });
    return { canAccess: perm?.canAccess ?? false };
  }

  /** Devuelve todas las rutas accesibles por un rol dado */
  async findRoutesForRole(role: string) {
    return this.permRepo.find({
      where: { role: role as 'profesor' | 'estudiante', canAccess: true },
      relations: ['route'],
      order: { route: { sortOrder: 'ASC' } },
    });
  }

  /** Actualiza el permiso de un rol sobre una ruta */
  async setPermission(routeId: string, role: string, canAccess: boolean) {
    const route = await this.routeRepo.findOne({ where: { id: routeId } });
    if (!route) throw new NotFoundException(`Ruta ${routeId} no encontrada`);
    const existing = await this.permRepo.findOne({
      where: { routeId, role: role as 'profesor' | 'estudiante' },
    });
    if (existing) {
      return this.permRepo.save({ ...existing, canAccess });
    }
    return this.permRepo.save({
      routeId,
      role: role as 'profesor' | 'estudiante',
      canAccess,
    });
  }
}
