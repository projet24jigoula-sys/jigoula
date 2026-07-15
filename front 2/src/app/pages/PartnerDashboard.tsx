import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Building2, Gift, ChevronRight, Plus, Settings, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { JigoulaIcon } from '../components/JigoulaLogo';
import { useLang } from '../context/LangContext';

const ttStyle = { borderRadius: '10px', border: '1px solid #E0DDD8', fontSize: '12px', fontFamily: "'Century Gothic','Trebuchet MS',sans-serif" };

const shops = [
  { id: 1, name: 'Café Al Baraka',   category: '☕ Café',        clients: 148, visits: 312, rewards: 47, active: true },
  { id: 2, name: 'Boulangerie Safi', category: '🥖 Boulangerie', clients: 203, visits: 445, rewards: 62, active: true },
  { id: 3, name: 'Boutique Nour',    category: '👗 Mode',        clients: 89,  visits: 156, rewards: 23, active: true },
  { id: 4, name: 'Pharmacie Atlas',  category: '💊 Pharmacie',   clients: 67,  visits: 134, rewards: 19, active: false },
];

const monthlyData = [
  { mois: 'Jan', café: 85,  boulangerie: 120, boutique: 45, pharmacie: 30 },
  { mois: 'Fév', café: 102, boulangerie: 145, boutique: 52, pharmacie: 38 },
  { mois: 'Mar', café: 120, boulangerie: 160, boutique: 61, pharmacie: 42 },
  { mois: 'Avr', café: 98,  boulangerie: 132, boutique: 48, pharmacie: 35 },
  { mois: 'Mai', café: 134, boulangerie: 175, boutique: 68, pharmacie: 44 },
];

const pieData = [
  { name: 'Café Al Baraka',   value: 148, color: '#0C1F1D' },
  { name: 'Boulangerie Safi', value: 203, color: '#297A74' },
  { name: 'Boutique Nour',    value: 89,  color: '#A6D8D2' },
  { name: 'Pharmacie Atlas',  value: 67,  color: '#7ab8b4' },
];

const sharedOffers = [
  { title: 'Pass Nabeul Commerce', desc: 'Cumulez des points dans nos 4 commerces partenaires', shops: ['☕','🥖','👗','💊'], badge: '2× points le weekend', active: true },
  { title: 'Offre Été 2025',       desc: 'Programme spécial saison estivale pour les fidèles',   shops: ['☕','🥖'],          badge: 'Boisson offerte',    active: true },
  { title: 'Programme VIP',        desc: 'Clients ayant visité 3 commerces ou plus ce mois',     shops: ['☕','🥖','👗'],     badge: 'Remise 15%',         active: false },
];

export default function PartnerDashboard() {
  const { t, lang } = useLang();
  const p = t.partner;
  const F = "'Century Gothic','Trebuchet MS',sans-serif";

  const totalClients = shops.reduce((s, c) => s + c.clients, 0);
  const totalVisits  = shops.reduce((s, c) => s + c.visits,  0);
  const totalRewards = shops.reduce((s, c) => s + c.rewards, 0);

  return (
    <div className="min-h-screen bg-[#F2F1EE]" style={{ fontFamily: lang === 'ar' ? "'Cairo',sans-serif" : F }}>

      {/* Header */}
      <div className="bg-[#0C1F1D] px-4 py-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#A6D8D2]/10 border border-[#A6D8D2]/20 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#A6D8D2]" />
              </div>
              <div>
                <h2 className="text-white">{p.groupName}</h2>
                <p className="text-[#A6D8D2]/50 text-sm">{p.groupSub}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 bg-[#A6D8D2]/10 border border-[#A6D8D2]/20 text-[#A6D8D2] text-xs px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3" /> {p.extension}
              </div>
              <button className="flex items-center gap-2 bg-[#A6D8D2]/10 hover:bg-[#A6D8D2]/20 text-white border border-[#A6D8D2]/20 px-4 py-2 rounded-xl text-sm transition-colors">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">{p.addShop}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: p.totalClients, value: totalClients, icon: '👥', sub: '4 commerces actifs'        },
              { label: p.totalVisits,  value: totalVisits,  icon: '📊', sub: 'Tous commerces confondus'  },
              { label: p.rewards,      value: totalRewards, icon: '🎁', sub: 'Distribuées ce mois'       },
              { label: p.retention,    value: '68%',        icon: '📈', sub: '+4% vs mois dernier'       },
            ].map((s, i) => (
              <div key={i} className="bg-[#A6D8D2]/8 border border-[#A6D8D2]/15 rounded-xl p-4">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-2xl font-bold text-[#A6D8D2]">{s.value}</div>
                <div className="text-white/60 text-xs font-medium mt-0.5">{s.label}</div>
                <div className="text-white/30 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Shops grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#0C1F1D] text-sm font-semibold">{p.myShops} ({shops.length})</h3>
            <Link to="/merchant" className="text-sm text-[#297A74] flex items-center gap-1 hover:gap-2 transition-all">
              {p.merchantView} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shops.map(shop => (
              <div key={shop.id} className={`bg-[#FAFAF8] rounded-xl p-5 shadow-sm border border-[#E0DDD8] hover:shadow-md transition-all ${!shop.active ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{shop.category.split(' ')[0]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${shop.active ? 'bg-[#A6D8D2]/15 border-[#A6D8D2]/30 text-[#297A74]' : 'bg-[#F2F1EE] border-[#E0DDD8] text-[#297A74]/50'}`}>
                    {shop.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="font-semibold text-[#0C1F1D] text-sm mb-0.5">{shop.name}</div>
                <p className="text-xs text-[#297A74] mb-3">{shop.category.split(' ').slice(1).join(' ')}</p>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {[{v:shop.clients,l:'clients'},{v:shop.visits,l:'visites'},{v:shop.rewards,l:'récomp.'}].map((s,i) => (
                    <div key={i} className="bg-[#F2F1EE] rounded-lg py-1.5">
                      <div className="text-sm font-bold text-[#0C1F1D]">{s.v}</div>
                      <div className="text-xs text-[#297A74]">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
            <h3 className="text-[#0C1F1D] text-sm font-semibold mb-0.5">{p.visitsByShop}</h3>
            <p className="text-[#297A74] text-xs mb-4">5 derniers mois · cumulé</p>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DDD8" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#297A74' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#297A74' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="café"        name="Café"        fill="#0C1F1D" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="boulangerie" name="Boulangerie" fill="#297A74" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="boutique"    name="Boutique"    fill="#A6D8D2" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="pharmacie"   name="Pharmacie"   fill="#c8e8e5" radius={[3,3,0,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-3">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-[#297A74]">{d.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
            <h3 className="text-[#0C1F1D] text-sm font-semibold mb-0.5">{p.clientShare}</h3>
            <p className="text-[#297A74] text-xs mb-2">Par commerce</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={v => [`${v} clients`, '']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-[#297A74] flex-1 truncate">{d.name}</span>
                  <span className="text-xs font-semibold text-[#0C1F1D]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
            <h3 className="text-[#0C1F1D] mb-4 text-sm font-semibold">{p.topClients}</h3>
            <div className="divide-y divide-[#E0DDD8]">
              {[
                { name: 'Khalil Mansour',  shops: 4, points: 1240, badge: '👑' },
                { name: 'Ahmed Ben Ali',   shops: 3, points: 890,  badge: '⭐' },
                { name: 'Fatma Trabelsi',  shops: 3, points: 760,  badge: '⭐' },
                { name: 'Mohamed Hamdi',   shops: 2, points: 520,  badge: ''   },
                { name: 'Sonia Jbali',     shops: 2, points: 380,  badge: ''   },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <div className="w-7 h-7 bg-[#F2F1EE] border border-[#E0DDD8] rounded-full flex items-center justify-center text-sm font-bold text-[#297A74] shrink-0">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0C1F1D]">{c.name} {c.badge}</div>
                    <div className="text-xs text-[#297A74]">{c.shops} commerces visités</div>
                  </div>
                  <div className="text-sm font-bold text-[#297A74]">{c.points} pts</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
            <h3 className="text-[#0C1F1D] mb-4 text-sm font-semibold">{p.perfByShop}</h3>
            <div className="space-y-4">
              {[
                { name: 'Boulangerie Safi', score: 90, trend: '+12%' },
                { name: 'Café Al Baraka',   score: 75, trend: '+8%'  },
                { name: 'Boutique Nour',    score: 55, trend: '+4%'  },
                { name: 'Pharmacie Atlas',  score: 40, trend: '-2%'  },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-[#0C1F1D]">{s.name}</span>
                    <span className={`text-xs font-semibold ${s.trend.startsWith('+') ? 'text-[#297A74]' : 'text-red-500'}`}>{s.trend}</span>
                  </div>
                  <div className="h-2 bg-[#E0DDD8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0C1F1D] rounded-full" style={{ width: `${s.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shared offers */}
        <div className="bg-[#FAFAF8] rounded-xl p-6 shadow-sm border border-[#E0DDD8]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[#0C1F1D] text-sm font-semibold">{p.sharedOffers}</h3>
              <p className="text-[#297A74] text-xs mt-0.5">{p.sharedOffersSub}</p>
            </div>
            <button className="flex items-center gap-2 bg-[#0C1F1D] text-[#A6D8D2] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1a3533] transition-colors">
              <Plus className="w-4 h-4" /> {p.newOffer}
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {sharedOffers.map((offer, i) => (
              <div key={i} className={`border rounded-xl p-4 transition-colors hover:border-[#A6D8D2] ${offer.active ? 'border-[#E0DDD8]' : 'border-[#E0DDD8] opacity-65'}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 bg-[#A6D8D2]/15 rounded-xl flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4 text-[#297A74]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${offer.active ? 'bg-[#A6D8D2]/15 border-[#A6D8D2]/30 text-[#297A74]' : 'bg-[#F2F1EE] border-[#E0DDD8] text-[#297A74]/50'}`}>
                      {offer.active ? 'Actif' : 'Inactif'}
                    </span>
                    <button className="text-[#297A74] hover:text-[#0C1F1D]"><Settings className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="font-semibold text-[#0C1F1D] text-sm mb-1">{offer.title}</div>
                <p className="text-[#297A74] text-xs mb-3 leading-relaxed">{offer.desc}</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">{offer.shops.map((e, j) => <span key={j} className="text-sm">{e}</span>)}</div>
                  <span className="text-xs bg-[#A6D8D2]/15 text-[#297A74] px-2 py-0.5 rounded-full border border-[#A6D8D2]/25">{offer.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner note */}
        <div className="bg-[#0C1F1D] rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <JigoulaIcon variant="dark" className="w-16 h-7 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#A6D8D2] flex items-center gap-2">
                {p.noteTitle}
                <span className="text-xs bg-[#A6D8D2]/10 border border-[#A6D8D2]/20 text-[#A6D8D2] px-2 py-0.5 rounded-full">PFE 2025</span>
              </div>
              <p className="text-white/45 text-sm mt-1.5 leading-relaxed max-w-2xl">
                {p.noteSub}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {['Multi-enseignes','Fidélité partagée','Offres communes','Vision globale KPIs'].map(tag => (
                  <span key={tag} className="text-xs bg-[#A6D8D2]/10 border border-[#A6D8D2]/20 text-[#A6D8D2] px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
