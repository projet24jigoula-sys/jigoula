export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export function getToken(): string | null {
    return localStorage.getItem("loyalty_token");
}

export function clearSession(): void {
    localStorage.removeItem("loyalty_token");
    localStorage.removeItem("loyalty_user");
}

async function parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
}

export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getToken();

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    if (options.body && !(options.body instanceof URLSearchParams)) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await parseResponse(response);

    if (response.status === 401) {
        clearSession();
    }

    if (!response.ok) {
        let errorMessage = "Une erreur est survenue.";
        if (data?.detail) {
            if (Array.isArray(data.detail)) {
                errorMessage = data.detail.map((err: any) => {
                    const location = err.loc ? err.loc.slice(1).join(".") : "";
                    return `${location ? location + ": " : ""}${err.msg}`;
                }).join(" | ");
            } else if (typeof data.detail === "string") {
                errorMessage = data.detail;
            } else {
                errorMessage = JSON.stringify(data.detail);
            }
        }
        throw new Error(errorMessage);
    }

    return data;
}

export async function apiBlobRequest(endpoint: string): Promise<Blob> {
    const token = getToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        clearSession();
    }

    if (!response.ok) {
        const data = await parseResponse(response);
        throw new Error(data?.detail || "Impossible de charger le fichier.");
    }

    return response.blob();
}
