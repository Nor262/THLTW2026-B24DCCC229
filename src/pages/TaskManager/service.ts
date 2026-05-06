import { Task } from './data.d';
import moment from 'moment';

const STORAGE_KEY = 'personal_task_manager_tasks';

export const getTasks = (): Task[] => {
  const tasksStr = localStorage.getItem(STORAGE_KEY);
  if (!tasksStr) {
    // Initial mock data
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Học React Beautiful DND',
        description: 'Tìm hiểu cách sử dụng kéo thả trong React',
        deadline: moment().add(2, 'days').toISOString(),
        priority: 'High',
        status: 'doing',
        tags: ['React', 'UI'],
        createdAt: moment().toISOString(),
      },
      {
        id: '2',
        title: 'Thiết kế Dashboard',
        description: 'Tạo trang thống kê công việc',
        deadline: moment().subtract(1, 'days').toISOString(),
        priority: 'Medium',
        status: 'todo',
        tags: ['Design'],
        createdAt: moment().toISOString(),
      },
      {
        id: '3',
        title: 'Hoàn thành báo cáo',
        description: 'Gửi báo cáo công việc tuần này',
        deadline: moment().toISOString(),
        priority: 'Low',
        status: 'done',
        tags: ['Work'],
        createdAt: moment().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));
    return mockTasks;
  }
  return JSON.parse(tasksStr);
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'status'>): Task => {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: Math.random().toString(36).substr(2, 9),
    status: 'todo',
    createdAt: moment().toISOString(),
  };
  saveTasks([newTask, ...tasks]);
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Task>): Task | undefined => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    saveTasks(tasks);
    return tasks[index];
  }
  return undefined;
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(t => t.id !== id);
  saveTasks(filteredTasks);
};

export const getDashboardStats = (tasks: Task[]) => {
  const now = moment();
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.status !== 'done' && moment(t.deadline).isBefore(now, 'day')).length,
  };
};
