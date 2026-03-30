import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from '@alternative/core';
import { successResponse } from '../../utils/response';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await this.service.register(dto);
      return successResponse(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = loginSchema.parse(req.body);
      const tenantSlug = req.query.tenant as string;
      
      if (!tenantSlug) {
        return res.status(400).json({ error: 'Tenant slug is required' });
      }

      const result = await this.service.login(dto, tenantSlug);
      return successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };
}
