import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Navbar from "app/components/Navbar";
import api from "app/services/api";
import { updateTask } from "app/services/tasks";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "app/hooks/useUsers";

/* ---------------- Schemas ---------------- */

const contentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1)
});

const scheduleSchema = z.object({
  dueDate: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assignedToId: z.string().optional()
});

const statusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"])
});

type ContentData = z.infer<typeof contentSchema>;
type ScheduleData = z.infer<typeof scheduleSchema>;
type StatusData = z.infer<typeof statusSchema>;

/* ---------------- Page ---------------- */

export default function EditTaskPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const { data: users } = useUsers(true);

  const contentForm = useForm<ContentData>({
    resolver: zodResolver(contentSchema),
    defaultValues: { title: "", description: "" }
  });

  const scheduleForm = useForm<ScheduleData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { dueDate: "", priority: "LOW" }
  });

  const statusForm = useForm<StatusData>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: "TODO" }
  });

  /* ---------------- Load task ---------------- */

  useEffect(() => {
    if (!id) return;

    api.get(`/api/tasks/${id}`)
      .then(res => {
        const t = res.data;

        contentForm.reset({
          title: t.title,
          description: t.description
        });

        scheduleForm.reset({
          dueDate: t.dueDate.split("T")[0],
          priority: t.priority,
          assignedToId: t.assignedToId ?? ""
        });

        statusForm.reset({
          status: t.status
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ---------------- Handlers ---------------- */

  /**
   * Updates a task section with partial data.
   *
   * Notes:
   * - Only changed fields are sent to the backend
   * - Triggers cache invalidation for task lists
   * - Relies on backend for permission checks
   */

  const updateSection = async (data: any, successMsg: string) => {
    await updateTask(id as string, data);
    toast.success(successMsg);
    queryClient.invalidateQueries({
        predicate: query =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === "tasks"
        });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading task...
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto max-w-4xl px-6 text-slate-600">

        {/* -------- Navbar -------- */}

        <Navbar title="Edit Task" />

        <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition"
            >
            ← Back to Dashboard
        </button>


        {/* -------- Content -------- */}
        <section className="mb-6 space-y-6 rounded-2xl border border-slate-200 bg-white/70 p-8 backdrop-blur shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">Content</h3>

          <input {...contentForm.register("title")} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"/>
          <textarea {...contentForm.register("description")} className="w-full min-h-[120px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none"/>

          <button
            onClick={contentForm.handleSubmit(d =>
              updateSection(d, "Content updated")
            )}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
          >
            Update Content
          </button>
        </section>

        {/* -------- Schedule -------- */}
        <section className="mb-6 space-y-6 rounded-2xl border border-slate-200 bg-white/70 p-8 backdrop-blur shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">Schedule</h3>
            
          <input type="date" {...scheduleForm.register("dueDate")} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"/>

          <select {...scheduleForm.register("priority")} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>

          <select
            {...scheduleForm.register("assignedToId")}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          >
            <option value="">Unassigned (no owner)</option>
            {users?.map((user: { id: string, name: string }) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <button
            onClick={scheduleForm.handleSubmit(d =>
              updateSection({
                ...d,
                assignedToId: d.assignedToId || undefined
              }, "Schedule updated")
            )}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
          >
            Update Schedule
          </button>
        </section>

        {/* -------- Status -------- */}
        <section className="mb-6 space-y-6 rounded-2xl border border-slate-200 bg-white/70 p-8 backdrop-blur shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">Status</h3>

          <select {...statusForm.register("status")} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <button
            onClick={statusForm.handleSubmit(d =>
              updateSection(d, "Status updated")
            )}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
          >
            Update Status
          </button>
        </section>
      </div>
    </div>
  );
}
