import { AuthRepository } from './auth.repository';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { ValidationError, UnauthorizedError } from '../../utils/response';
import type { RegisterDto, LoginDto, AuthResponse } from '@preferred/core';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingTenant = await this.repository.findTenantBySlug(dto.tenantSlug);
    if (existingTenant) {
      throw new ValidationError('Tenant slug already exists');
    }

    const tenant = await this.repository.createTenant(dto.tenantName, dto.tenantSlug);
    const passwordHash = await hashPassword(dto.password);
    const user = await this.repository.createUser(tenant.id, dto.email, passwordHash);

    const accessToken = await generateAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto, tenantSlug: string): Promise<AuthResponse> {
    const tenant = await this.repository.findTenantBySlug(tenantSlug);
    if (!tenant) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = await this.repository.findUserByEmail(dto.email, tenant.id);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await verifyPassword(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const accessToken = await generateAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };
  }
}
