import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { apiRequest } from "../../api/api";
import { useAuth } from "../context/AuthContext";
import { JigoulaLogoFull } from "../components/JigoulaLogo";
import { ArrowRight } from "lucide-react";

export default function ScanPage() {
    const { qrToken } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadShop() {
            try {
                const response = await apiRequest(`/public/shops/${encodeURIComponent(qrToken || '')}`);
                setShop(response);
            } catch (exception: any) {
                setError(exception.message || "Failed to load shop");
            } finally {
                setLoading(false);
            }
        }
        if (qrToken) {
            loadShop();
        }
    }, [qrToken]);

    async function handleCheckIn() {
        setCheckingIn(true);
        setError("");
        try {
            // POST /scans/{qr_token}/check-in returns ScanCheckInResponse: { message, recorded, scan, loyalty }
            const result = await apiRequest(`/scans/${encodeURIComponent(qrToken || '')}/check-in`, {
                method: "POST",
            });
            // Navigate to the client loyalty page for this shop
            const shopId = result.scan?.shop_id || shop?.id;
            if (shopId) {
                navigate(`/client/${shopId}`);
            } else {
                navigate(`/`);
            }
        } catch (exception: any) {
            setError(exception.message || "Checkin failed");
        } finally {
            setCheckingIn(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#F2F1EE] flex items-center justify-center text-[#297A74]">
                Chargement...
            </main>
        );
    }

    if (error && !shop) {
        return (
            <main className="min-h-screen bg-[#F2F1EE] flex items-center justify-center p-6 text-[#297A74]">
                <div className="bg-[#FAFAF8] rounded-2xl shadow-sm border border-[#E0DDD8] p-8 text-center">
                    <h1 className="text-xl text-[#0C1F1D] mb-2">QR Code Invalide</h1>
                    <p>{error}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F2F1EE] flex items-center justify-center p-6 font-sans">
            <section className="bg-[#FAFAF8] rounded-2xl shadow-sm border border-[#E0DDD8] p-8 w-full max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <JigoulaLogoFull variant="light" width={120} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0C1F1D] mb-2">
                    Bienvenue chez
                </p>
                <h1 className="text-2xl font-bold text-[#297A74] mb-1">{shop?.name}</h1>
                <p className="text-[#297A74] text-sm mb-4">{shop?.address}</p>

                {error && <div className="text-red-500 bg-red-50 p-3 rounded-xl text-sm mb-4">{error}</div>}

                {user?.role === "CLIENT" ? (
                    <div className="space-y-4">
                        <p className="text-[#0C1F1D] mb-4">Bonjour <strong>{user.full_name}</strong>, prêt pour votre visite ?</p>
                        <button
                            onClick={handleCheckIn}
                            disabled={checkingIn}
                            className="w-full bg-[#0C1F1D] text-[#A6D8D2] py-3 rounded-xl font-semibold hover:bg-[#1a3533] transition-colors"
                        >
                            {checkingIn ? "Validation..." : "Valider ma visite"}
                        </button>
                        <button onClick={logout} className="text-xs text-[#297A74] hover:underline">Utiliser un autre compte</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {user && (
                            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-xs mb-4">
                                Vous êtes connecté(e) en tant que {user.role}. Déconnectez-vous pour continuer en tant que client.
                                <button onClick={logout} className="block mt-2 font-bold underline">Se déconnecter</button>
                            </div>
                        )}
                        {!user && (
                            <>
                                <p className="text-sm text-[#0C1F1D] mb-2">Connectez-vous pour gagner des points !</p>
                                <div className="flex flex-col gap-2">
                                    <Link to="/login" className="w-full bg-[#0C1F1D] text-[#A6D8D2] py-3 rounded-xl font-semibold hover:bg-[#1a3533] transition-colors flex justify-center items-center gap-2">
                                        Me connecter
                                    </Link>
                                    <Link to={`/login?register=true`} className="text-xs text-[#297A74] hover:underline mt-2">
                                        Créer un compte
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
