
"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Task, Client, SortConfig, Holiday } from "../lib/types";
import {
  initialClients,
  initialTasks,
  PRIORITY_MAP,
  TASK_CATEGORIES,
} from "../lib/data";
import { fetchHolidays } from "../lib/holidays";
import { Edit, Plus, Trash, X } from "lucide-react";

// --- TYPE DEFINITIONS ---
type View = "monthly" | "weekly" | "daily" | "list" | "inbox" | "clients";

interface Appointment {
  id: number;
  date: string;
  time: string;
  description: string;
}

// --- MODAL AND CARD COMPONENTS ---

export const TaskModal: React.FC<any> = ({ isOpen, onClose, onSave, task, clients }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(1);
  const [recurrence, setRecurrence] = useState("none");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDeadline(task.deadline);
      setClientId(task.clientId);
      setCategory(task.category);
      setPriority(task.priority);
      setRecurrence(task.recurrence);
    } else {
      setTitle("");
      setDescription("");
      setDeadline(null);
      setClientId(clients[0]?.id || "");
      setCategory(TASK_CATEGORIES[0]);
      setPriority(1);
      setRecurrence("none");
    }
  }, [task, isOpen, clients]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      ...(task || {}),
      title,
      description,
      deadline,
      clientId,
      category,
      priority,
      recurrence,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-lg border relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {task ? "Editar Tarefa" : "Nova Tarefa"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded-md bg-transparent"
            placeholder="Título da Tarefa"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded-md bg-transparent"
            placeholder="Descrição"
          />
          <input
            type="date"
            value={deadline || ""}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border p-2 rounded-md bg-transparent"
          />
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full border p-2 rounded-md bg-transparent"
          >
            {clients.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-2 rounded-md bg-transparent"
          >
            {TASK_CATEGORIES.map((c: any) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value))}
            className="w-full border p-2 rounded-md bg-transparent"
          >
            {Object.entries(PRIORITY_MAP).map(([level, { label }]: any) => (
              <option key={level} value={level}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="w-full border p-2 rounded-md bg-transparent"
          >
            <option value="none">Não se repete</option>
            <option value="daily">Diariamente</option>
            <option value="weekly">Semanalmente</option>
            <option value="monthly">Mensalmente</option>
          </select>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export const TaskCard: React.FC<any> = ({ task, clients, onEdit, onDragStart }) => {
  const client = clients.find((c: any) => c.id === task.clientId);
  const priority = PRIORITY_MAP[task.priority as keyof typeof PRIORITY_MAP];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="p-3 rounded-lg bg-card shadow-sm border-l-4 cursor-grab active:cursor-grabbing"
      style={{ borderLeftColor: priority.color }}
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold text-sm text-foreground">{task.title}</p>
        <button onClick={() => onEdit(task)} className="text-muted-foreground hover:text-foreground">
          <Edit className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{client?.name}</p>
      <div className="flex items-center justify-between mt-2">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${priority.bgColor} ${priority.textColor}`}
        >
          {priority.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {task.category}
        </span>
      </div>
    </div>
  );
};
export const ConfirmationModal: React.FC<any> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-md border relative">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
export const Header: React.FC<any> = ({ onNewTask, setLeftView, setRightView, leftView, rightView }) => {
  return (
    <header className="p-4 bg-card border-b flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
        <div className="flex items-center gap-2">
          <select
            value={leftView}
            onChange={(e) => setLeftView(e.target.value)}
            className="bg-transparent border rounded-md p-1 text-sm"
          >
            <option value="monthly">Mensal</option>
            <option value="weekly">Semanal</option>
            <option value="daily">Diário</option>
            <option value="list">Lista</option>
            <option value="inbox">Inbox</option>
            <option value="clients">Clientes</option>
          </select>
          <select
            value={rightView}
            onChange={(e) => setRightView(e.target.value)}
            className="bg-transparent border rounded-md p-1 text-sm"
          >
            <option value="monthly">Mensal</option>
            <option value="weekly">Semanal</option>
            <option value="daily">Diário</option>
            <option value="list">Lista</option>
            <option value="inbox">Inbox</option>
            <option value="clients">Clientes</option>
          </select>
        </div>
      </div>
      <button
        onClick={onNewTask}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
      >
        <Plus className="w-5 h-5" /> Nova Tarefa
      </button>
    </header>
  );
};
export const CalendarControls: React.FC<any> = ({ currentDate, setDate, view }) => {
  const changeView = (newView: "monthly" | "weekly" | "daily") => {
    // This function should be passed down from the parent to change the main view
  };

  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    const offset = direction === "prev" ? -1 : 1;

    if (view === "daily") {
      newDate.setDate(newDate.getDate() + offset);
    } else if (view === "weekly") {
      newDate.setDate(newDate.getDate() + 7 * offset);
    } else {
      newDate.setMonth(newDate.getMonth() + offset);
    }
    setDate(newDate);
  };

  return (
    <div className="p-4 bg-card border-b flex justify-between items-center">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("prev")} className="p-2 rounded-md hover:bg-accent">
          &lt;
        </button>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button onClick={() => navigate("next")} className="p-2 rounded-md hover:bg-accent">
          &gt;
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setDate(new Date())} className="p-2 rounded-md hover:bg-accent">
          Hoje
        </button>
        <select
          value={view}
          onChange={(e) => changeView(e.target.value as any)}
          className="bg-transparent border rounded-md p-1 text-sm"
        >
          <option value="monthly">Mês</option>
          <option value="weekly">Semana</option>
          <option value="daily">Dia</option>
        </select>
      </div>
    </div>
  );
};
export const DayTasksModal: React.FC<any> = ({ isOpen, onClose, tasks, clients, selectedDate, onEditTask, onDragStart }) => {
  if (!isOpen) return null;

  const tasksForDay = tasks.filter((t: any) => t.deadline === selectedDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-lg border relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">
          Tarefas para{" "}
          {new Date(selectedDate + "T00:00:00-03:00").toLocaleDateString("pt-BR")}
        </h2>
        <div className="space-y-3">
          {tasksForDay.length > 0 ? (
            tasksForDay.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                clients={clients}
                onEdit={onEditTask}
                onDragStart={onDragStart}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma tarefa para este dia.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- VIEW COMPONENTS ---

const MonthlyView: React.FC<any> = ({ tasks, date, onDrop, onDragOver, onDragStart, onDayClick, holidays }) => {
  const getDaysInMonth = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: { date: string; isCurrentMonth: boolean }[] = [];
    const startDayIndex = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0);
    for (let i = startDayIndex; i > 0; i--) {
      const day = new Date(prevMonthLastDay);
      day.setDate(day.getDate() - i + 1);
      days.push({
        date: day.toISOString().split("T")[0],
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i).toISOString().split("T")[0],
        isCurrentMonth: true,
      });
    }
    const endDayIndex = lastDay.getDay();
    for (let i = 1; i < 7 - endDayIndex; i++) {
      const day = new Date(year, month + 1, i);
      days.push({
        date: day.toISOString().split("T")[0],
        isCurrentMonth: false,
      });
    }
    return days;
  };
  const daysOfMonth = getDaysInMonth();
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="grid grid-cols-7 flex-grow">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
        <div
          key={day}
          className="text-center font-bold text-sm text-muted-foreground p-2 border-b border-r"
        >
          {day}
        </div>
      ))}
      {daysOfMonth.map(({ date: dayDate, isCurrentMonth }) => {
        const tasksForDay = tasks.filter((t: any) => t.deadline === dayDate);
        const holiday = holidays.find((h: any) => h.date === dayDate);
        const isToday = dayDate === today;
        return (
          <div
            key={dayDate}
            onDrop={(e) => onDrop(e, dayDate)}
            onDragOver={onDragOver}
            onClick={() => onDayClick(dayDate)}
            className={`border-r border-b p-2 min-h-[120px] ${
              isCurrentMonth ? "bg-card" : "bg-muted/50"
            } transition-colors duration-300 ease-in-out hover:bg-accent cursor-pointer`}
          >
            <p
              className={`text-sm text-right ${
                !isCurrentMonth && "text-muted-foreground/50"
              } ${
                isToday
                  ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center ml-auto font-bold"
                  : ""
              }`}
            >
              {new Date(dayDate + "T00:00:00-03:00").getDate()}
            </p>
            <div className="mt-1 space-y-1">
              {holiday && (
                <div className="text-xs bg-green-100 text-green-800 p-1 rounded truncate">
                  {holiday.name}
                </div>
              )}
              {tasksForDay.slice(0, 1).map((task: any) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  className="text-xs bg-primary/10 text-primary p-1 rounded truncate cursor-grab active:cursor-grabbing"
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
              {tasksForDay.length > 2 && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                  +{tasksForDay.length - 2} mais
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
const WeeklyView: React.FC<any> = ({ tasks, clients, date, onEdit, onDrop, onDragOver, onDragStart }) => {
  const getWeekDays = () => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      return day.toISOString().split("T")[0];
    });
  };
  const weekDays = getWeekDays();
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="grid grid-cols-7 flex-grow">
      {weekDays.map((dayDate) => {
        const tasksForDay = tasks.filter((t: any) => t.deadline === dayDate);
        const d = new Date(dayDate + "T00:00:00-03:00");
        const isToday = dayDate === today;
        return (
          <div key={dayDate} className="border-r border-b p-2 flex flex-col">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground">
                {d.toLocaleDateString("pt-BR", { weekday: "short" })}
              </p>
              <p
                className={`text-lg font-bold ${
                  isToday ? "text-primary" : "text-foreground"
                }`}
              >
                {d.getDate()}
              </p>
            </div>
            <div
              onDrop={(e) => onDrop(e, dayDate)}
              onDragOver={onDragOver}
              className="flex-grow space-y-2 bg-muted/50 p-2 rounded-md min-h-[200px] hover:bg-accent transition-colors"
            >
              {tasksForDay.map((task: any) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  clients={clients}
                  onEdit={onEdit}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
const DailyView: React.FC<any> = ({ tasks, clients, date, onEdit, onDrop, onDragOver, onDragStart }) => {
  const dayDate = date.toISOString().split("T")[0];
  const tasksForDay = tasks.filter((t: any) => t.deadline === dayDate);
  return (
    <div
      className="p-4 flex-grow bg-muted/50"
      onDrop={(e) => onDrop(e, dayDate)}
      onDragOver={onDragOver}
    >
      <div className="bg-card p-4 rounded-lg shadow-md max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">
          Tarefas para{" "}
          {new Date(dayDate + "T00:00:00-03:00").toLocaleDateString("pt-BR")}
        </h3>
        {tasksForDay.length > 0 ? (
          tasksForDay.map((task: any) => (
            <TaskCard
              key={task.id}
              task={task}
              clients={clients}
              onEdit={onEdit}
              onDragStart={onDragStart}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma tarefa para hoje.
          </p>
        )}
      </div>
    </div>
  );
};
const ListView: React.FC<any> = ({ tasks, clients, onEdit, setSort, sortConfig, onTaskDelete, inlineEditing, setInlineEditing, onUpdateField }) => {
  const sortedTasks = useMemo(() => {
    let sortableItems = [...tasks];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [tasks, sortConfig]);

  const requestSort = (key: keyof Task) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSort({ key, direction });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    taskId: string,
    field: keyof Task
  ) => {
    if (e.key === "Enter") {
      onUpdateField(taskId, field, (e.target as HTMLInputElement).value);
    } else if (e.key === "Escape") {
      setInlineEditing(null);
    }
  };

  return (
    <div className="p-4">
      <div className="bg-card rounded-lg shadow-md overflow-hidden border">
        <table className="min-w-full divide-y">
          <thead className="bg-muted/50">
            <tr>
              <th
                onClick={() => requestSort("title")}
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              >
                Tarefa
              </th>
              <th
                onClick={() => requestSort("clientId")}
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              >
                Cliente
              </th>
              <th
                onClick={() => requestSort("deadline")}
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              >
                Prazo
              </th>
              <th
                onClick={() => requestSort("priority")}
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              >
                Prioridade
              </th>
              <th
                onClick={() => requestSort("category")}
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              >
                Categoria
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y">
            {sortedTasks.map((task: any) => {
              const client = clients.find((c: any) => c.id === task.clientId);
              const priority = PRIORITY_MAP[task.priority];
              const isEditing = (field: keyof Task) =>
                inlineEditing?.taskId === task.id &&
                inlineEditing?.field === field;

              return (
                <tr key={task.id} className="hover:bg-muted/50">
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() =>
                      setInlineEditing({ taskId: task.id, field: "title" })
                    }
                  >
                    {isEditing("title") ? (
                      <input
                        type="text"
                        defaultValue={task.title}
                        className="bg-transparent border-b"
                        onBlur={(e) =>
                          onUpdateField(task.id, "title", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, task.id, "title")}
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm font-medium text-foreground">
                        {task.title}
                      </div>
                    )}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground cursor-pointer"
                    onClick={() =>
                      setInlineEditing({ taskId: task.id, field: "clientId" })
                    }
                  >
                    {isEditing("clientId") ? (
                      <select
                        defaultValue={task.clientId}
                        className="bg-transparent border-b"
                        onBlur={(e) =>
                          onUpdateField(task.id, "clientId", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, task.id, "clientId")}
                        autoFocus
                      >
                        {clients.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      client?.name
                    )}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground cursor-pointer"
                    onClick={() =>
                      setInlineEditing({ taskId: task.id, field: "deadline" })
                    }
                  >
                    {isEditing("deadline") ? (
                      <input
                        type="date"
                        defaultValue={task.deadline || ""}
                        className="bg-transparent border-b"
                        onBlur={(e) =>
                          onUpdateField(task.id, "deadline", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, task.id, "deadline")}
                        autoFocus
                      />
                    ) : task.deadline ? (
                      new Date(
                        task.deadline + "T00:00:00-03:00"
                      ).toLocaleDateString("pt-BR")
                    ) : (
                      "Sem prazo"
                    )}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() =>
                      setInlineEditing({ taskId: task.id, field: "priority" })
                    }
                  >
                    {isEditing("priority") ? (
                      <select
                        defaultValue={task.priority}
                        className="bg-transparent border-b"
                        onBlur={(e) =>
                          onUpdateField(
                            task.id,
                            "priority",
                            parseInt(e.target.value)
                          )
                        }
                        onKeyDown={(e) => handleKeyDown(e, task.id, "priority")}
                        autoFocus
                      >
                        {Object.entries(PRIORITY_MAP).map(
                          ([level, { label }]: any) => (
                            <option key={level} value={level}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priority.bgColor} ${priority.textColor}`}
                      >
                        {priority.label}
                      </span>
                    )}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground cursor-pointer"
                    onClick={() =>
                      setInlineEditing({ taskId: task.id, field: "category" })
                    }
                  >
                    {isEditing("category") ? (
                      <select
                        defaultValue={task.category}
                        className="bg-transparent border-b"
                        onBlur={(e) =>
                          onUpdateField(task.id, "category", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, task.id, "category")}
                        autoFocus
                      >
                        {TASK_CATEGORIES.map((cat: any) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      task.category
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-4">
                    <button
                      onClick={() => onEdit(task)}
                      className="text-primary hover:text-primary/80"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const ClientManagerView: React.FC<any> = ({ clients, onSave, onDelete }) => {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleNew = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleSave = (clientData: Omit<Client, "id"> | Client) => {
    onSave(clientData);
    setIsClientModalOpen(false);
  };

  const ClientModal: React.FC<any> = ({ isOpen, onClose, onSave, client }) => {
    const [name, setName] = useState("");

    useEffect(() => {
      setName(client ? client.name : "");
    }, [client, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      onSave({ ...(client || {}), name });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-card rounded-lg p-6 w-full max-w-md border relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-4">
            {client ? "Editar Cliente" : "Novo Cliente"}
          </h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded-md bg-transparent"
              placeholder="Nome do Cliente"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSave}
        client={editingClient}
      />
      <div className="bg-card rounded-lg shadow-md p-6 max-w-3xl mx-auto border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Gerenciar Clientes
          </h2>
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Novo Cliente
          </button>
        </div>
        <ul className="space-y-3">
          {clients.map((client: any) => (
            <li
              key={client.id}
              className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
            >
              <span className="text-foreground">{client.name}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(client)}
                  className="text-primary"
                >
                  <Edit />
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="text-destructive"
                >
                  <Trash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
const InboxView: React.FC<any> = ({ tasks, clients, onSave, onEdit }) => {
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ""
  );

  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !selectedClientId) return;
    onSave({
      title: quickTaskTitle,
      description: "",
      deadline: null,
      clientId: selectedClientId,
      priority: 1,
      category: "Outro",
      recurrence: "none",
    });
    setQuickTaskTitle("");
  };

  const inboxTasks = tasks
    .filter((t: any) => !t.deadline)
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="p-4">
      <div className="bg-card rounded-lg shadow-md p-6 max-w-3xl mx-auto border">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Inbox / Tarefas Rápidas
        </h2>
        <form onSubmit={handleQuickAddTask} className="flex gap-2 mb-6">
          <input
            type="text"
            value={quickTaskTitle}
            onChange={(e) => setQuickTaskTitle(e.target.value)}
            placeholder="Adicionar nova tarefa rápida..."
            className="flex-grow border rounded-md shadow-sm p-2 bg-transparent"
          />
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="border rounded-md shadow-sm p-2 bg-transparent"
          >
            {clients.map((client: any) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Adicionar
          </button>
        </form>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Tarefas sem prazo
        </h3>
        <div className="space-y-3">
          {inboxTasks.length > 0 ? (
            inboxTasks.map((task: any) => (
              <div
                key={task.id}
                className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      PRIORITY_MAP[task.priority].color
                    }`}
                  ></div>
                  <div>
                    <p className="text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {clients.find((c: any) => c.id === task.clientId)?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onEdit(task)}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  Detalhes
                </button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma tarefa sem prazo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN UI COMPONENT ---

const AgendaUI: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [addButtonText, setAddButtonText] = useState('Adicionar');

  const [leftView, setLeftView] = useState<View>("monthly");
  const [rightView, setRightView] = useState<View>("inbox");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "deadline",
    direction: "ascending",
  });
  const [inlineEditing, setInlineEditing] = useState<{
    taskId: string;
    field: keyof Task;
  } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  }>({ isOpen: false, title: "", message: "", onConfirm: null });
  const [dayTasksModalState, setDayTasksModalState] = useState<{
    isOpen: boolean;
    date: string | null;
  }>({ isOpen: false, date: null });

  // --- USE EFFECT HOOKS ---

  useEffect(() => {
    const storedAppointments = localStorage.getItem('appointments-dark');
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }
  }, []);

  useEffect(() => {
    const getHolidays = async () => {
      const year = new Date().getFullYear();
      const fetchedHolidays = await fetchHolidays(year);
      setHolidays(fetchedHolidays);
    };
    getHolidays();
  }, []);

  useEffect(() => {
    renderAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    const handleListClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const removeButton = target.closest('.remove-btn');
      if (removeButton) {
        const id = Number(removeButton.getAttribute('data-id'));
        removeAppointment(id);
      }
    };

    const appointmentList = document.getElementById('appointmentList');
    if (appointmentList) {
      appointmentList.addEventListener('click', handleListClick);
    }

    return () => {
      if (appointmentList) {
        appointmentList.removeEventListener('click', handleListClick);
      }
    };
  }, [appointments]);

  // --- FUNCTIONS ---

  const renderAppointments = (apps: Appointment[]) => {
    const appointmentList = document.getElementById('appointmentList');
    if (!appointmentList) return;

    appointmentList.innerHTML = '';

    if (apps.length === 0) {
      appointmentList.innerHTML = '<p id="emptyMessage" class="text-slate-500 text-center py-8">Você está livre. Nenhum compromisso agendado!</p>';
      return;
    }

    const sortedAppointments = apps.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    sortedAppointments.forEach(app => {
      const appointmentElement = document.createElement('div');
      appointmentElement.className = 'bg-gray-700/50 p-4 rounded-lg flex items-center justify-between gap-4 border border-transparent hover:border-teal-500/50 transition-all';

      const formattedDate = new Date(`${app.date}T00:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });

      appointmentElement.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="text-center bg-gray-900/50 rounded-md px-3 py-1 border border-gray-600">
            <p class="font-bold text-teal-400 text-lg">${formattedDate.split(' ')[0]}</p>
            <p class="text-xs text-slate-400 uppercase">${formattedDate.split(' ')[2]}</p>
          </div>
          <div>
            <p class="font-semibold text-slate-100">${app.description}</p>
            <p class="text-sm text-slate-400">${app.time}</p>
          </div>
        </div>
        <button data-id="${app.id}" class="remove-btn flex-shrink-0 text-gray-500 hover:text-red-500 hover:scale-110 transition-all p-2 rounded-full hover:bg-red-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m3 0l-.5 8.5a.5.5 0 1 0 .998.06l.5-8.5a.5.5 0 1 0-.998.06m2.5.029l-.5 8.5a.5.5 0 1 0 .998-.06l.5-8.5a.5.5 0 1 0-.998.06"/>
          </svg>
        </button>
      `;
      appointmentList.appendChild(appointmentElement);
    });
  };

  const saveAndRender = (apps: Appointment[]) => {
    localStorage.setItem('appointments-dark', JSON.stringify(apps));
    renderAppointments(apps);
  };

  const addAppointment = () => {
    if (!date || !time || !description.trim()) {
      setAddButtonText('Preencha todos os campos!');
      setTimeout(() => {
        setAddButtonText('Adicionar');
      }, 2000);
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now(),
      date,
      time,
      description: description.trim()
    };

    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    saveAndRender(updatedAppointments);

    setDate('');
    setTime('');
    setDescription('');
  };

  const removeAppointment = (id: number) => {
    const updatedAppointments = appointments.filter(app => app.id !== id);
    setAppointments(updatedAppointments);
    saveAndRender(updatedAppointments);
  };

  const handleUpdateTaskField = (
    taskId: string,
    field: keyof Task,
    value: any
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    );
    setInlineEditing(null);
  };

  const handleDayClick = (date: string) => {
    setDayTasksModalState({ isOpen: true, date });
  };

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt"> | Task) => {
    if ("id" in taskData) {
      setTasks(tasks.map((t) => (t.id === taskData.id ? taskData : t)));
    } else {
      setTasks([
        ...tasks,
        {
          ...taskData,
          id: `task_${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleTaskDelete = (taskId: string) => {
    setConfirmState({
      isOpen: true,
      title: "Excluir Tarefa",
      message:
        "Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.",
      onConfirm: () => {
        setTasks(tasks.filter((t) => t.id !== taskId));
        setConfirmState({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  };

  const handleSaveClient = (clientData: Omit<Client, "id"> | Client) => {
    if ("id" in clientData) {
      setClients(clients.map((c) => (c.id === clientData.id ? clientData : c)));
    } else {
      setClients([...clients, { ...clientData, id: `cli_${Date.now()}` }]);
    }
  };

  const handleClientDelete = (clientId: string) => {
    setConfirmState({
      isOpen: true,
      title: "Excluir Cliente",
      message:
        "Excluir este cliente também removerá todas as suas tarefas associadas. Deseja continuar?",
      onConfirm: () => {
        setClients(clients.filter((c) => c.id !== clientId));
        setTasks(tasks.filter((t) => t.clientId !== clientId));
        setConfirmState({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, newDate: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    setTasks((p) =>
      p.map((t) => (t.id === taskId ? { ...t, deadline: newDate } : t))
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderView = (view: View) => {
    const props = {
      tasks,
      clients,
      date: currentDate,
      onEdit: handleEditTask,
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      onDragStart: handleDragStart,
    };
    switch (view) {
      case "daily":
        return <DailyView {...props} />;
      case "weekly":
        return <WeeklyView {...props} />;
      case "monthly":
        return (
          <MonthlyView
            {...props}
            holidays={holidays}
            onDayClick={handleDayClick}
          />
        );
      case "list":
        return (
          <ListView
            tasks={tasks}
            clients={clients}
            onEdit={handleEditTask}
            setSort={setSortConfig}
            sortConfig={sortConfig}
            onTaskDelete={handleTaskDelete}
            inlineEditing={inlineEditing}
            setInlineEditing={setInlineEditing}
            onUpdateField={handleUpdateTaskField}
          />
        );
      case "clients":
        return (
          <ClientManagerView
            clients={clients}
            onSave={handleSaveClient}
            onDelete={handleClientDelete}
          />
        );
      case "inbox":
        return (
          <InboxView
            tasks={tasks}
            clients={clients}
            onSave={handleSaveTask}
            onEdit={handleEditTask}
          />
        );
      default:
        return (
          <MonthlyView
            {...props}
            holidays={holidays}
            onDayClick={handleDayClick}
          />
        );
    }
  };

  // --- RENDER METHOD ---

  return (
    <div className="w-full h-full flex space-x-4">
      {/* Coluna da Esquerda - To-Do List */}
      <div className="w-1/2 h-full bg-gray-800 rounded-2xl shadow-2xl shadow-black/30 p-6 md:p-8 border border-gray-700 flex flex-col">
        <Header
          onNewTask={handleNewTask}
          setLeftView={setLeftView}
          setRightView={setRightView}
          leftView={leftView}
          rightView={rightView}
        />
        {["daily", "weekly", "monthly"].includes(leftView) && (
          <CalendarControls
            currentDate={currentDate}
            setDate={setCurrentDate}
            view={leftView}
          />
        )}
        <main className="flex-grow overflow-auto">{renderView(leftView)}</main>
      </div>

      {/* Coluna da Direita - Agenda */}
      <div className="w-1/2 h-full bg-gray-800 rounded-2xl shadow-2xl shadow-black/30 p-6 md:p-8 border border-gray-700 flex flex-col">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Agenda PRO</h1>
          <p className="text-slate-400 mt-2">Seus compromissos, em um só lugar.</p>
        </header>

        <div className="bg-black/20 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold mb-5 text-slate-100">Adicionar Compromisso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label htmlFor="date" className="block text-sm font-medium text-slate-400 mb-1">Data</label>
              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-700 text-slate-200 px-4 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="time" className="block text-sm font-medium text-slate-400 mb-1">Hora</label>
              <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-700 text-slate-200 px-4 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700 text-slate-200 px-4 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" placeholder="Ex: Reunião de alinhamento semanal..."></textarea>
            </div>
          </div>
          <button id="addButton" onClick={addAppointment} className={`mt-5 w-full text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${!date || !time || !description.trim() ? 'bg-teal-500 hover:bg-teal-600' : 'bg-teal-500 hover:bg-teal-600'}`}>
            {addButtonText}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Próximos Compromissos</h2>
          <div id="appointmentList" className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {/* Appointments will be rendered here */}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        clients={clients}
      />
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() =>
          setConfirmState({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
        onConfirm={confirmState.onConfirm!}
        title={confirmState.title}
        message={confirmState.message}
      />
      <DayTasksModal
        isOpen={dayTasksModalState.isOpen}
        onClose={() => setDayTasksModalState({ isOpen: false, date: null })}
        tasks={tasks}
        clients={clients}
        selectedDate={dayTasksModalState.date}
        onEditTask={handleEditTask}
        onDragStart={handleDragStart}
      />
    </div>
  );
};

export default AgendaUI;
