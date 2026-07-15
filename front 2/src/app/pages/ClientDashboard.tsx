import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../../api/api';
import { JigoulaIcon } from '../components/JigoulaLogo';
import { MapPin, Store, ChevronRight, Gift } from 'lucide-react';

export default function ClientDashboard() {
    const { user } = useAuth();
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadShops() {
            try {
                const response = await apiRequest('/client/visited-shops');
                setShops(response.shops || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadShops();
    }, []);

    const th = {
        headerBg: '#0C1F1D',
        accent: '#A6D8D2',
        accentDim: 'rgba(166,216,210,0.1)',
    };

    if (loading) return <div className="min-h-screen bg-[#F2F1EE] flex items-center justify-center text-[#297A74]">Chargement...</div>;

    return (
        <div className="min-h-screen bg-[#F2F1EE] flex flex-col font-sans">
            <div className="bg-[#0C1F1D] text-white pt-10 pb-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#A6D8D2]/5 rounded-full blur-3xl" />
                <div className="max-w-xl mx-auto relative z-10 flex flex-col">
                    <Link to="/" className="mb-6 opacity-80 hover:opacity-100 flex items-center gap-1.5 text-sm transition-all text-[#A6D8D2]">
                        <JigoulaIcon variant="dark" className="w-5 h-5" /> Retour
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#A6D8D2] text-[#0C1F1D] rounded-full flex items-center justify-center text-xl font-bold border-2 border-[#A6D8D2]/30 shadow-lg">
                            {user?.full_name?.substring(0, 2).toUpperCase() || 'Me'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Bonjour, {user?.full_name?.split(' ')[0] || 'Client'} !</h1>
                            <p className="text-[#A6D8D2]/70 text-sm">Gérez vos cartes de fidélité ici</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-xl mx-auto w-full px-4 -mt-10 mb-10 relative z-20">
                {shops.length === 0 ? (
                    <div className="bg-[#FAFAF8] rounded-2xl p-10 shadow-lg border border-[#E0DDD8] text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#A6D8D2]/20 rounded-full flex items-center justify-center mb-4">
                            <Store className="w-10 h-10 text-[#297A74]" />
                        </div>
                        <h2 className="text-[#0C1F1D] text-lg font-bold mb-2">Aucune carte trouvée</h2>
                        <p className="text-[#297A74] text-sm mb-6">Scannez un QR code dans l'un de nos commerces partenaires pour commencer à cumuler vos points !</p>
                        <div className="px-5 py-2 bg-[#A6D8D2]/20 text-[#0C1F1D] rounded-full text-xs font-semibold border border-[#A6D8D2]/50">
                            Prêt pour votre premier scan ?
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {shops.map((s, idx) => (
                            <Link key={idx} to={`/client/${s.shop_id}`} className="block">
                                <div className="bg-[#FAFAF8] rounded-2xl p-5 shadow-md hover:shadow-lg border border-[#E0DDD8] transition-all hover:-translate-y-0.5 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-[#A6D8D2]/30 border border-[#A6D8D2]/50 flex items-center justify-center text-xl">
                                                ☕
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#0C1F1D] leading-tight">{s.shop_name}</h3>
                                                <p className="text-[#297A74] text-xs flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3 h-3" /> {s.shop_address}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-[#0C1F1D]/5 flex items-center justify-center text-[#297A74] group-hover:bg-[#0C1F1D] group-hover:text-[#A6D8D2] transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="bg-[#F2F1EE] rounded-xl p-3 border border-[#E0DDD8]">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-[#0C1F1D] flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-[#297A74]" /> {s.loyalty?.reward_title || 'Récompense'}</span>
                                            <span className="text-xs font-bold text-[#297A74]">{s.loyalty?.current_visits || 0} / {s.loyalty?.required_visits || 10}</span>
                                        </div>
                                        <div className="w-full bg-[#E0DDD8] h-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#0C1F1D]"
                                                style={{ width: `${s.loyalty?.progress_percentage || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-center pb-8 border-t border-[#E0DDD8] pt-6 flex flex-col items-center gap-2">
                <JigoulaIcon variant="light" className="w-8 h-3 opacity-60" />
                <p className="text-xs text-[#297A74]/70 tracking-wide">© 2025 Jigoula</p>
            </div>
        </div>
    );
}
