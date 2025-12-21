import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Flag, User, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Head from "next/head";

import Navbar from "app/components/Navbar";
import TaskSkeleton from "app/components/TaskSkeleton";
import CreateTaskForm from "./CreateTaskForm";

import { useMe } from "app/hooks/useMe";
import { useUsers } from "app/hooks/useUsers";
import { useTasks } from "app/hooks/useTasks";
import { connectSocket } from "app/services/socket";
import { deleteTask } from "app/services/tasks";

/* ---------------- Animations ---------------- */

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

/* ---------------- Component ---------------- */

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const [taskView, setTaskView] = useState<
    "all" | "assigned" | "created" | "overdue"
  >("all");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [createFormKey, setCreateFormKey] = useState(0);

  const { data: me, isLoading: meLoading, isError: meError } = useMe();
  const { data: users } = useUsers(!!me);
  const { data: tasks, isLoading: tasksLoading, isError: tasksError } =
    useTasks(!!me, taskView);

  const userMap = users
    ? Object.fromEntries(users.map(u => [u.id, u.name]))
    : {};

  /* ---------------- Guards ---------------- */

  useEffect(() => {
    if (meError) router.replace("/login");
  }, [meError, router]);

  useEffect(() => {
    if (!me) return;

    const socket = connectSocket(me.id);

    socket.on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    socket.on("task:updated", () => {
      queryClient.invalidateQueries({
        predicate: q => q.queryKey[0] === "tasks"
      });
    });

    socket.on("task:assigned", data => {
      toast.success(`New task assigned: ${data.title}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [me, queryClient]);

  if (meLoading) return null;
  if (!me) return null;

  if (tasksLoading) {
    return (
      <div className="p-6 space-y-3">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    );
  }

  if (tasksError) {
    return (
      <p className="p-6 text-sm text-red-600">
        Failed to load tasks
      </p>
    );
  }

  /* ---------------- Filtering ---------------- */

  const filteredTasks = tasks.filter((task: any) => {
    if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false;
    return true;
  });

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;

    await deleteTask(taskId);
    toast.success("Task deleted");

    queryClient.invalidateQueries({
      predicate: q => q.queryKey[0] === "tasks"
    });
  };

  /* ---------------- UI ---------------- */

  return (
  <>
    <Head>
        <title>Dashboard · TaskFlow</title>
      </Head>

    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <Navbar title="My Tasks" />

        <div className="mt-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-indigo-900">
                Tasks
            </h2>

            <button
                onClick={() => setShowCreate(v => !v)}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition"
            >
                {showCreate ? "Close" : "Create Task"}
            </button>
        </div>

    <AnimatePresence>
  {showCreate && (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="mt-6"
    >
        <CreateTaskForm
          key={createFormKey}
          onCreated={() => {
            toast.success("Task created");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setCreateFormKey(k => k + 1);
          }}
        />
        </motion.div>
  )}
</AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto">
          {[
            { key: "all", label: "All" },
            { key: "assigned", label: "Assigned" },
            { key: "created", label: "Created" },
            { key: "overdue", label: "Overdue" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setTaskView(tab.key as any)}
              className={`rounded-full px-4 py-1.5 text-sm transition
                ${
                  taskView === tab.key
                    ? "bg-indigo-600 text-white shadow"
                    : "border border-slate-300 bg-white/70 text-slate-600 hover:bg-white"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Priority</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>

        {/* Empty */}
        {filteredTasks.length === 0 && (
          <p className="mt-16 text-center text-sm text-slate-500">
            No tasks found.
          </p>
        )}

        {/* Task list */}
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-6 space-y-3"
        >
          <AnimatePresence>
            {filteredTasks.map((task: any) => (
              <motion.li
                key={task.id}
                variants={itemVariants}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-slate-200 bg-white/70 p-4 backdrop-blur shadow-sm"
              >
                <div className="flex justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-slate-900">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        {task.status}
                      </span>

                      <span className="flex items-center gap-1">
                        <Flag size={14} />
                        {task.priority}
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {userMap[task.assignedToId] || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/tasks/${task.id}/edit`)}
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </main>
  </>
  );
}
