import api from "./api";

export async function registerUser(data:{
    name: string;
    email: string;
    password: string;
}) {
    const res = await api.post("/api/auth/register", data);
    return res.data;
}

export async function loginUser(data:{
    email: string;
    password: string;
}) {
    const res = await api.post("/api/auth/login", data);
    return res.data;
}

export async function getMe() {
    const res = await api.get("/api/me");
    return res.data;
}

export async function logoutUser() {
    await api.post("/api/auth/logout");
}

export async function updateProfile(data:{ name: string }) {
    const res = await api.patch("/api/me", data);
    return res.data;
}