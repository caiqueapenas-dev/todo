"use client";
import React, { useState, useEffect } from "react";
import type { Task, Client, Holiday } from "../lib/types";
import { PRIORITY_MAP, TASK_CATEGORIES } from "../lib/data";
import {
  Edit,
  Trash,
  X,
  Calendar as CalendarIcon,
  Plus as PlusIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Combobox } from "@headlessui/react";

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

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
      className="bg-card p-3 rounded-lg shadow-sm border cursor-grab active:cursor-grabbing mb-2 group"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-card-foreground text-sm">{task.title}</h4>
        <div
          className={`w-3 h-3 rounded-full ${priority.color} flex-shrink-0 ml-2`}
          title={`Prioridade: ${priority.label}`}
        ></div>
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {task.description}
      </p>
      <div className="text-xs mt-3 flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-0.5 rounded-full font-medium text-xs ${priority.bgColor} ${priority.textColor}`}
        >
          {priority.label}
        </span>
        <span className="px-2 py-0.5 rounded-full font-medium text-xs bg-primary/10 text-primary">
          {client?.name || "Cliente"}
        </span>
        <span className="px-2 py-0.5 rounded-full font-medium text-xs bg-secondary text-secondary-foreground">
          {task.category}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-2 pt-2 border-t flex justify-between items-center">
        <span>
          Prazo:{" "}
          {task.deadline
            ? new Date(task.deadline + "T00:00:00-03:00").toLocaleDateString(
                "pt-BR"
              )
            : "A definir"}
        </span>
        <button
          onClick={() => onEdit(task)}
          className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="w-4 h-4" />
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
  const [formData, setFormData] = React.useState<
    Omit<Task, "id" | "createdAt"> | Task | null
  >(null);
  React.useEffect(() => {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {task ? "Editar Tarefa" : "Nova Tarefa"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Título
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full bg-transparent border border-input rounded-md shadow-sm p-2 focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full bg-transparent border border-input rounded-md shadow-sm p-2 focus:ring-1 focus:ring-ring"
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Prazo Final
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline || ""}
                onChange={handleChange}
                className="mt-1 block w-full bg-transparent border border-input rounded-md shadow-sm p-2 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Cliente
              </label>
              <Combobox
                as="div"
                value={formData.clientId}
                onChange={(value: string) =>
                  setFormData((prev) =>
                    prev ? { ...prev, clientId: value } : null
                  )
                }
              >
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full rounded-md border border-input bg-transparent py-2 pl-3 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      /* Você pode lidar com a filtragem aqui se quiser */
                    }}
                    displayValue={(clientId: string) =>
                      clients.find((c) => c.id === clientId)?.name || ""
                    }
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                    <ChevronsUpDown
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>

                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {clients.map((client) => (
                      <Combobox.Option
                        key={client.id}
                        value={client.id}
                        className={({ active }: { active: boolean }) =>
                          classNames(
                            "relative cursor-default select-none py-2 pl-3 pr-9",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground"
                          )
                        }
                      >
                        {({
                          active,
                          selected,
                        }: {
                          active: boolean;
                          selected: boolean;
                        }) => (
                          <>
                            <span
                              className={classNames(
                                "block truncate",
                                selected && "font-semibold"
                              )}
                            >
                              {client.name}
                            </span>
                            {selected && (
                              <span
                                className={classNames(
                                  "absolute inset-y-0 right-0 flex items-center pr-4",
                                  active ? "text-white" : "text-primary"
                                )}
                              >
                                <Check className="h-5 w-5" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full bg-transparent border border-input rounded-md shadow-sm p-2 focus:ring-1 focus:ring-ring"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Recorrência
              </label>
              <select
                name="recurrence"
                value={formData.recurrence}
                onChange={handleChange}
                className="mt-1 block w-full bg-transparent border border-input rounded-md shadow-sm p-2 focus:ring-1 focus:ring-ring"
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
            <label className="text-sm font-medium text-muted-foreground">
              Prioridade
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
              {Object.entries(PRIORITY_MAP).map(([level, { label }]) => (
                <label
                  key={level}
                  className={`cursor-pointer text-center p-2 rounded-md transition-colors text-sm font-semibold ${
                    formData.priority == Number(level)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-accent"
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
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Salvar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

type View = "monthly" | "weekly" | "daily" | "list" | "inbox" | "clients";

interface HeaderProps {
  setLeftView: (view: View) => void;
  setRightView: (view: View) => void;
  leftView: View;
  rightView: View;
  onNewTask: () => void;
}

const views: { id: View; label: string }[] = [
  { id: "monthly", label: "Mensal" },
  { id: "weekly", label: "Semanal" },
  { id: "daily", label: "Diária" },
  { id: "list", label: "Lista" },
  { id: "inbox", label: "Inbox" },
  { id: "clients", label: "Clientes" },
];

export const Header: React.FC<HeaderProps> = ({
  setLeftView,
  setRightView,
  leftView,
  rightView,
  onNewTask,
}) => (
  <header className="p-4 bg-card border-b flex flex-wrap justify-between items-center gap-4">
    <div className="flex items-center gap-2">
      <CalendarIcon className="text-primary h-8 w-8" />
      <h1 className="text-2xl font-bold text-foreground">Agenda Pro</h1>
    </div>
    <div className="flex items-center gap-4">
      <div>
        <label className="text-xs text-muted-foreground">Coluna Esquerda</label>
        <select
          value={leftView}
          onChange={(e) => setLeftView(e.target.value as View)}
          className="bg-secondary p-1 rounded-md text-sm"
        >
          {views.map((view) => (
            <option key={view.id} value={view.id}>
              {view.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Coluna Direita</label>
        <select
          value={rightView}
          onChange={(e) => setRightView(e.target.value as View)}
          className="bg-secondary p-1 rounded-md text-sm"
        >
          {views.map((view) => (
            <option key={view.id} value={view.id}>
              {view.label}
            </option>
          ))}
        </select>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onNewTask}
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
      >
        <PlusIcon className="w-4 h-4" /> Nova Tarefa
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
    <div className="flex justify-between items-center p-4 bg-card border-b">
      <h2 className="text-xl font-semibold text-foreground capitalize">
        {formatTitle()}
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDate(new Date())}
          className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-accent"
        >
          Hoje
        </button>
        <button
          onClick={() => changeDate(-1)}
          className="p-1.5 border rounded-md hover:bg-accent"
        >
          <ChevronLeftIcon />
        </button>
        <button
          onClick={() => changeDate(1)}
          className="p-1.5 border rounded-md hover:bg-accent"
        >
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 w-full max-w-sm shadow-xl border">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-accent text-sm font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 text-sm font-semibold"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

interface DayTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  clients: Client[];
  selectedDate: string | null;
  onEditTask: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export const DayTasksModal: React.FC<DayTasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
  clients,
  selectedDate,
  onEditTask,
  onDragStart,
}) => {
  if (!isOpen || !selectedDate) return null;

  const tasksForDay = tasks.filter((t) => t.deadline === selectedDate);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-foreground">
            Tarefas para{" "}
            {new Date(selectedDate + "T00:00:00-03:00").toLocaleDateString(
              "pt-BR"
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow pr-2">
          {tasksForDay.length > 0 ? (
            <div className="space-y-3">
              {tasksForDay.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  clients={clients}
                  onEdit={onEditTask}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Nenhuma tarefa para este dia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
