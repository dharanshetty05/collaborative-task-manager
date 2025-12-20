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

/* ---------------- Schemas ---------------- */

const contentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1)
});

const scheduleSchema = z.object({
  dueDate: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
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
          priority: t.priority
        });

        statusForm.reset({
          status: t.status
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ---------------- Handlers ---------------- */

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 text-gray-500">
        <Navbar title="Edit Task" />

        <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-sm text-gray-600 hover:text-black flex items-center gap-1"
            >
            ← Back to Dashboard
        </button>


        {/* -------- Content -------- */}
        <section className="bg-white border rounded-xl p-6 space-y-4 mb-6">
          <h3 className="font-semibold">Content</h3>

          <input {...contentForm.register("title")} />
          <textarea {...contentForm.register("description")} />

          <button
            onClick={contentForm.handleSubmit(d =>
              updateSection(d, "Content updated")
            )}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Update Content
          </button>
        </section>

        {/* -------- Schedule -------- */}
        <section className="bg-white border rounded-xl p-6 space-y-4 mb-6">
          <h3 className="font-semibold">Schedule</h3>

          <input type="date" {...scheduleForm.register("dueDate")} />

          <select {...scheduleForm.register("priority")}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>

          <button
            onClick={scheduleForm.handleSubmit(d =>
              updateSection(d, "Schedule updated")
            )}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Update Schedule
          </button>
        </section>

        {/* -------- Status -------- */}
        <section className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Status</h3>

          <select {...statusForm.register("status")}>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <button
            onClick={statusForm.handleSubmit(d =>
              updateSection(d, "Status updated")
            )}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Update Status
          </button>
        </section>
      </div>
    </div>
  );
}
