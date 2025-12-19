import { zodResolver } from "@hookform/resolvers/zod";
import { createTask } from "app/services/tasks";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  onCreated: () => void;
};

const taskSchema = z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1),
        dueDate: z.string(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        assignedToId: z
            .string()
            // .trim()
            // .transform(val => (val === "" ? undefined : val))
            // .refine(
            //     val => val === undefined || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val),
            //     { message: "Invalid UUID" }
            // )
            .optional()
    });

type TaskFormData = z.infer<typeof taskSchema>;

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
        reset,
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

    return (
    <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border rounded-xl p-6 text-gray-500 mb-6 space-y-6"
    >
        <h2 className="text-lg font-semibold text-gray-900">
        Create Task
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
            <label className="block text-sm text-gray-600 mb-1">
            Title
            </label>
            <input
            {...register("title")}
            placeholder="Task title"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            {errors.title && (
            <p className="text-xs text-red-600 mt-1">
                {errors.title.message}
            </p>
            )}
        </div>

        {/* Description */}
        <div>
            <label className="block text-sm text-gray-600 mb-1">
            Description
            </label>
            <input
            {...register("description")}
            placeholder="Short description"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            {errors.description && (
            <p className="text-xs text-red-600 mt-1">
                {errors.description.message}
            </p>
            )}
        </div>

        {/* Due Date */}
        <div>
            <label className="block text-sm text-gray-600 mb-1">
            Due Date
            </label>
            <input
            type="date"
            {...register("dueDate")}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            {errors.dueDate && (
            <p className="text-xs text-red-600 mt-1">
                {errors.dueDate.message}
            </p>
            )}
        </div>

        {/* Priority */}
        <div>
            <label className="block text-sm text-gray-600 mb-1">
            Priority
            </label>
            <select
            {...register("priority")}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
            </select>
        </div>

        {/* Assigned To */}
        <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">
            Assign To (optional)
            </label>
            <input
            {...register("assignedToId")}
            placeholder="User ID"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            autoComplete="off"
            />
            {errors.assignedToId && (
            <p className="text-xs text-red-600 mt-1">
                {errors.assignedToId.message}
            </p>
            )}
        </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
        <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-6 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isSubmitting ? "Creating..." : "Create Task"}
        </button>
        </div>
    </form>
    );

}
