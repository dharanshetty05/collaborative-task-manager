import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser } from "app/services/auth";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

type FormData = z.infer<typeof schema>;

export default function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        await loginUser(data);
        alert("Logged in");
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input placeholder="Email" {...register("email")} />
            <p>{errors.email?.message}</p>

            <input placeholder="Password" {...register("password")} />
            <p>{errors.email?.message}</p>

            <button type="submit">Login</button>
        </form>
    )
}