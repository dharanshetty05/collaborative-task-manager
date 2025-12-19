import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Navbar from "app/components/Navbar";
import api from "app/services/api";
import { updateTask } from "app/services/tasks";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    dueDate: z.string(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    assignedToId: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function EditTaskPage() {
    const router = useRouter();
    const { id } = router.query;
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    // Load task
    const hasLoaded = useRef(false);
    useEffect(() => {
        if (!id || hasLoaded.current) return;

        api.get(`/api/tasks/${id}`).then(res => {
        const task = res.data;
        reset({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate.split("T")[0],
            priority: task.priority,
            assignedToId: task.assignedToId
        });
        hasLoaded.current = true;
        });
    }, [id, reset]);


    const onSubmit = async (data: FormData) => {
        const res = await updateTask(id as string, data);
        console.log("UPDATED TASK RESPONSE:", res);

        toast.success("Task updated");
        await queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-gray-500">
            <Navbar title="Edit Task" />

            <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white border rounded-xl p-6 space-y-4"
            >
            <input {...register("title")} />
            <textarea {...register("description")} />
            <input type="date" {...register("dueDate")} />

            <select {...register("priority")}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
            </select>

            <div className="flex justify-end gap-3">
                <button
                type="button"
                onClick={() => router.back()}
                className="text-sm text-gray-600"
                >
                Cancel
                </button>

                <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-4 py-2 rounded"
                >
                Save Changes
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}
