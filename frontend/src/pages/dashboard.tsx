import { useQuery } from "@tanstack/react-query";
import { getMe } from "app/services/auth";

export default function Dashboard() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["me"],
        queryFn: getMe
    });

    if(isLoading) return <p>Loading...</p>;
    if(isError) return <p>Unauthorized</p>;

    return <h1>Welcome</h1>;
}