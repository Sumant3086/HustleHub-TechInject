import { db } from '../../db';
import { tenants, users } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export class AuthRepository {
  async createTenant(name: string, slug: string) {
    const [tenant] = await db.insert(tenants).values({ name, slug }).returning();
    return tenant;
  }

  async findTenantBySlug(slug: string) {
    return await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });
  }

  async createUser(tenantId: string, email: string, passwordHash: string) {
    const [user] = await db.insert(users).values({
      tenantId,
      email,
      passwordHash,
    }).returning();
    return user;
  }

  async findUserByEmail(email: string, tenantId: string) {
    return await db.query.users.findFirst({
      where: and(
        eq(users.email, email),
        eq(users.tenantId, tenantId)
      ),
    });
  }

  async findUserById(id: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }
}
