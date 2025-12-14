import { UserRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";

export class AuthService {
    private userRepo = new UserRepository();

    async register(name: string, email: string, password: string) {
        const existingUser = await this.userRepo.findByEmail(email);
        if(existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await hashPassword(password);
        const user = await this.userRepo.create({
            name,
            email,
            password: hashedPassword
        });

        const token = signToken({ userId: user.id });
        return { user, token };
    }

    async login(email: string, password:string) {
        const user = await this.userRepo.findByEmail(email);
        if(!user){
            throw new Error("Invalid credentials");
        }

        const isValid = await comparePassword(password, user.password);
        if(!isValid){
            throw new Error("Invalid credentials");
        }
        
        const token = signToken({ userId: user.id });
        return { user, token };
    }
}