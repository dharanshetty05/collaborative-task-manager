import { useState } from "react";
import { useTasks } from "app/hooks/useTasks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTask } from "app/services/tasks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { socket } from "app/services/socket";

const taskSchema = z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1),
        dueDate: z.string(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        assignedToId: z.string()
    });

type TaskFormData = z.infer<typeof taskSchema>;

export default function Dashboard() {
    const { data, isLoading } = useTasks();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

    const queryClient = useQueryClient();

    useEffect(() => {
        socket.on("task:updated", () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        });

        socket.on("task:assigned", (data) => {
            alert(`New task assigned: ${data.title}`);
        });

        return () => {
            socket.off("task:updated");
            socket.off("task:assigned");
        };
    }, []);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema)
    });

    const onSubmit = async (data: TaskFormData) => {
        await createTask(data);
        reset();
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    if(isLoading) return <p>Loading tasks...</p>;

    const filteredTasks = data.filter((task: any) => {
        if(statusFilter !== "ALL" && task.status !== statusFilter) {
            return false;
        }
        if(priorityFilter !== "ALL" && task.priority !== priorityFilter) {
            return false;
        }
        return true;
    })

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">My Tasks</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-2">
                <input placeholder="Title" {...register("title")} />
                <p>{errors.title?.message}</p>
                
                <input placeholder="Description" {...register("description")} />
                <p>{errors.description?.message}</p>

                <input type="date" {...register("dueDate")} />
                <p>{errors.dueDate?.message}</p>

                <select {...register("priority")}>
                    <option value="">Select priority</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                </select>
                <p>{errors.priority?.message}</p>

                <input 
                    placeholder="Assigned To User ID"
                    {...register("assignedToId")}
                />
                <p>{errors.assignedToId?.message}</p>

                <button type="submit">Create Task</button>
            </form>

            {data.length === 0 && <p>No tasks yet</p>}

            <div className="flex gap-4 mb-4">
                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Status</option>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="COMPLETED">COMPLETED</option>
                </select>

                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}>
                        <option value="ALL">All Priority</option>
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                    </select>
            </div>

            <ul className="space-y-2">
                {filteredTasks.map((task: any) => (
                    <li key={task.id} className="border p-3 rounded">
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-sm">{task.status}</p>
                        <p className="text-sm">{task.priority}</p>
                        <p className="text-sm">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}