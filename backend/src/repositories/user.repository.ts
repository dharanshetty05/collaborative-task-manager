import prisma from "../utils/prisma";
import { User } from "@prisma/client";

export class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id }
        });
    }

    async create(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<User> {
        return prisma.user.create({ data });
    }

    async updateName(userId: string, name: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { name },
            select: {
                id: true,
                name: true,
                email: true
            }
        });
    }
}