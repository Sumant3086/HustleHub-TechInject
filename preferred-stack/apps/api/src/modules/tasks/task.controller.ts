import { TaskService } from './task.service';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from '@preferred/core';
import { successResponse, errorResponse, AppError } from '../../utils/response';

export class TaskController {
  private service: TaskService;

  constructor() {
    this.service = new TaskService();
  }

  async findAll(req: Request): Promise<Response> {
    try {
      const tasks = await this.service.findAll();
      return successResponse(tasks);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }
      return errorResponse('Failed to fetch tasks', 500);
    }
  }

  async findById(req: Request, id: string): Promise<Response> {
    try {
      const task = await this.service.findById(id);
      return successResponse(task);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }
      return errorResponse('Failed to fetch task', 500);
    }
  }

  async create(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const dto = createTaskSchema.parse(body);
      const task = await this.service.create(dto);
      return successResponse(task, 'Task created successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }
      return errorResponse('Failed to create task', 500);
    }
  }

  async update(req: Request, id: string): Promise<Response> {
    try {
      const body = await req.json();
      const dto = updateTaskSchema.parse(body);
      const task = await this.service.update(id, dto);
      return successResponse(task, 'Task updated successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }
      return errorResponse('Failed to update task', 500);
    }
  }

  async move(req: Request, id: string): Promise<Response> {
    try {
      const body = await req.json();
      const dto = moveTaskSchema.parse(body);
      const task = await this.service.move(id, dto);
      return successResponse(task, 'Task moved successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }
      return errorResponse('Failed to move task', 500);
    }
  }

  async delete(req: Request, id: string): Promise<Response> {
    try {
      await this.service.delete(id);
      return successResponse(null, 'Task deleted successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }
      return errorResponse('Failed to delete task', 500);
    }
  }
}
