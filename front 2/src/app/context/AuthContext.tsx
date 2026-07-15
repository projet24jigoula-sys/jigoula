import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "../../api/api";

type User = {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    registerClient: (clientData: any) => Promise<User>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem("loyalty_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loading, setLoading] = useState(true);

    function saveSession(response: any) {
        localStorage.setItem("loyalty_token", response.access_token);
        localStorage.setItem("loyalty_user", JSON.stringify(response.user));
        setUser(response.user);
        return response.user;
    }

    useEffect(() => {
        async function verifySession() {
            const token = localStorage.getItem("loyalty_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const currentUser = await apiRequest("/auth/me");
                setUser(currentUser);
                localStorage.setItem("loyalty_user", JSON.stringify(currentUser));
            } catch {
                localStorage.removeItem("loyalty_token");
                localStorage.removeItem("loyalty_user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        verifySession();
    }, []);

    async function login(email: string, password: string) {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await apiRequest("/auth/login", {
            method: "POST",
            body: formData,
        });

        return saveSession(response);
    }

    async function registerClient(clientData: any) {
        const response = await apiRequest("/auth/register-client", {
            method: "POST",
            body: JSON.stringify(clientData),
        });
        return saveSession(response);
    }

    function logout() {
        localStorage.removeItem("loyalty_token");
        localStorage.removeItem("loyalty_user");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                registerClient,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
