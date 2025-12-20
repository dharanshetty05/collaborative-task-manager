import { useState } from "react";
import { useTasks } from "app/hooks/useTasks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "app/services/socket";
import TaskSkeleton from "app/components/TaskSkeleton";
import { useRouter } from "next/router";
import { useMe } from "app/hooks/useMe";
import { useUsers } from "app/hooks/useUsers";
import CreateTaskForm from "./CreateTaskForm";
import toast from "react-hot-toast";
import Navbar from "app/components/Navbar";
import { deleteTask } from "app/services/tasks";

export default function Dashboard() {
    const router = useRouter();
    const [taskView, setTaskView] = useState<"all" | "assigned" | "created" | "overdue">("all");
    const [createFormKey, setCreateFormKey] = useState(0);
    
    // Hooks
    const { 
        data: me, 
        isLoading: meLoading, 
        isError: meError
    } = useMe();

    const {
        data: users,
        isLoading: usersLoading
    } = useUsers(!!me);

    const userMap = users
    ? Object.fromEntries(users.map(u => [u.id, u.name]))
    : {};

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

    const queryClient = useQueryClient();
    
    useEffect(() => {
        if (!me) return;
        
        const socket = connectSocket(me.id);

        socket.on("notification:new", () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        });
        
        socket.on("task:updated", () => {
            queryClient.invalidateQueries({
            predicate: query =>
                Array.isArray(query.queryKey) &&
                query.queryKey[0] === "tasks"
            });

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
    
        
    
    if (meLoading) return null;
    if (!me) return null;
    if (usersLoading) return null;
    
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

    const handleDelete = async (taskId: string) => {
        if (!confirm("Delete this task?")) return;

        await deleteTask(taskId);
        toast.success("Task deleted");
        queryClient.invalidateQueries({
            predicate: query =>
                Array.isArray(query.queryKey) &&
                query.queryKey[0] === "tasks"
        });

    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
                
                <Navbar title="My Tasks" />
                <CreateTaskForm
                    key={createFormKey}
                    onCreated={() => {
                        toast.success("Task created");
                        queryClient.invalidateQueries({ queryKey: ["tasks"] });
                        setCreateFormKey(k => k + 1);
                    }}
                />

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
                        <p className="text-xs text-gray-500">
                            Assigned to:{" "}
                            {userMap[task.assignedToId] || "Unknown"}
                        </p>

                        {/* Edit and Delete */}
                        <div className="flex flex-col gap-1">
                            <button
                            onClick={() => router.push(`/tasks/${task.id}/edit`)}
                            className="text-xs text-blue-600 hover:underline"
                            >
                            Edit
                            </button>

                            <button
                                onClick={() => handleDelete(task.id)}
                                className="text-xs text-red-600 hover:underline"
                                >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        </div>
    )
}