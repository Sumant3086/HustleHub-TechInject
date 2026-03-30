import { TaskRepository } from './task.repository';
import { NotFoundError } from '../../utils/response';
import { tasks } from '../../db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import type { CreateTaskDto, UpdateTaskDto, MoveTaskDto, TaskResponse, TaskStatus, TaskPriority } from '@preferred/core';

type TaskRow = InferSelectModel<typeof tasks>;

/**
 * Task Service - Business logic layer
 * Does NOT handle tenantId - that's enforced at the repository level via AsyncLocalStorage
 */
export class TaskService {
  private repository: TaskRepository;

  constructor() {
    this.repository = new TaskRepository();
  }

  async findAll(): Promise<TaskResponse[]> {
    const tasks = await this.repository.findAll();
    return tasks.map(this.mapToResponse);
  }

  async findById(id: string): Promise<TaskResponse> {
    const task = await this.repository.findById(id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return this.mapToResponse(task);
  }

  async create(dto: CreateTaskDto): Promise<TaskResponse> {
    const task = await this.repository.create(dto);
    return this.mapToResponse(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    const task = await this.repository.update(id, dto);
    return this.mapToResponse(task);
  }

  async move(id: string, dto: MoveTaskDto): Promise<TaskResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    const task = await this.repository.move(id, dto.status, dto.position);
    return this.mapToResponse(task);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    await this.repository.delete(id);
  }

  private mapToResponse(task: TaskRow): TaskResponse {
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
