import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from '@preferred/core';
import { successResponse, errorResponse, AppError } from '../../utils/response';
import { getContext } from '../../lib/context';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  async register(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const dto = registerSchema.parse(body);
      const result = await this.service.register(dto);
      return successResponse(result, 'Registration successful');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }
      return errorResponse(error instanceof Error ? error.message : 'Registration failed', 500);
    }
  }

  async login(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const dto = loginSchema.parse(body);
      
      const url = new URL(req.url);
      const tenantSlug = url.searchParams.get('tenant');
      
      if (!tenantSlug) {
        return errorResponse('Tenant slug is required', 400);
      }

      const result = await this.service.login(dto, tenantSlug);
      return successResponse(result, 'Login successful');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }
      return errorResponse('Login failed', 500);
    }
  }

  async me(req: Request): Promise<Response> {
    try {
      const context = getContext();
      if (!context?.userId) {
        return errorResponse('Unauthorized', 401);
      }

      const user = await this.service.getUserById(context.userId);
      if (!user) {
        return errorResponse('User not found', 404);
      }

      return successResponse({ user }, 'User retrieved successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }
      return errorResponse('Failed to get user', 500);
    }
  }
}

