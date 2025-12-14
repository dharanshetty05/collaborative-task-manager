import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { email, z } from "zod";
import { registerUser } from "app/services/auth";

const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6)
});

type FormData = z.infer<typeof schema>;

export default function Register() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        await registerUser(data);
        alert("Registered successfully");
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input placeholder="Name" {...register("name")} />
            <p>{errors.name?.message}</p>

            <input placeholder="Email" {...register("email")} />
            <p>{errors.email?.message}</p>

            <input placeholder="Password" {...register("password")} />
            <p>{errors.password?.message}</p>

            <button type="submit">Register</button>
        </form>
    );
}