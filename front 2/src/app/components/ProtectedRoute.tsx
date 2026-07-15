import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import React from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <main className="min-h-screen bg-[#F2F1EE] flex items-center justify-center p-6 text-[#297A74]">
                Chargement...
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If specific roles are required and the user doesn't have one of them
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === "ADMIN") {
            return <Navigate to="/partner" replace />;
        }
        if (user.role === "MERCHANT") {
            return <Navigate to="/merchant" replace />;
        }
        if (user.role === "CLIENT") {
            // Clients come from scan page; redirect to home
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
