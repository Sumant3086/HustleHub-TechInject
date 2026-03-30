import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/response';
import { requestContext, type RequestContext } from '../lib/context';

/**
 * Auth middleware that verifies JWT and stores user context in AsyncLocalStorage
 * This ensures tenantId is available to all downstream code without passing it as arguments
 */
export async function authMiddleware(
  req: Request,
  handler: (req: Request) => Promise<Response>
): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyToken(token);
    
    const ctx: RequestContext = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role,
    };
    
    // Run handler within context scope
    return await requestContext.run(ctx, () => handler(req));
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
