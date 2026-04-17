export type Id = string | number;

export interface Task {
  id: Id;
  columnId: Id;
  title: string;
  description?: string;
  deadline?: number;   // Unix ms timestamp — when the task is due
  createdAt?: number;
}

export interface Column {
  id: Id;
  title: string;
}
