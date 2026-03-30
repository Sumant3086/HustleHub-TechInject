import type { LoginDto, RegisterDto, AuthResponse } from './auth.js';
import type { TaskResponse, CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './task.js';

/**
 * Unified API Contract Interface
 * This interface defines every endpoint's request and response shape,
 * ensuring type safety across frontend and backend.
 * Required by section 3.2 of the assignment.
 */
export interface ApiContract {
  // Auth Endpoints
  'POST /api/auth/register': {
    request: RegisterDto;
    response: AuthResponse;
  };
  'POST /api/auth/login': {
    request: LoginDto;
    query: { tenant: string };
    response: AuthResponse;
  };

  // Task Endpoints
  'GET /api/tasks': {
    response: TaskResponse[];
  };
  'POST /api/tasks': {
    request: CreateTaskDto;
    response: TaskResponse;
  };
  'PATCH /api/tasks/:id': {
    params: { id: string };
    request: UpdateTaskDto;
    response: TaskResponse;
  };
  'PATCH /api/tasks/:id/move': {
    params: { id: string };
    request: MoveTaskDto;
    response: TaskResponse;
  };
  'DELETE /api/tasks/:id': {
    params: { id: string };
    response: { success: true };
  };
}
