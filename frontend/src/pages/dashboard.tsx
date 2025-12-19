import { useState } from "react";
import { useTasks } from "app/hooks/useTasks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTask } from "app/services/tasks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "app/services/socket";
import { updateTask } from "app/services/tasks";
import TaskSkeleton from "app/components/TaskSkeleton";
import { logoutUser } from "app/services/auth";
import { useRouter } from "next/router";
import { useMe } from "app/hooks/useMe";
import NotificationBell from "app/components/NotificationBell";

const taskSchema = z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1),
        dueDate: z.string(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        assignedToId: z.string()
    });

type TaskFormData = z.infer<typeof taskSchema>;

export default function Dashboard() {
    const router = useRouter();
    const [taskView, setTaskView] = useState<"all" | "assigned" | "created" | "overdue">("all");

    // Hooks
    const { 
        data: me, 
        isLoading: meLoading, 
        isError: meError
    } = useMe();

    const {
        data: tasks,
        isLoading: tasksLoading,
        isError: tasksError
    } = useTasks(!!me, taskView);

    useEffect(() => {
        if (meError) {
            router.replace("/login");
        }
    }, [meError, router]);

    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [assigneeMap, setAssigneeMap] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();
    
    useEffect(() => {
        if (!me) return;
        
        const socket = connectSocket(me.id);

        socket.on("notification:new", () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        });
        
        socket.on("task:updated", () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        });
        
        socket.on("task:assigned", (data) => {
            alert(`New task assigned: ${data.title}`);
        });
        
        return () => {
            socket.off("notification:new");
            socket.off("task:updated");
            socket.off("task:assigned");
        };
    }, [me, queryClient]);
    
    
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
    
    if (meLoading) return null;
    if (!me) return null;
    
    // Task loading
    if (tasksLoading) {
        return (
            <div className="p-4 space-y-2">
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
            </div>
        )
    }

    // No tasks found
    if (tasksError) {
        return (
            <p className="p-4 text-red-600">
                Failed to load tasks
            </p>
        )
    }

    const filteredTasks = tasks.filter((task: any) => {
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
                
                {/* Dashboard Header (My Tasks + Logout Button) */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        My Tasks
                    </h1>
                    
                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        <a href="/profile" className="text-sm text-gray-600 hover:text-black">
                            Profile
                        </a>

                        <button
                            onClick={async () => {
                                await logoutUser();
                                disconnectSocket();
                                queryClient.clear();
                                router.push("/login");
                            }}
                            className="text-sm text-gray-600 hover:text-black"
                            >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Create Task Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white border text-gray-900 rounded-lg p-4 mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Title" {...register("title")} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"/>
                        <p className="text-xs text-red-600 mt-1">{errors.title?.message}</p>
                        
                        <input placeholder="Description" {...register("description")} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"/>
                        <p className="text-xs text-red-600 mt-1">{errors.description?.message}</p>

                        <input type="date" {...register("dueDate")} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"/>
                        <p className="text-xs text-red-600 mt-1">{errors.dueDate?.message}</p>

                        <select {...register("priority")} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                            <option value="">Select priority</option>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                        </select>
                        <p className="text-xs text-red-600 mt-1">{errors.priority?.message}</p>

                        <input 
                            placeholder="Assigned To User ID"
                            {...register("assignedToId")}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <p className="text-xs text-red-600 mt-1">     {errors.assignedToId?.message}</p>
                    </div>

                    {/* Create Task Buttom */}
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isSubmitting ? "Creating..." : "Create Task" }
                    </button>
                </form>

                {/* Check if no tasks */}
                {tasks.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-12">
                        No tasks yet. Create your first task above.
                    </p>
                )}

                <div className="flex text-gray-500 gap-4 mb-6">
                    {[
                        { key: "all", label: "All Tasks" },
                        { key: "assigned", label: "Assigned to Me" },
                        { key: "created", label: "Created by Me" },
                        { key: "overdue", label: "Overdue" }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() =>
                                setTaskView(tab.key as any)
                            }
                            className={`text-sm px-3 py-1 rounded ${
                                taskView === tab.key
                                    ? "bg-black text-white"
                                    : "bg-white border"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>


                {/* Filtering based on Status and Priority */}
                <div className="flex gap-3 mb-6 text-gray-500">
                    <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-sm bg-white"
                    >
                        <option value="ALL">All Status</option>
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="REVIEW">REVIEW</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="border rounded px-3 py-2 text-sm bg-white">
                            <option value="ALL">All Priority</option>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                        </select>
                </div>

            <ul className="space-y-2">
                {filteredTasks.map((task: any) => (
                    <li key={task.id} className="bg-white text-gray-500 border rounded-lg p-4 flex justify-between gap-4">
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
        </div>
    )
}