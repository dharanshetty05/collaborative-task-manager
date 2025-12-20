// Unit tests for TaskService.createTask business logic

jest.mock("../src/server", () => ({
    io: {
        emit: jest.fn(),
        to: jest.fn().mockReturnThis()
    }
}));

jest.mock("../src/repositories/task.repository", () => {
    return {
        TaskRepository: class {
            create = jest.fn();
        }
    };
});

jest.mock("../src/repositories/notification.repository", () => {
    return {
        NotificationRepository: class {
            create = jest.fn();
        }
    };
});


import { TaskService } from "../src/services/task.service";
import { TaskRepository } from "../src/repositories/task.repository";
import { io } from "../src/server";
import { NotificationRepository } from "../src/repositories/notification.repository";


describe("TaskService.createTask", () => {
    it("assigns task to creator when assignedToId is not provided", async () => {
        const service = new TaskService();

        const mockTask = {
        id: "task-1",
        title: "Test Task",
        description: "Desc",
        creatorId: "user-1",
        assignedToId: "user-1",
        status: "TODO"
        };

        const taskRepoInstance = (service as any).taskRepo;


        taskRepoInstance.create.mockResolvedValue(mockTask);

        const result = await service.createTask({
        title: "Test Task",
        description: "Desc",
        dueDate: new Date(),
        priority: "HIGH" as any,
        creatorId: "user-1"
        });

        expect(taskRepoInstance.create).toHaveBeenCalledWith(
        expect.objectContaining({
            creatorId: "user-1",
            assignedToId: "user-1",
            status: "TODO"
        })
        );

        expect(result.assignedToId).toBe("user-1");
    });

    it("creates notification and emits socket event when assigned to another user", async () => {
        const service = new TaskService();

        const taskRepoInstance = (service as any).taskRepo;
        const notificationRepoInstance = (service as any).notificationRepo;

        const mockTask = {
            id: "task-2",
            title: "Assigned Task",
            creatorId: "user-1",
            assignedToId: "user-2",
            status: "TODO"
        };

        taskRepoInstance.create.mockResolvedValue(mockTask);

        notificationRepoInstance.create.mockResolvedValue({
            id: "notif-1"
        });

        await service.createTask({
            title: "Assigned Task",
            description: "Desc",
            dueDate: new Date(),
            priority: "HIGH" as any,
            creatorId: "user-1",
            assignedToId: "user-2"
        });

        expect(notificationRepoInstance.create).toHaveBeenCalled();
    });

    it("broadcasts task:updated event after task creation", async () => {
        const service = new TaskService();

        const taskRepoInstance = (service as any).taskRepo;

        const mockTask = {
            id: "task-3",
            title: "Broadcast Task",
            creatorId: "user-1",
            assignedToId: "user-1",
            status: "TODO"
        };

        taskRepoInstance.create.mockResolvedValue(mockTask);

        await service.createTask({
            title: "Broadcast Task",
            description: "Desc",
            dueDate: new Date(),
            priority: "LOW" as any,
            creatorId: "user-1"
        });

        const { io } = require("../src/server");

        expect(io.emit).toHaveBeenCalledWith(
            "task:updated",
            mockTask
        );
    });

});
