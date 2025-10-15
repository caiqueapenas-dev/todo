import type { Client, Task } from "./types";

// --- DADOS INICIAIS E CONFIGURAÇÕES ---
export const initialClients: Client[] = [
  { id: "cli1", name: "Panther Blazz" },
  { id: "cli2", name: "Clínica Gama" },
  { id: "cli3", name: "Clean Saúde" },
];

export const initialTasks: Task[] = [
  {
    id: "task1",
    title: "Criar campanha de anúncios",
    description: "Foco no público do Sul e Sudeste.",
    deadline: new Date().toISOString().split("T")[0],
    clientId: "cli1",
    priority: 3,
    category: "Gestão de Anúncio",
    recurrence: "none",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task2",
    title: "Editar vídeo institucional",
    description: "Vídeo para o aniversário de 15 anos da clínica.",
    deadline: new Date(new Date().setDate(new Date().getDate() + 2))
      .toISOString()
      .split("T")[0],
    clientId: "cli2",
    priority: 2,
    category: "Edição de Vídeo",
    recurrence: "none",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task3",
    title: "Agendar posts da semana",
    description: "",
    deadline: new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split("T")[0],
    clientId: "cli3",
    priority: 1,
    category: "Card",
    recurrence: "weekly",
    createdAt: new Date().toISOString(),
  },
];

export const TASK_CATEGORIES: string[] = [
  "Card",
  "Edição de Vídeo",
  "Gestão de Anúncio",
  "Relatório",
  "Evento",
  "Aniversário",
  "Datas Comemorativas",
  "Outro",
];

type PriorityDetail = {
  label: string;
  color: string;
  textColor: string;
  bgColor: string;
};

export const PRIORITY_MAP: Record<1 | 2 | 3, PriorityDetail> = {
  1: {
    label: "Baixa",
    color: "bg-green-500",
    textColor: "text-green-800",
    bgColor: "bg-green-100",
  },
  2: {
    label: "Média",
    color: "bg-yellow-500",
    textColor: "text-yellow-800",
    bgColor: "bg-yellow-100",
  },
  3: {
    label: "Alta",
    color: "bg-red-500",
    textColor: "text-red-800",
    bgColor: "bg-red-100",
  },
};
