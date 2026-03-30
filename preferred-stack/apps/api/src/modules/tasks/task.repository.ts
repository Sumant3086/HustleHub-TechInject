import { db } from '../../db';
import { tasks } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateTaskDto, UpdateTaskDto, TaskStatus } from '@preferred/core';
import { getContext } from '../../lib/context';

/**
 * Task Repository - All queries are automatically scoped to the current tenant
 * tenantId is read from AsyncLocalStorage context, never passed as argument
 */
export class TaskRepository {
  async findAll() {
    const { tenantId } = getContext();
    
    return await db.query.tasks.findMany({
      where: eq(tasks.tenantId, tenantId),
      orderBy: [desc(tasks.createdAt)],
    });
  }

  async findById(id: string) {
    const { tenantId } = getContext();
    
    return await db.query.tasks.findFirst({
      where: and(
        eq(tasks.id, id),
        eq(tasks.tenantId, tenantId)
      ),
    });
  }

  async create(dto: CreateTaskDto) {
    const { tenantId, userId } = getContext();
    const maxPosition = await this.getMaxPosition(dto.status);
    
    const [task] = await db.insert(tasks).values({
      tenantId,
      userId,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      position: maxPosition + 1,
    }).returning();
    
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const { tenantId } = getContext();
    
    const [task] = await db.update(tasks)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(and(
        eq(tasks.id, id),
        eq(tasks.tenantId, tenantId)
      ))
      .returning();
    
    return task;
  }

  async move(id: string, status: TaskStatus, position: number) {
    const { tenantId } = getContext();
    
    const [task] = await db.update(tasks)
      .set({
        status,
        position,
        updatedAt: new Date(),
      })
      .where(and(
        eq(tasks.id, id),
        eq(tasks.tenantId, tenantId)
      ))
      .returning();
    
    return task;
  }

  async delete(id: string) {
    const { tenantId } = getContext();
    
    await db.delete(tasks).where(and(
      eq(tasks.id, id),
      eq(tasks.tenantId, tenantId)
    ));
  }

  private async getMaxPosition(status: TaskStatus): Promise<number> {
    const { tenantId } = getContext();
    
    const result = await db.query.tasks.findMany({
      where: and(
        eq(tasks.tenantId, tenantId),
        eq(tasks.status, status)
      ),
      orderBy: [desc(tasks.position)],
      limit: 1,
    });
    
    return result[0]?.position ?? 0;
  }
}
