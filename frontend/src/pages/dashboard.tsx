import { useState } from "react";
import { useTasks } from "app/hooks/useTasks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTask } from "app/services/tasks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { connectSocket, getSocket } from "app/services/socket";
import { updateTask } from "app/services/tasks";
import TaskSkeleton from "app/components/TaskSkeleton";
import { getMe } from "app/services/auth";

const taskSchema = z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1),
        dueDate: z.string(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        assignedToId: z.string()
    });

type TaskFormData = z.infer<typeof taskSchema>;

export default function Dashboard() {
    const { data, isLoading, isError } = useTasks();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [assigneeMap, setAssigneeMap] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();

    useEffect(() => {
        async function initSocket() {
            const me = await getMe();
            console.log("ME:", me);
            const socket = connectSocket(me.id);

            socket.on("task:updated", () => {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
            });

            socket.on("task:assigned", (data) => {
                console.log("RECIEVED task:assigned", data);
                alert(`New task assigned: ${data.title}`);
            });
        }

        initSocket();

        return () => {
            const socket = getSocket();
            socket.off("task:updated");
            socket.off("task:assigned");
        }
        // socket.connect();
        
        // socket.on("task:updated", () => {
        //     queryClient.invalidateQueries({ queryKey: ["tasks"] });
        // });

        // socket.on("task:assigned", (data) => {
        //     console.log("RECIEVED task:assigned", data);
        //     alert(`New task assigned: ${data.title}`);
        // });

        // return () => {
        //     socket.off("task:updated");
        //     socket.off("task:assigned");
        // };
    }, []);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema)
    });

    const onSubmit = async (data: TaskFormData) => {
        await createTask(data);
        reset();
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-2">
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
            </div>
        )
    }

    if (isError) {
        return (
            <p className="p-4 text-red-600">
                Failed to load tasks
            </p>
        )
    }

    const filteredTasks = data.filter((task: any) => {
        if(statusFilter !== "ALL" && task.status !== statusFilter) {
            return false;
        }
        if(priorityFilter !== "ALL" && task.priority !== priorityFilter) {
            return false;
        }
        return true;
    })
    
    // Update task details (assigned to and status) handled here
    const handleUpdate = async (
        taskId: string,
        data: { status?: string, assignedToId?: string }
    ) => {
        await updateTask(taskId, data);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

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

                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create Task" }
                </button>
            </form>

            {data.length === 0 && (
                <p className="text-gray-500">No tasks yet</p>
            )}

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
                        <div>
                            <select
                                defaultValue={task.status}
                                onChange={(e) =>
                                    handleUpdate(task.id, { status: e.target.value })
                                }
                            >
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="REVIEW">REVIEW</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>

                            <input
                                placeholder="Assign to userId"
                                onBlur={(e) => {
                                    if (e.target.value) {
                                        handleUpdate(task.id, { assignedToId: e.target.value });
                                    }
                                }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}