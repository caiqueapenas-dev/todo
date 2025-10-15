"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Task, Client, SortConfig } from "../lib/types";
import { initialClients, initialTasks, PRIORITY_MAP } from "../lib/data";
import {
  Header,
  CalendarControls,
  TaskModal,
  TaskCard,
  EditIcon,
  TrashIcon,
  PlusIcon,
  ConfirmationModal,
} from "../components/AgendaUI";

// --- VIEW PROPS ---
interface ViewProps {
  tasks: Task[];
  clients: Client[];
  onEdit: (task: Task) => void;
  onDrop: (e: React.DragEvent, newDate: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}
interface CalendarViewProps extends ViewProps {
  date: Date;
}

// --- VIEWS ---
const MonthlyView: React.FC<Omit<CalendarViewProps, "clients" | "onEdit">> = ({
  tasks,
  date,
  onDrop,
  onDragOver,
  onDragStart,
}) => {
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
          className="text-center font-bold text-sm text-gray-600 p-2 border-b border-r"
        >
          {day}
        </div>
      ))}
      {daysOfMonth.map(({ date: dayDate, isCurrentMonth }) => {
        const tasksForDay = tasks.filter((t) => t.deadline === dayDate);
        const isToday = dayDate === today;
        return (
          <div
            key={dayDate}
            onDrop={(e) => onDrop(e, dayDate)}
            onDragOver={onDragOver}
            className={`border-r border-b p-2 min-h-[120px] ${
              isCurrentMonth ? "bg-white" : "bg-gray-50"
            } transition-colors duration-300 ease-in-out hover:bg-blue-50`}
          >
            <p
              className={`text-sm text-right ${
                !isCurrentMonth && "text-gray-400"
              } ${
                isToday
                  ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto font-bold"
                  : ""
              }`}
            >
              {new Date(dayDate + "T00:00:00-03:00").getDate()}
            </p>
            <div className="mt-1 space-y-1">
              {tasksForDay.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate cursor-grab active:cursor-grabbing"
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
              {tasksForDay.length > 2 && (
                <p className="text-xs text-gray-500 text-center mt-1">
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
const WeeklyView: React.FC<CalendarViewProps> = ({
  tasks,
  clients,
  date,
  onEdit,
  onDrop,
  onDragOver,
  onDragStart,
}) => {
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
        const tasksForDay = tasks.filter((t) => t.deadline === dayDate);
        const d = new Date(dayDate + "T00:00:00-03:00");
        const isToday = dayDate === today;
        return (
          <div key={dayDate} className="border-r border-b p-2 flex flex-col">
            <div className="text-center mb-2">
              <p className="text-sm text-gray-500">
                {d.toLocaleDateString("pt-BR", { weekday: "short" })}
              </p>
              <p
                className={`text-lg font-bold ${
                  isToday ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {d.getDate()}
              </p>
            </div>
            <div
              onDrop={(e) => onDrop(e, dayDate)}
              onDragOver={onDragOver}
              className="flex-grow space-y-2 bg-gray-50 p-2 rounded-md min-h-[200px] hover:bg-blue-50 transition-colors"
            >
              {tasksForDay.map((task) => (
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
const DailyView: React.FC<CalendarViewProps> = ({
  tasks,
  clients,
  date,
  onEdit,
  onDrop,
  onDragOver,
  onDragStart,
}) => {
  const dayDate = date.toISOString().split("T")[0];
  const tasksForDay = tasks.filter((t) => t.deadline === dayDate);
  return (
    <div
      className="p-4 flex-grow bg-gray-50"
      onDrop={(e) => onDrop(e, dayDate)}
      onDragOver={onDragOver}
    >
      <div className="bg-white p-4 rounded-lg shadow-md max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
          Tarefas para{" "}
          {new Date(dayDate + "T00:00:00-03:00").toLocaleDateString("pt-BR")}
        </h3>
        {tasksForDay.length > 0 ? (
          tasksForDay.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              clients={clients}
              onEdit={onEdit}
              onDragStart={onDragStart}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            Nenhuma tarefa para hoje.
          </p>
        )}
      </div>
    </div>
  );
};

interface ListViewProps {
  tasks: Task[];
  clients: Client[];
  onEdit: (task: Task) => void;
  setSort: (config: SortConfig) => void;
  sortConfig: SortConfig;
  onTaskDelete: (taskId: string) => void;
}
const ListView: React.FC<ListViewProps> = ({
  tasks,
  clients,
  onEdit,
  setSort,
  sortConfig,
  onTaskDelete,
}) => {
  const sortedTasks = useMemo(() => {
    let sortableItems = [...tasks];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "ascending" ? 1 : -1;
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
  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => requestSort("title")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Tarefa
              </th>
              <th
                onClick={() => requestSort("clientId")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Cliente
              </th>
              <th
                onClick={() => requestSort("deadline")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Prazo
              </th>
              <th
                onClick={() => requestSort("priority")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Prioridade
              </th>
              <th
                onClick={() => requestSort("category")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Categoria
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.map((task) => {
              const client = clients.find((c) => c.id === task.clientId);
              const priority = PRIORITY_MAP[task.priority];
              return (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(
                      task.deadline + "T00:00:00-03:00"
                    ).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priority.bgColor} ${priority.textColor}`}
                    >
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-4">
                    <button
                      onClick={() => onEdit(task)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
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

interface ClientManagerProps {
  clients: Client[];
  onSave: (client: Omit<Client, "id"> | Client) => void;
  onDelete: (clientId: string) => void;
}
const ClientManagerView: React.FC<ClientManagerProps> = ({
  clients,
  onSave,
  onDelete,
}) => {
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
  interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Omit<Client, "id"> | Client) => void;
    client: Client | null;
  }
  const ClientModal: React.FC<ClientModalProps> = ({
    isOpen,
    onClose,
    onSave,
    client,
  }) => {
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
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            {client ? "Editar Cliente" : "Novo Cliente"}
          </h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded-md"
              placeholder="Nome do Cliente"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
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
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Gerenciar Clientes
          </h2>
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Novo Cliente
          </button>
        </div>
        <ul className="space-y-3">
          {clients.map((client) => (
            <li
              key={client.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
            >
              <span className="text-gray-700">{client.name}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(client)}
                  className="text-blue-600"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="text-red-600"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

interface InboxProps {
  tasks: Task[];
  clients: Client[];
  onSave: (task: Omit<Task, "id" | "createdAt">) => void;
  onEdit: (task: Task) => void;
}
const InboxView: React.FC<InboxProps> = ({
  tasks,
  clients,
  onSave,
  onEdit,
}) => {
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !clients.length) return;
    onSave({
      title: quickTaskTitle,
      description: "",
      deadline: new Date().toISOString().split("T")[0],
      clientId: clients[0].id,
      priority: 1,
      category: "Outro",
      recurrence: "none",
    });
    setQuickTaskTitle("");
  };
  const inboxTasks = tasks
    .filter(
      (t) => new Date(t.createdAt).toDateString() === new Date().toDateString()
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Inbox / Tarefas Rápidas
        </h2>
        <form onSubmit={handleQuickAddTask} className="flex gap-2 mb-6">
          <input
            type="text"
            value={quickTaskTitle}
            onChange={(e) => setQuickTaskTitle(e.target.value)}
            placeholder="Adicionar nova tarefa rápida..."
            className="flex-grow border border-gray-300 rounded-md shadow-sm p-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Adicionar
          </button>
        </form>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Tarefas adicionadas recentemente
        </h3>
        <div className="space-y-3">
          {inboxTasks.length > 0 ? (
            inboxTasks.map((task) => (
              <div
                key={task.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      PRIORITY_MAP[task.priority].color
                    }`}
                  ></div>
                  <div>
                    <p className="text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      {clients.find((c) => c.id === task.clientId)?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onEdit(task)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Detalhes
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma tarefa adicionada hoje.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function AgendaPage() {
  const [currentView, setView] = useState("monthly");
  const [currentDate, setDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "deadline",
    direction: "ascending",
  });
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  }>({ isOpen: false, title: "", message: "", onConfirm: null });

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

  const renderView = () => {
    const props = {
      tasks,
      clients,
      date: currentDate,
      onEdit: handleEditTask,
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      onDragStart: handleDragStart,
    };
    switch (currentView) {
      case "daily":
        return <DailyView {...props} />;
      case "weekly":
        return <WeeklyView {...props} />;
      case "monthly":
        return <MonthlyView {...props} />;
      case "list":
        return (
          <ListView
            tasks={tasks}
            clients={clients}
            onEdit={handleEditTask}
            setSort={setSortConfig}
            sortConfig={sortConfig}
            onTaskDelete={handleTaskDelete}
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
        return <MonthlyView {...props} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 font-sans flex flex-col antialiased">
      <Header
        currentView={currentView}
        setView={setView}
        onNewTask={handleNewTask}
        onNewClient={() => setView("clients")}
      />
      {["daily", "weekly", "monthly"].includes(currentView) && (
        <CalendarControls
          currentDate={currentDate}
          setDate={setDate}
          view={currentView}
        />
      )}
      <main className="flex-grow overflow-auto">{renderView()}</main>
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
    </div>
  );
}
