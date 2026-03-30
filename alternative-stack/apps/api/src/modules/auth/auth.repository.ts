import { prisma } from '../../utils/prisma';

export class AuthRepository {
  async createTenant(name: string, slug: string) {
    return await prisma.tenant.create({
      data: { name, slug },
    });
  }

  async findTenantBySlug(slug: string) {
    return await prisma.tenant.findUnique({
      where: { slug },
    });
  }

  async createUser(tenantId: string, email: string, passwordHash: string) {
    return await prisma.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
      },
    });
  }

  async findUserByEmail(email: string, tenantId: string) {
    return await prisma.user.findFirst({
      where: {
        email,
        tenantId,
      },
    });
  }

  async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }
}
