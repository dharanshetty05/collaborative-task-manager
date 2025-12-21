import { zodResolver } from "@hookform/resolvers/zod";
import { createTask } from "app/services/tasks";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
    onCreated: () => void;
};

/* ---------------- Schemas ---------------- */

/**
 * Schema for creating a new task.
 *
 * Validation rules:
 * - Title is required and limited to 100 characters
 * - Description is mandatory to avoid empty tasks
 * - assignedToId is optional and normalized to undefined if empty
 *
 * Notes:
 * - Actual permission checks are enforced on the backend
 */
const taskSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1),
    dueDate: z.string(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    assignedToId: z.string().optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

/* ---------------- Form ---------------- */
export default function CreateTaskForm({ onCreated }: Props) {

    const defaultValues: TaskFormData = {
        title: "",
        description: "",
        dueDate: "",
        priority: "LOW",
        assignedToId: undefined
    };

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors }
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues
    });

    const onSubmit = async (data: any) => {
        await createTask({
        ...data,
        assignedToId: data.assignedToId || undefined
        });

        onCreated();
    };

    /* ---------------- UI ---------------- */
    
    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-6 space-y-8 rounded-2xl border border-slate-200 bg-white/70 p-8 text-slate-600 backdrop-blur shadow-sm"
        >
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                Create Task
            </h2>

            {/* ---------------- Form Inputs ----------------  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 tracking-wide">
                        Title
                    </label>
                    <input
                        {...register("title")}
                        placeholder="Task title"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                        {errors.title && (
                            <p className="mt-1 text-xs text-rose-600">
                                {errors.title.message}
                            </p>
                            )}
                </div>

                {/* Description */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 tracking-wide">
                        Description
                    </label>
                    <input
                        {...register("description")}
                        placeholder="Short description"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                        {errors.description && (
                            <p className="mt-1 text-xs text-rose-600">
                                {errors.description.message}
                            </p>
                        )}
                </div>

                {/* Due Date */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 tracking-wide">
                        Due Date
                    </label>
                    <input
                        type="date"
                        {...register("dueDate")}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                        {errors.dueDate && (
                            <p className="mt-1 text-xs text-rose-600">
                                {errors.dueDate.message}
                            </p>
                        )}
                </div>

                {/* Priority */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 tracking-wide">
                        Priority
                    </label>
                    <select
                        {...register("priority")}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>
                </div>

                {/* Assigned To */}
                <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500 tracking-wide">
                        Assign To (optional)
                    </label>
                    <input
                        {...register("assignedToId")}
                        placeholder="User ID"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                        autoComplete="off"
                    />
                        {errors.assignedToId && (
                            <p className="mt-1 text-xs text-rose-600">
                                {errors.assignedToId.message}
                            </p>
                        )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 transition"
                >
                    {isSubmitting ? "Creating..." : "Create Task"}
                </button>
            </div>
        </form>
    );

}
