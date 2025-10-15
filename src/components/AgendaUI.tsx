"use client";
import React, { useState, useEffect } from "react";
import type { Task, Client } from "../lib/types";
import { PRIORITY_MAP, TASK_CATEGORIES } from "../lib/data";

// --- ÍCONES SVG ---
interface IconProps {
  className?: string;
}
export const PlusIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);
export const CalendarIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
export const ChevronLeftIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);
export const ChevronRightIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);
export const TrashIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
export const EditIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
    />
  </svg>
);
export const XIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// --- COMPONENTES DA UI ---
interface TaskCardProps {
  task: Task;
  clients: Client[];
  onEdit: (task: Task) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  clients,
  onEdit,
  onDragStart,
}) => {
  const client = clients.find((c) => c.id === task.clientId);
  const priority = PRIORITY_MAP[task.priority];
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing mb-2"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-gray-800 text-sm">{task.title}</h4>
        <div
          className={`w-3 h-3 rounded-full ${priority.color} flex-shrink-0 ml-2`}
          title={`Prioridade: ${priority.label}`}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">{task.description}</p>
      <div className="text-xs mt-3 space-y-1">
        <span
          className={`px-2 py-0.5 rounded-full font-medium ${priority.bgColor} ${priority.textColor}`}
        >
          {priority.label}
        </span>
        <span className="px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 block w-fit">
          {client?.name || "Cliente"}
        </span>
        <span className="px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-800 block w-fit">
          {task.category}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-2 pt-2 border-t flex justify-between items-center">
        <span>
          Prazo:{" "}
          {new Date(task.deadline + "T00:00:00-03:00").toLocaleDateString(
            "pt-BR"
          )}
        </span>
        <button
          onClick={() => onEdit(task)}
          className="text-gray-400 hover:text-blue-600"
        >
          <EditIcon />
        </button>
      </div>
    </div>
  );
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt"> | Task) => void;
  task: Task | null;
  clients: Client[];
}
export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  clients,
}) => {
  const [formData, setFormData] = useState<
    Omit<Task, "id" | "createdAt"> | Task | null
  >(null);
  useEffect(() => {
    const initialData = task || {
      title: "",
      description: "",
      deadline: new Date().toISOString().split("T")[0],
      clientId: clients[0]?.id || "",
      priority: 2,
      category: TASK_CATEGORIES[0],
      recurrence: "none",
    };
    setFormData(initialData);
  }, [task, isOpen, clients]);

  if (!isOpen || !formData) return null;
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev
        ? { ...prev, [name]: name === "priority" ? parseInt(value) : value }
        : null
    );
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData?.title || !formData?.clientId) {
      alert("Título e Cliente são obrigatórios.");
      return;
    }
    onSave(formData);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {task ? "Editar Tarefa" : "Nova Tarefa"}
          </h2>
          <button onClick={onClose}>
            <XIcon className="text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prazo Final
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="" disabled>
                  Selecione um cliente
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recorrência
              </label>
              <select
                name="recurrence"
                value={formData.recurrence}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="none">Nenhuma</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
                <option value="annually">Anualmente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prioridade
            </label>
            <div className="mt-2 flex justify-around bg-gray-100 rounded-lg p-1">
              {Object.entries(PRIORITY_MAP).map(([level, { label }]) => (
                <label
                  key={level}
                  className={`cursor-pointer w-full text-center p-2 rounded-md transition-colors ${
                    formData.priority == Number(level)
                      ? "bg-blue-600 text-white shadow"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={level}
                    checked={formData.priority == Number(level)}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  onNewTask: () => void;
  onNewClient: () => void;
}
export const Header: React.FC<HeaderProps> = ({
  currentView,
  setView,
  onNewTask,
  onNewClient,
}) => (
  <header className="p-4 bg-white border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
    <div className="flex items-center gap-2">
      <CalendarIcon className="text-blue-600 h-8 w-8" />
      <h1 className="text-2xl font-bold text-gray-800">Agenda Pro</h1>
    </div>
    <nav className="flex flex-wrap items-center gap-2">
      {["daily", "weekly", "monthly", "list", "inbox", "clients"].map(
        (view) => (
          <button
            key={view}
            onClick={() => setView(view)}
            className={`px-3 py-2 text-sm font-medium rounded-md capitalize ${
              currentView === view
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {view === "daily"
              ? "Diária"
              : view === "weekly"
              ? "Semanal"
              : view === "monthly"
              ? "Mensal"
              : view === "clients"
              ? "Clientes"
              : view}
          </button>
        )
      )}{" "}
    </nav>
    <div className="flex items-center gap-3">
      <button
        onClick={onNewClient}
        className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-2"
      >
        <PlusIcon className="w-4 h-4" /> Cliente
      </button>
      <button
        onClick={onNewTask}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
      >
        <PlusIcon className="w-4 h-4" /> Tarefa
      </button>
    </div>
  </header>
);

interface CalendarControlsProps {
  currentDate: Date;
  setDate: (date: Date) => void;
  view: string;
}
export const CalendarControls: React.FC<CalendarControlsProps> = ({
  currentDate,
  setDate,
  view,
}) => {
  const changeDate = (amount: number) => {
    const newDate = new Date(currentDate);
    if (view === "monthly") {
      newDate.setMonth(newDate.getMonth() + amount);
    } else if (view === "weekly") {
      newDate.setDate(newDate.getDate() + amount * 7);
    } else {
      newDate.setDate(newDate.getDate() + amount);
    }
    setDate(newDate);
  };
  const formatTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      year: "numeric",
    };
    if (view === "weekly") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.toLocaleDateString("pt-BR", {
          day: "numeric",
        })} - ${endOfWeek.toLocaleDateString("pt-BR", {
          day: "numeric",
        })} de ${currentDate.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })}`;
      }
    }
    if (view === "daily") {
      return currentDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return currentDate.toLocaleDateString("pt-BR", options);
  };
  return (
    <div className="flex justify-between items-center p-4">
      <h2 className="text-xl font-semibold text-gray-700 capitalize">
        {formatTitle()}
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDate(new Date())}
          className="px-3 py-1 border rounded-md text-sm"
        >
          Hoje
        </button>
        <button onClick={() => changeDate(-1)}>
          <ChevronLeftIcon />
        </button>
        <button onClick={() => changeDate(1)}>
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
