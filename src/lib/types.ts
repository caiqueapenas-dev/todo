export interface Client {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // Formato YYYY-MM-DD
  clientId: string;
  priority: 1 | 2 | 3;
  category: string;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "annually";
  createdAt: string; // ISO String
}

export type SortConfig = {
  key: keyof Task;
  direction: "ascending" | "descending";
} | null;
