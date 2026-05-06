export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string; // ISO string
  priority: Priority;
  tags?: string[];
  status: Status;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  overdue: number;
}
