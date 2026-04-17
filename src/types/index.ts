export type Id = string | number;

export interface Task {
  id: Id;
  columnId: Id;
  title: string;
  description?: string;
  commentsCount?: number;
  attachmentsCount?: number;
  createdAt?: number;
}

export interface Column {
  id: Id;
  title: string;
}
