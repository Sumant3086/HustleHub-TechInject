import { AuthController } from './modules/auth/auth.controller';
import { TaskController } from './modules/tasks/task.controller';
import { authMiddleware } from './middleware/auth.middleware';
import { errorResponse, AppError } from './utils/response';

const authController = new AuthController();
const taskController = new TaskController();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth routes (no authentication required)
    if (path === '/api/auth/register' && method === 'POST') {
      return await authController.register(req);
    }

    if (path === '/api/auth/login' && method === 'POST') {
      return await authController.login(req);
    }

    // Auth /me route (authentication required)
    if (path === '/api/auth/me' && method === 'GET') {
      return await authMiddleware(req, (r) => authController.me(r));
    }

    // Protected routes (authentication required)
    // authMiddleware wraps the handler and provides context via AsyncLocalStorage
    
    // Task routes
    if (path === '/api/tasks' && method === 'GET') {
      return await authMiddleware(req, (r) => taskController.findAll(r));
    }

    if (path === '/api/tasks' && method === 'POST') {
      return await authMiddleware(req, (r) => taskController.create(r));
    }

    const taskIdMatch = path.match(/^\/api\/tasks\/([^/]+)$/);
    if (taskIdMatch) {
      const taskId = taskIdMatch[1];

      if (method === 'GET') {
        return await authMiddleware(req, (r) => taskController.findById(r, taskId));
      }

      if (method === 'PATCH') {
        return await authMiddleware(req, (r) => taskController.update(r, taskId));
      }

      if (method === 'DELETE') {
        return await authMiddleware(req, (r) => taskController.delete(r, taskId));
      }
    }

    const taskMoveMatch = path.match(/^\/api\/tasks\/([^/]+)\/move$/);
    if (taskMoveMatch && method === 'PATCH') {
      const taskId = taskMoveMatch[1];
      return await authMiddleware(req, (r) => taskController.move(r, taskId));
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }

    console.error('Unhandled error:', error);
    return errorResponse('Internal server error', 500);
  }
}

const PORT = process.env.PORT || 3001;

export const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const response = await handleRequest(req);
    
    // Add CORS headers to all responses
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
});

console.log(`🚀 API server running on http://localhost:${PORT}`);
console.log(`📊 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'Not configured'}`);
console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✓ Configured' : '✗ Missing'}`);
