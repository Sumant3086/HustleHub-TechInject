import { TaskRepository } from './task.repository';
import { NotFoundError } from '../../utils/response';
import type { CreateTaskDto, UpdateTaskDto, MoveTaskDto, TaskResponse, TaskStatus, TaskPriority } from '@alternative/core';
import type { Task } from '@prisma/client';

export class TaskService {
  private repository: TaskRepository;

  constructor() {
    this.repository = new TaskRepository();
  }

  async findAll(tenantId: string): Promise<TaskResponse[]> {
    const tasks = await this.repository.findAll(tenantId);
    return tasks.map(this.mapToResponse);
  }

  async findById(id: string, tenantId: string): Promise<TaskResponse> {
    const task = await this.repository.findById(id, tenantId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return this.mapToResponse(task);
  }

  async create(tenantId: string, userId: string, dto: CreateTaskDto): Promise<TaskResponse> {
    const task = await this.repository.create(tenantId, userId, dto);
    return this.mapToResponse(task);
  }

  async update(id: string, tenantId: string, dto: UpdateTaskDto): Promise<TaskResponse> {
    const existing = await this.repository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    const task = await this.repository.update(id, tenantId, dto);
    return this.mapToResponse(task);
  }

  async move(id: string, tenantId: string, dto: MoveTaskDto): Promise<TaskResponse> {
    const existing = await this.repository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    const task = await this.repository.move(id, tenantId, dto.status, dto.position);
    return this.mapToResponse(task);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const existing = await this.repository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    await this.repository.delete(id, tenantId);
  }

  private mapToResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      tenantId: task.tenantId,
      userId: task.userId,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      position: task.position,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
