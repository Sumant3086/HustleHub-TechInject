import { Response, NextFunction } from 'express';
import { TaskService } from './task.service';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from '@alternative/core';
import { successResponse } from '../../utils/response';
import type { AuthRequest } from '../../middleware/auth.middleware';

export class TaskController {
  private service: TaskService;

  constructor() {
    this.service = new TaskService();
  }

  findAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tasks = await this.service.findAll(req.user!.tenantId);
      return successResponse(res, tasks);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const task = await this.service.findById(req.params.id, req.user!.tenantId);
      return successResponse(res, task);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = createTaskSchema.parse(req.body);
      const task = await this.service.create(req.user!.tenantId, req.user!.userId, dto);
      return successResponse(res, task, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = updateTaskSchema.parse(req.body);
      const task = await this.service.update(req.params.id, req.user!.tenantId, dto);
      return successResponse(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  };

  move = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = moveTaskSchema.parse(req.body);
      const task = await this.service.move(req.params.id, req.user!.tenantId, dto);
      return successResponse(res, task, 'Task moved successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id, req.user!.tenantId);
      return successResponse(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
