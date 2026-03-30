import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  userId: string;
  tenantId: string;
  email: string;
  role?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getContext(): RequestContext | undefined {
  return requestContext.getStore();
}
