import { prisma } from '../../utils/prisma';
import type { CreateTaskDto, UpdateTaskDto, TaskStatus } from '@alternative/core';

export class TaskRepository {
  async findAll(tenantId: string) {
    return await prisma.task.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    return await prisma.task.findFirst({
      where: { id, tenantId },
    });
  }

  async create(tenantId: string, userId: string, dto: CreateTaskDto) {
    const maxPosition = await this.getMaxPosition(tenantId, dto.status);
    
    return await prisma.task.create({
      data: {
        tenantId,
        userId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        position: maxPosition + 1,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateTaskDto) {
    // First verify the task belongs to the tenant
    const task = await this.findById(id, tenantId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    return await prisma.task.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async move(id: string, tenantId: string, status: TaskStatus, position: number) {
    // First verify the task belongs to the tenant
    const task = await this.findById(id, tenantId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    return await prisma.task.update({
      where: { id },
      data: {
        status,
        position,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    // First verify the task belongs to the tenant
    const task = await this.findById(id, tenantId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    await prisma.task.delete({
      where: { id },
    });
  }

  private async getMaxPosition(tenantId: string, status: TaskStatus): Promise<number> {
    const result = await prisma.task.findFirst({
      where: { tenantId, status },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    
    return result?.position ?? 0;
  }
}
