import { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Gift, Star, QrCode, Search, Download, ExternalLink, Eye, Bell, Plus } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { apiRequest } from '../../api/api';

const F = "'Century Gothic','Trebuchet MS',sans-serif";

const visitData = [
  { mois: 'Jan', visites: 85, nouveaux: 12 },
  { mois: 'Fév', visites: 102, nouveaux: 18 },
  { mois: 'Mar', visites: 120, nouveaux: 22 },
  { mois: 'Avr', visites: 98, nouveaux: 15 },
  { mois: 'Mai', visites: 134, nouveaux: 28 },
  { mois: 'Jun', visites: 145, nouveaux: 31 },
  { mois: 'Jul', visites: 160, nouveaux: 35 },
];

const clients = [
  { id: 1, name: 'Ahmed Ben Ali', phone: '+216 71 234 567', visits: 12, points: 240, lastVisit: '14 Mai 2025', hasReward: true },
  { id: 2, name: 'Fatma Trabelsi', phone: '+216 21 345 678', visits: 8, points: 160, lastVisit: '10 Mai 2025', hasReward: false },
  { id: 3, name: 'Mohamed Hamdi', phone: '+216 54 456 789', visits: 15, points: 300, lastVisit: '13 Mai 2025', hasReward: true },
  { id: 4, name: 'Sonia Jbali', phone: '+216 98 567 890', visits: 5, points: 100, lastVisit: '08 Mai 2025', hasReward: false },
  { id: 5, name: 'Khalil Mansour', phone: '+216 23 678 901', visits: 20, points: 400, lastVisit: '14 Mai 2025', hasReward: true },
  { id: 6, name: 'Rim Bouaziz', phone: '+216 44 789 012', visits: 3, points: 60, lastVisit: '05 Mai 2025', hasReward: false },
  { id: 7, name: 'Youssef Ayari', phone: '+216 55 890 123', visits: 11, points: 220, lastVisit: '12 Mai 2025', hasReward: true },
];

const recentActivity = [
  { client: 'Khalil Mansour', action: 'Récompense débloquée', time: 'Il y a 2h', icon: '🎁' },
  { client: 'Ahmed Ben Ali', action: 'Visite enregistrée', time: 'Il y a 4h', icon: '📱' },
  { client: 'Mohamed Hamdi', action: 'Avis Google laissé ⭐', time: 'Il y a 5h', icon: '⭐' },
  { client: 'Youssef Ayari', action: 'Visite enregistrée', time: 'Il y a 7h', icon: '📱' },
  { client: 'Sonia Jbali', action: '1ère visite enregistrée', time: 'Hier', icon: '👋' },
];

/* ── QR Code visual ──────────────────────────────────────── */
function QRCodeVisual({ size = 180 }: { size?: number }) {
  const cells = 21;
  const cs = size / cells;

  const isFinderCell = (r: number, c: number): boolean => {
    if (r === 0 || r === 6 || c === 0 || c === 6) return true;
    if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
    return false;
  };

  const isFinderBlock = (r: number, c: number): boolean => {
    if (r < 7 && c < 7) return isFinderCell(r, c);
    if (r < 7 && c >= cells - 7) return isFinderCell(r, c - (cells - 7));
    if (r >= cells - 7 && c < 7) return isFinderCell(r - (cells - 7), c);
    return false;
  };

  const filled = (r: number, c: number): boolean => {
    if (isFinderBlock(r, c)) return true;
    if (r === 7 && (c <= 7 || c >= cells - 8)) return false;
    if (c === 7 && (r <= 7 || r >= cells - 8)) return false;
    if (r === 6 && c > 7 && c < cells - 8) return c % 2 === 0;
    if (c === 6 && r > 7 && r < cells - 8) return r % 2 === 0;
    const inQ = (r <= 8 && (c <= 8 || c >= cells - 8)) || (r >= cells - 8 && c <= 8);
    if (inQ) return false;
    const n = Math.sin(r * 1301 + c * 4999 + 7) * 23280;
    return (n - Math.floor(n)) > 0.48;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="4" />
      {Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) =>
          filled(r, c) ? (
            <rect key={`${r}-${c}`} x={c * cs + 0.2} y={r * cs + 0.2} width={cs - 0.4} height={cs - 0.4} fill="#0C1F1D" rx={0.6} />
          ) : null
        )
      )}
    </svg>
  );
}

/* ── Tooltip style ───────────────────────────────────────── */
const ttStyle = { borderRadius: '10px', border: '1px solid #E0DDD8', fontSize: '12px', fontFamily: F };

export default function MerchantDashboard() {
  const { t, lang } = useLang();
  const m = t.merchant;

  const [loyaltyType, setLoyaltyType] = useState<'stamps' | 'points'>('stamps');
  const [search, setSearch] = useState('');
  const [stampCount, setStampCount] = useState(10);
  const [rewardLabel, setRewardLabel] = useState('Café gratuit');
  const [reviewTrigger, setReviewTrigger] = useState(5);
  const [saved, setSaved] = useState(false);

  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiRequest("/merchant/shops");
        setShops(response);
        if (response.length > 0) {
          setSelectedShopId(response[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedShopId) return;
    async function fetchStats() {
      try {
        const s = await apiRequest(`/merchant/shops/${selectedShopId}/stats`);
        setStats(s);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, [selectedShopId]);

  const selectedShop = shops.find(s => s.id === selectedShopId);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div className="min-h-screen bg-[#F2F1EE]" style={{ fontFamily: lang === 'ar' ? "'Cairo',sans-serif" : F }}>

      {/* Page header */}
      <div className="bg-[#FAFAF8] border-b border-[#E0DDD8] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-[#0C1F1D]">{selectedShop ? selectedShop.name : "Café & Pâtisserie"}</h2>
            <p className="text-[#297A74] text-sm">Nabeul · Programme actif depuis Janvier 2025</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#297A74] hover:bg-[#A6D8D2]/15 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-[#0C1F1D] rounded-full flex items-center justify-center text-[#A6D8D2] text-sm font-semibold shadow-sm">AB</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs.Root defaultValue="overview">
          <Tabs.List className="flex gap-1 bg-[#FAFAF8] rounded-xl p-1 shadow-sm border border-[#E0DDD8] mb-6 overflow-x-auto">
            {[
              { value: 'overview', label: m.overview, Icon: TrendingUp },
              { value: 'clients', label: m.clients, Icon: Users },
              { value: 'loyalty', label: m.loyalty, Icon: Gift },
              { value: 'qrcode', label: m.qrcode, Icon: QrCode },
              { value: 'reviews', label: m.reviews, Icon: Star },
            ].map(({ value, label, Icon }) => (
              <Tabs.Trigger key={value} value={value}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[#297A74] text-sm whitespace-nowrap data-[state=active]:bg-[#0C1F1D] data-[state=active]:text-[#A6D8D2] transition-all">
                <Icon className="w-4 h-4" />{label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* ── Overview ── */}
          <Tabs.Content value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: m.totalClients, value: stats?.unique_clients ?? '0', delta: '+12 ce mois', Icon: Users, bg: 'bg-[#A6D8D2]/15', fg: 'text-[#297A74]' },
                { label: m.monthVisits, value: stats?.total_visits ?? '0', delta: '+8% vs dernier', Icon: TrendingUp, bg: 'bg-[#0C1F1D]/5', fg: 'text-[#0C1F1D]' },
                { label: "SaaS Plan", value: selectedShop?.subscription_plan ?? 'N/A', delta: '', Icon: Gift, bg: 'bg-[#A6D8D2]/15', fg: 'text-[#297A74]' },
                { label: "FIDELITE", value: stats?.has_active_loyalty_program ? 'Actif' : 'Inactif', delta: '', Icon: Star, bg: 'bg-[#0C1F1D]/5', fg: 'text-[#0C1F1D]' },
              ].map((s, i) => (
                <div key={i} className="bg-[#FAFAF8] rounded-xl p-5 shadow-sm border border-[#E0DDD8]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#297A74] text-xs font-medium uppercase tracking-wide">{s.label}</span>
                    <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                      <s.Icon className={`w-4 h-4 ${s.fg}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#0C1F1D]">{s.value}</div>
                  <div className="text-[#297A74] text-xs mt-1">{s.delta}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
                <h3 className="text-[#0C1F1D] text-sm font-semibold mb-0.5">Visites mensuelles</h3>
                <p className="text-[#297A74] text-xs mb-4">7 derniers mois</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={visitData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DDD8" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#297A74' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#297A74' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} />
                    <Bar dataKey="visites" name="Visites" fill="#0C1F1D" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="nouveaux" name="Nouveaux" fill="#A6D8D2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#0C1F1D] rounded-sm" /><span className="text-xs text-[#297A74]">Visites</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#A6D8D2] rounded-sm" /><span className="text-xs text-[#297A74]">Nouveaux</span></div>
                </div>
              </div>

              <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
                <h3 className="text-[#0C1F1D] text-sm font-semibold mb-0.5">Nouveaux clients</h3>
                <p className="text-[#297A74] text-xs mb-4">Croissance mensuelle</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={visitData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DDD8" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#297A74' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#297A74' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} />
                    <Line type="monotone" dataKey="nouveaux" name="Nouveaux clients" stroke="#297A74" strokeWidth={2.5} dot={{ fill: '#0C1F1D', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
              <h3 className="text-[#0C1F1D] text-sm font-semibold mb-4">{m.recentActivity}</h3>
              <div className="divide-y divide-[#E0DDD8]">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 bg-[#F2F1EE] rounded-xl flex items-center justify-center text-lg shrink-0">{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#0C1F1D]">{a.client}</span>
                      <span className="text-sm text-[#297A74]"> — {a.action}</span>
                    </div>
                    <span className="text-xs text-[#297A74] shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Tabs.Content>

          {/* ── Clients ── */}
          <Tabs.Content value="clients">
            <div className="bg-[#FAFAF8] rounded-xl shadow-sm border border-[#E0DDD8]">
              <div className="p-5 border-b border-[#E0DDD8] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-[#0C1F1D] text-sm font-semibold">{m.manageClients}</h3>
                  <p className="text-[#297A74] text-xs mt-0.5">{clients.length} clients enregistrés</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#297A74]" />
                    <input type="text" placeholder={m.search} value={search} onChange={e => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-[#E0DDD8] bg-[#F2F1EE] rounded-lg text-sm focus:outline-none focus:border-[#A6D8D2] w-52 text-[#0C1F1D]" />
                  </div>
                  <button className="flex items-center gap-1.5 bg-[#0C1F1D] text-[#A6D8D2] px-3 py-2 rounded-lg text-sm hover:bg-[#1a3533] transition-colors">
                    <Plus className="w-4 h-4" /> {m.add}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F2F1EE] text-[#297A74] text-xs uppercase tracking-wide">
                      {['Client', 'Téléphone', 'Visites', 'Progression', 'Dernière visite', 'Statut'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0DDD8]">
                    {filtered.map(client => (
                      <tr key={client.id} className="hover:bg-[#F2F1EE]/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#0C1F1D] rounded-full flex items-center justify-center text-[#A6D8D2] text-xs font-semibold shrink-0">
                              {client.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm font-medium text-[#0C1F1D]">{client.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#297A74]">{client.phone}</td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-[#0C1F1D]">{client.visits}</span>
                          <span className="text-xs text-[#297A74] ml-1">visites</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-[#E0DDD8] rounded-full overflow-hidden">
                              <div className="h-full bg-[#0C1F1D] rounded-full" style={{ width: `${Math.min((client.points / 500) * 100, 100)}%` }} />
                            </div>
                            <span className="text-xs text-[#297A74]">{client.points} pts</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#297A74]">{client.lastVisit}</td>
                        <td className="px-5 py-4">
                          {client.hasReward
                            ? <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#A6D8D2]/15 text-[#297A74] rounded-full text-xs font-medium border border-[#A6D8D2]/30">🎁 Récompense dispo</span>
                            : <span className="inline-flex px-2.5 py-1 bg-[#F2F1EE] text-[#297A74]/60 rounded-full text-xs border border-[#E0DDD8]">En cours</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tabs.Content>

          {/* ── Programme ── */}
          <Tabs.Content value="loyalty">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
                <h3 className="text-[#0C1F1D] text-sm font-semibold mb-0.5">{m.programType}</h3>
                <p className="text-[#297A74] text-xs mb-5">Choisissez comment récompenser vos clients</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { value: 'stamps', emoji: '🎫', label: m.stamps, sub: 'Collectez X visites' },
                    { value: 'points', emoji: '⭐', label: m.points, sub: 'Cumulez des points' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setLoyaltyType(opt.value as 'stamps' | 'points')}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${loyaltyType === opt.value ? 'border-[#0C1F1D] bg-[#0C1F1D]/5' : 'border-[#E0DDD8] hover:border-[#A6D8D2]'}`}>
                      <div className="text-3xl mb-1.5">{opt.emoji}</div>
                      <div className={`text-sm font-semibold ${loyaltyType === opt.value ? 'text-[#0C1F1D]' : 'text-[#297A74]'}`}>{opt.label}</div>
                      <div className="text-xs text-[#297A74]/60 mt-0.5">{opt.sub}</div>
                    </button>
                  ))}
                </div>
                {loyaltyType === 'stamps' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0C1F1D] mb-2">Visites requises : <span className="text-[#297A74] font-bold">{stampCount}</span></label>
                      <input type="range" min={5} max={20} value={stampCount} onChange={e => setStampCount(Number(e.target.value))} className="w-full accent-[#0C1F1D]" />
                      <div className="flex justify-between text-xs text-[#297A74] mt-1"><span>5</span><span>20</span></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0C1F1D] mb-1.5">Récompense</label>
                      <input type="text" value={rewardLabel} onChange={e => setRewardLabel(e.target.value)} className="w-full border border-[#E0DDD8] bg-[#F2F1EE] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#A6D8D2] text-[#0C1F1D]" />
                    </div>
                  </div>
                )}
                {loyaltyType === 'points' && (
                  <div className="space-y-4">
                    {[['Points par visite', '20'], ['Points pour récompense', '200'], ['Récompense', 'Remise 10%']].map(([lbl, def], i) => (
                      <div key={i}>
                        <label className="block text-sm font-medium text-[#0C1F1D] mb-1.5">{lbl}</label>
                        <input type={i < 2 ? 'number' : 'text'} defaultValue={def} className="w-full border border-[#E0DDD8] bg-[#F2F1EE] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#A6D8D2] text-[#0C1F1D]" />
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={handleSave} className={`mt-6 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${saved ? 'bg-[#297A74] text-white' : 'bg-[#0C1F1D] text-[#A6D8D2] hover:bg-[#1a3533]'}`}>
                  {saved ? m.saved : m.save}
                </button>
              </div>

              <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
                <h3 className="text-[#0C1F1D] text-sm font-semibold mb-0.5">{m.preview}</h3>
                <p className="text-[#297A74] text-xs mb-5">Ce que verra le client sur son écran</p>
                <div className="bg-[#0C1F1D] rounded-2xl p-5 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold">Café Al Baraka</div>
                      <div className="text-[#A6D8D2]/50 text-sm">Programme {loyaltyType === 'stamps' ? 'Tampons' : 'Points'}</div>
                    </div>
                    <div className="w-10 h-10 bg-[#A6D8D2]/10 rounded-full flex items-center justify-center text-xl">☕</div>
                  </div>
                  {loyaltyType === 'stamps' && (
                    <div>
                      <div className="text-[#A6D8D2]/50 text-xs mb-3">Carte de fidélité</div>
                      <div className="grid grid-cols-5 gap-1.5 mb-3">
                        {Array.from({ length: stampCount }).map((_, i) => (
                          <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${i < 7 ? 'bg-[#A6D8D2] text-[#0C1F1D]' : 'bg-white/5 border border-white/10'}`}>
                            {i < 7 ? '✓' : ''}
                          </div>
                        ))}
                      </div>
                      <div className="bg-[#A6D8D2]/10 border border-[#A6D8D2]/20 rounded-xl px-3 py-2 text-sm text-[#A6D8D2]">
                        7/{stampCount} · {stampCount - 7} restantes → <span className="font-semibold text-white">{rewardLabel}</span>
                      </div>
                    </div>
                  )}
                  {loyaltyType === 'points' && (
                    <div>
                      <div className="text-4xl font-bold text-[#A6D8D2] mb-1">240</div>
                      <div className="text-white/50 text-sm mb-3">points accumulés</div>
                      <div className="bg-white/10 rounded-full h-2.5 mb-1.5 overflow-hidden">
                        <div className="bg-[#A6D8D2] h-full rounded-full" style={{ width: '60%' }} />
                      </div>
                      <div className="text-sm text-white/50">120 pts de plus → <span className="text-[#A6D8D2] font-medium">Remise 10%</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* ── QR Code ── */}
          <Tabs.Content value="qrcode">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#FAFAF8] rounded-xl p-8 shadow-sm border border-[#E0DDD8] flex flex-col items-center">
                <h3 className="text-[#0C1F1D] text-sm font-semibold mb-0.5 self-start">{m.yourQr}</h3>
                <p className="text-[#297A74] text-xs mb-6 self-start">{m.displayQr}</p>
                <div className="bg-white p-5 rounded-2xl shadow-lg border-2 border-[#A6D8D2]/25"><QRCodeVisual size={180} /></div>
                <div className="mt-4 text-center">
                  <div className="text-sm font-semibold text-[#0C1F1D]">Café & Pâtisserie Al Baraka</div>
                  <div className="text-xs text-[#297A74] mt-1">Scannez pour accumuler vos points</div>
                </div>
                <div className="flex gap-3 mt-6 w-full">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-[#0C1F1D] text-[#A6D8D2] py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a3533] transition-colors">
                    <Download className="w-4 h-4" /> {m.download}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 border border-[#E0DDD8] text-[#297A74] py-2.5 rounded-xl text-sm hover:bg-[#F2F1EE] transition-colors">
                    <Eye className="w-4 h-4" /> {m.preview2}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
                  <h3 className="text-[#0C1F1D] mb-3 text-sm font-semibold">Lien de scan</h3>
                  <div className="flex items-center gap-2 bg-[#F2F1EE] rounded-xl p-3.5 border border-[#E0DDD8]">
                    <code className="text-xs text-[#297A74] flex-1 break-all">https://jigoula.cards/client/shop-albaraka-nabeul</code>
                    <button className="text-[#297A74] hover:text-[#0C1F1D] shrink-0 p-1"><ExternalLink className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
                  <h3 className="text-[#0C1F1D] mb-2 text-sm font-semibold">Protection anti-abus</h3>
                  <p className="text-[#297A74] text-xs mb-4">Limitez les scans abusifs</p>
                  <div className="space-y-3">
                    {[['Délai minimum entre scans', ['1 heure', '4 heures', '24 heures']], ['Max scans par jour', ['1 scan', '2 scans', 'Illimité']]].map(([lbl, opts], i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-[#0C1F1D]">{lbl}</span>
                        <select className="border border-[#E0DDD8] bg-[#F2F1EE] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#A6D8D2] text-[#0C1F1D]">
                          {(opts as string[]).map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#A6D8D2]/10 rounded-xl p-5 border border-[#A6D8D2]/25">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <div className="font-semibold text-[#0C1F1D] text-sm">Conseil de placement</div>
                      <p className="text-[#297A74] text-sm mt-1 leading-relaxed">Affichez le QR code à la caisse ou sur les menus. Assurez-vous qu'il soit bien éclairé.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* ── Avis ── */}
          <Tabs.Content value="reviews">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
                <h3 className="text-[#0C1F1D] text-sm font-semibold mb-0.5">{m.reviewConfig}</h3>
                <p className="text-[#297A74] text-xs mb-5">{m.reviewConfigSub}</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#0C1F1D] mb-2">
                      Déclencher après : <span className="text-[#297A74] font-bold">{reviewTrigger} visite(s)</span>
                    </label>
                    <input type="range" min={1} max={10} value={reviewTrigger} onChange={e => setReviewTrigger(Number(e.target.value))} className="w-full accent-[#0C1F1D]" />
                    <div className="flex justify-between text-xs text-[#297A74] mt-1"><span>1</span><span>10</span></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0C1F1D] mb-1.5">Lien Google Maps</label>
                    <div className="flex items-center gap-2">
                      <input type="url" defaultValue="https://maps.google.com/..." className="flex-1 border border-[#E0DDD8] bg-[#F2F1EE] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#A6D8D2] text-[#0C1F1D]" />
                      <button className="p-2.5 bg-[#A6D8D2]/15 text-[#297A74] rounded-lg hover:bg-[#A6D8D2]/25"><ExternalLink className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0C1F1D] mb-1.5">Message personnalisé</label>
                    <textarea defaultValue="Merci pour votre visite ! 🎉 Votre avis nous aide à nous améliorer. Laissez-nous un avis sur Google 🌟"
                      className="w-full border border-[#E0DDD8] bg-[#F2F1EE] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#A6D8D2] h-24 resize-none text-[#0C1F1D]" />
                  </div>
                  <button onClick={handleSave} className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${saved ? 'bg-[#297A74] text-white' : 'bg-[#0C1F1D] text-[#A6D8D2] hover:bg-[#1a3533]'}`}>
                    {saved ? m.saved : m.save}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
                  <h3 className="text-[#0C1F1D] mb-4 text-sm font-semibold">{m.reviewStats}</h3>
                  <div className="divide-y divide-[#E0DDD8]">
                    {[['Invitations envoyées', '89'], ['Avis effectivement laissés', '63'], ['Taux de conversion', '70.8%'], ['Note moyenne', '4.7 ⭐']].map(([l, v], i) => (
                      <div key={i} className="flex items-center justify-between py-3">
                        <span className="text-sm text-[#297A74]">{l}</span>
                        <span className="text-sm font-bold text-[#0C1F1D]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#0C1F1D] rounded-xl p-5">
                  <div className="text-xs text-[#A6D8D2]/40 mb-3 uppercase tracking-wide">Aperçu du message</div>
                  <div className="bg-[#1a3533] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-[#A6D8D2]/10 border border-[#A6D8D2]/20 rounded-xl flex items-center justify-center text-sm">☕</div>
                      <div>
                        <div className="text-white text-sm font-medium">Café Al Baraka</div>
                        <div className="text-[#A6D8D2]/40 text-xs">Maintenant</div>
                      </div>
                    </div>
                    <p className="text-white/65 text-sm leading-relaxed">Merci pour votre {reviewTrigger}ème visite ! 🎉 Votre avis nous aide à nous améliorer.</p>
                    <button className="w-full bg-[#A6D8D2] text-[#0C1F1D] py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#8fccc5]">
                      <Star className="w-4 h-4" fill="currentColor" /> Laisser un avis Google
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
