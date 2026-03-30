export interface Task {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

