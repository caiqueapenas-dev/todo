"use client";
import React from "react";
import {
  Calendar,
  Users,
  Inbox,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

type View = "daily" | "weekly" | "monthly" | "list" | "inbox" | "clients";

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onNewTask: () => void;
}

const navItems = [
  { id: "monthly", label: "Mensal", icon: Calendar },
  { id: "weekly", label: "Semanal", icon: Calendar },
  { id: "daily", label: "Diária", icon: Calendar },
  { id: "list", label: "Lista", icon: List },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "clients", label: "Clientes", icon: Users },
];

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setView,
  onNewTask,
}) => {
  return (
    <aside className="w-64 bg-secondary flex flex-col p-4 border-r">
      <div className="flex items-center gap-2 mb-8">
        <Calendar className="text-primary h-8 w-8" />
        <h1 className="text-2xl font-bold text-foreground">Agenda Pro</h1>
      </div>

      <button
        onClick={onNewTask}
        className="mb-6 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" /> Nova Tarefa
      </button>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === item.id
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

interface MainLayoutProps {
  children: React.ReactNode;
  currentDate: Date;
  setDate: (date: Date) => void;
  view: View;
  currentView: string;
}

const MainContentHeader: React.FC<
  Pick<MainLayoutProps, "currentDate" | "setDate" | "view">
> = ({ currentDate, setDate, view }) => {
  const changeDate = (amount: number) => {
    const newDate = new Date(currentDate);
    if (view === "monthly") newDate.setMonth(newDate.getMonth() + amount);
    else if (view === "weekly") newDate.setDate(newDate.getDate() + amount * 7);
    else newDate.setDate(newDate.getDate() + amount);
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
    <div className="flex justify-between items-center p-4 border-b">
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
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => changeDate(1)}
          className="p-1.5 border rounded-md hover:bg-accent"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentDate,
  setDate,
  view,
  currentView,
}) => {
  return (
    <div className="h-screen w-screen flex bg-background font-sans antialiased">
      <Sidebar
        currentView={view}
        setView={(v) => {
          /* handled in page */
        }}
        onNewTask={() => {
          /* handled in page */
        }}
      />
      <div className="flex-1 flex flex-col">
        {["daily", "weekly", "monthly"].includes(currentView) && (
          <MainContentHeader
            currentDate={currentDate}
            setDate={setDate}
            view={view}
          />
        )}
        <main className="flex-grow overflow-auto">{children}</main>
      </div>
    </div>
  );
};
