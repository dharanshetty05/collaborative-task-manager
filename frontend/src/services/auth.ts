/**
 * Authentication API
 *
 * This module provides backend API helpers for user authentication and profile management, including registration, login, logout, and fetching the current authenticated user.
 *
 * Authentication state is maintained via HttpOnly cookies, and all auth-related data is treated as server-owned. Client-side state is synchronized using React Query rather than manual session management.
 */


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