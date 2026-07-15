import { Link } from 'react-router';
import { BarChart3, ArrowRight, CheckCircle, Smartphone, Store, Building2, ChevronRight, Zap, MapPin, Sparkles } from 'lucide-react';
import { JigoulaLogoFull, JigoulaIcon, JigoulaLogo } from '../components/JigoulaLogo';
import { useLang } from '../context/LangContext';

const tiers = [
  {
    key: 'Silver', name: { fr: 'Silver (Argent)', ar: 'فضي' }, target: { fr: 'Micro-cafés, fast-food, boutiques locales', ar: 'مقاهي صغيرة، وجبات سريعة، متاجر محلية' }, price: 49, color: 'light', popular: false,
    features: {
      fr: ['1 Compte Admin Merchant', 'Carte de tampons digitale (logique 10 tampons)', 'Dashboard basique', "Jusqu'à 300 clients réguliers"],
      ar: ['حساب إداري واحد للتاجر', 'بطاقة أختام رقمية (10 أختام)', 'لوحة تحكم أساسية', 'حتى 300 عميل مسجل']
    }
  },
  {
    key: 'Gold', name: { fr: 'Gold (Or)', ar: 'ذهبي' }, target: { fr: 'Lounge cafés, restaurants, Gyms', ar: 'مقاهي لونج، مطاعم، قاعات رياضة' }, price: 119, color: 'dark', popular: true,
    features: {
      fr: ['Tout du plan Silver', 'Multiplicateur de points (ex: double points le matin)', 'Mode Gym : Suivi des abonnements mensuels', 'Segmentation (Top 20% vs Inactifs)', 'Clients illimités'],
      ar: ['كل ما في الباقة الفضية', 'مضاعفة النقاط (مثل ضعف النقاط في الصباح)', 'وضع الجيم: تتبع الاشتراكات الشهرية', 'تقسيم العملاء (أفضل 20% مقابل غير النشطين)', 'عملاء غير محدودين']
    }
  },
  {
    key: 'Platinum', name: { fr: 'Platinum (Platinium)', ar: 'بلاتيني' }, target: { fr: 'Marques premium, franchises, multi-branches', ar: 'علامات تجارية فاخرة، فروع متعددة' }, price: 249, color: 'mint', popular: false,
    features: {
      fr: ['Tout du plan Gold', 'Outil de diffusion SMS/Notifications', 'Synchronisation multi-filières', 'Branding sur-mesure & Export analytique', 'Ligne WhatsApp dédiée au support'],
      ar: ['كل ما في الباقة الذهبية', 'أداة بث رسائل SMS/إشعارات', 'مزامنة مواقع متعددة', 'تصميم مخصص وتصدير تحليلات', 'خط دعم واتساب مخصص']
    }
  },
];

/* ── Mini phone mockup in hero ───────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative flex justify-center items-center">
      {/* Glow ring */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{ width: 280, height: 280, background: 'radial-gradient(circle, rgba(166,216,210,0.12) 0%, transparent 70%)' }}
      />
      {/* Floating card behind */}
      <div
        className="absolute -right-4 -top-8 w-44 rounded-2xl px-3 py-2.5 text-xs text-white shadow-2xl border border-white/8"
        style={{ background: 'linear-gradient(135deg,#1A3533,#0C1F1D)' }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-green-400 font-semibold tracking-wide" style={{ fontSize: 9 }}>NOUVELLE VISITE</span>
        </div>
        <div className="text-white/90 font-semibold" style={{ fontSize: 10 }}>Tampon ajouté ✓</div>
        <div className="text-white/40" style={{ fontSize: 9 }}>Café Al Baraka · Il y a 2 sec</div>
      </div>

      {/* Phone frame */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 220,
          height: 440,
          background: '#090f0e',
          borderRadius: 36,
          border: '2px solid rgba(166,216,210,0.14)',
          boxShadow: '0 50px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(166,216,210,0.06), inset 0 1px 0 rgba(166,216,210,0.08)',
        }}
      >
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 80, height: 22, background: '#040a09', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a2e2b' }} />
          </div>
        </div>

        <div style={{ padding: '4px 10px 10px', display: 'flex', flexDirection: 'column', gap: 6, height: 'calc(100% - 36px)' }}>
          {/* Shop header mini */}
          <div style={{ background: 'linear-gradient(135deg, #1C0D07, #3D1A0A)', borderRadius: 14, padding: '10px 11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 30, height: 30, background: 'rgba(232,160,106,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, border: '1px solid rgba(232,160,106,0.2)' }}>☕</div>
              <div>
                <div style={{ color: 'white', fontSize: 9, fontWeight: 600 }}>Café Al Baraka</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 7.5, marginTop: 1 }}>Nabeul · Av. Bourguiba</div>
              </div>
            </div>
          </div>

          {/* Customer identity mini */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(232,160,106,0.15)', border: '1px solid rgba(232,160,106,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8A06A', fontSize: 8, fontWeight: 700 }}>AH</div>
            <div>
              <div style={{ color: 'white', fontSize: 8.5, fontWeight: 600 }}>Ahmed Hamdi</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7 }}>Membre depuis Mars 2025</div>
            </div>
            <div style={{ marginLeft: 'auto', background: 'rgba(232,160,106,0.14)', border: '1px solid rgba(232,160,106,0.22)', borderRadius: 20, padding: '2px 6px', color: '#E8A06A', fontSize: 7, fontWeight: 700 }}>7 visites</div>
          </div>

          {/* Loyalty card mini */}
          <div style={{ background: 'linear-gradient(140deg, #2D1208, #6B2810)', borderRadius: 14, padding: '10px 11px', flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'rgba(232,160,106,0.08)', borderRadius: '50%', filter: 'blur(20px)' }} />
            <div style={{ color: '#E8A06A', fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7, opacity: 0.8 }}>Carte Fidélité</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, marginBottom: 7 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{
                  height: 24,
                  borderRadius: 5,
                  background: i < 7 ? '#E8A06A' : 'rgba(255,255,255,0.07)',
                  border: i < 7 ? 'none' : '1px solid rgba(255,255,255,0.09)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i < 7 ? 9 : 7,
                  color: i < 7 ? '#1A0A04' : 'rgba(255,255,255,0.2)',
                  fontWeight: 700,
                }}>
                  {i < 7 ? '✓' : i + 1}
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(232,160,106,0.12)', border: '1px solid rgba(232,160,106,0.2)', borderRadius: 8, padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#E8A06A', fontSize: 7.5, fontWeight: 700 }}>7 / 10 tampons</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7.5 }}>🎁 Café gratuit</span>
            </div>
          </div>

          {/* Notification mini */}
          <div style={{ background: 'rgba(166,216,210,0.07)', border: '1px solid rgba(166,216,210,0.12)', borderRadius: 10, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13 }}>⭐</span>
            <div>
              <div style={{ color: 'white', fontSize: 8, fontWeight: 600 }}>Plus que 3 tampons!</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7 }}>Votre café gratuit vous attend</div>
            </div>
          </div>

          {/* Home indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 2 }}>
            <div style={{ width: 72, height: 3.5, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Bottom floating badge */}
      <div
        className="absolute -left-6 bottom-10 rounded-xl px-3 py-2 text-xs shadow-2xl border border-white/8"
        style={{ background: 'rgba(166,216,210,0.1)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[#A6D8D2] text-lg">📲</span>
          <div>
            <div className="text-white font-semibold" style={{ fontSize: 9 }}>Scan QR → Tampon</div>
            <div className="text-white/40" style={{ fontSize: 8 }}>En 2 secondes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature icon with color bg ──────────────────────────── */
function FeatureCard({ emoji, title, desc, color }: { emoji: string; title: string; desc: string; color: string }) {
  return (
    <div className="bg-[#FAFAF8] rounded-2xl p-6 border border-[#E0DDD8] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm" style={{ background: color }}>
        {emoji}
      </div>
      <h3 className="text-[#0C1F1D] mb-2 text-sm font-semibold">{title}</h3>
      <p className="text-[#297A74] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

const featureColors = [
  'rgba(166,216,210,0.25)', 'rgba(41,122,116,0.12)', 'rgba(232,160,106,0.18)',
  'rgba(197,133,224,0.18)', 'rgba(90,184,234,0.18)', 'rgba(237,184,74,0.18)',
];

export default function LandingPage() {
  const { t, lang } = useLang();
  const l = t.landing;

  return (
    <div className="min-h-screen" style={{ fontFamily: lang === 'ar' ? "'Cairo',sans-serif" : "'Sora','Century Gothic',sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-[#0C1F1D] text-white overflow-hidden" style={{ paddingTop: 112, paddingBottom: 80 }}>
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(166,216,210,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(166,216,210,0.04) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(41,122,116,0.18) 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(166,216,210,0.07) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-10 items-center">

            {/* Left — text content */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-10">
                <JigoulaLogoFull variant="dark" width={200} />
              </div>
              <div className="inline-flex items-center gap-2 bg-[#A6D8D2]/10 border border-[#A6D8D2]/20 px-4 py-2 rounded-full mb-8 text-sm text-[#A6D8D2]">
                <span className="w-2 h-2 bg-[#A6D8D2] rounded-full animate-pulse" />
                {l.badge}
              </div>
              <h1 className="text-4xl md:text-5xl text-white mb-6 leading-tight tracking-tight">
                {l.heroTitle}<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #A6D8D2, #5AB8EA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {l.heroAccent}
                </span><br />
                {l.heroTitle2}
              </h1>
              <p className="text-lg text-white/50 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">{l.heroSub}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/merchant"
                  className="inline-flex items-center justify-center gap-2 bg-[#A6D8D2] text-[#0C1F1D] px-7 py-3.5 rounded-xl font-semibold hover:bg-[#8fccc5] transition-colors shadow-lg"
                >
                  {l.cta1} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/6 border border-white/14 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                >
                  {l.cta2} <Smartphone className="w-4 h-4" />
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6 mt-14 max-w-sm mx-auto lg:mx-0">
                {[
                  { value: '3×', label: l.stat1 },
                  { value: '0', label: l.stat2 },
                  { value: '2 min', label: l.stat3 },
                ].map((s, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-[#A6D8D2]">{s.value}</div>
                    <div className="text-white/35 text-xs mt-1 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — phone mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Problems ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
            ⚠ {lang === 'ar' ? 'المشكلة' : 'Le problème'}
          </div>
          <h2 className="text-[#0C1F1D] mb-4">{l.problemTitle}</h2>
          <p className="text-[#297A74] max-w-2xl mx-auto mb-12 text-sm leading-relaxed">{l.problemSub}</p>
          <div className="grid md:grid-cols-3 gap-5">
            {l.problems.map((item, i) => (
              <div
                key={i}
                className="bg-[#FAFAF8] border border-[#E0DDD8] rounded-2xl p-7 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-red-200 to-transparent" />
                <div className="text-4xl mb-4 group-hover:scale-105 transition-transform duration-200">{item.icon}</div>
                <h3 className="text-[#0C1F1D] mb-2 text-base">{item.title}</h3>
                <p className="text-[#297A74] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three actors ─────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #F2F1EE 0%, #ECEAE6 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#A6D8D2]/20 border border-[#A6D8D2]/30 text-[#297A74] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" /> {lang === 'ar' ? 'حل متكامل' : 'Solution complète'}
            </div>
            <h2 className="text-[#0C1F1D] mb-4">{l.actorsTitle}</h2>
            <p className="text-[#297A74] max-w-2xl mx-auto text-sm leading-relaxed">{l.actorsSub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">

            {/* Client card */}
            <div className="bg-[#FAFAF8] rounded-2xl p-8 shadow-sm border border-[#E0DDD8] hover:shadow-lg hover:-translate-y-1 transition-all duration-250 flex flex-col">
              <div className="w-12 h-12 bg-[#A6D8D2]/20 rounded-xl flex items-center justify-center mb-5">
                <Smartphone className="w-6 h-6 text-[#297A74]" />
              </div>
              <div className="text-xs text-[#297A74] font-semibold uppercase tracking-widest mb-2">{l.clientRole}</div>
              <h3 className="text-[#0C1F1D] mb-2 text-base">{l.clientTitle}</h3>
              <p className="text-[#297A74] text-sm mb-5 leading-relaxed">{l.clientDesc}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {l.clientFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#0C1F1D]">
                    <CheckCircle className="w-4 h-4 text-[#297A74] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="flex items-center gap-1 text-[#297A74] text-sm font-semibold hover:gap-2 transition-all">
                {l.viewClient} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Merchant card — hero card */}
            <div
              className="rounded-2xl p-8 shadow-xl text-white relative overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-250"
              style={{ background: 'linear-gradient(145deg, #0C1F1D 0%, #153330 60%, #0C1F1D 100%)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(166,216,210,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(166,216,210,0.04) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(166,216,210,0.07) 0%, transparent 70%)' }} />
              <div className="relative flex flex-col flex-1">
                <div className="w-12 h-12 bg-[#A6D8D2]/10 border border-[#A6D8D2]/20 rounded-xl flex items-center justify-center mb-5">
                  <Store className="w-6 h-6 text-[#A6D8D2]" />
                </div>
                <div className="text-xs text-[#A6D8D2] font-semibold uppercase tracking-widest mb-2">{l.merchantRole}</div>
                <h3 className="text-white mb-2 text-base">{l.merchantTitle}</h3>
                <p className="text-white/50 text-sm mb-5 leading-relaxed">{l.merchantDesc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {l.merchantFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-[#A6D8D2] shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/merchant" className="flex items-center gap-1 text-[#A6D8D2] text-sm font-semibold hover:gap-2 transition-all">
                  {l.openDashboard} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Partner card */}
            <div className="bg-[#FAFAF8] rounded-2xl p-8 shadow-sm border border-[#E0DDD8] hover:shadow-lg hover:-translate-y-1 transition-all duration-250 flex flex-col">
              <div className="w-12 h-12 bg-[#A6D8D2]/20 rounded-xl flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6 text-[#297A74]" />
              </div>
              <div className="text-xs text-[#297A74] font-semibold uppercase tracking-widest mb-2">{l.partnerRole}</div>
              <h3 className="text-[#0C1F1D] mb-2 text-base">{l.partnerTitle}</h3>
              <p className="text-[#297A74] text-sm mb-5 leading-relaxed">{l.partnerDesc}</p>
              <ul className="space-y-2 mb-5 flex-1">
                {l.partnerFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#0C1F1D]">
                    <CheckCircle className="w-4 h-4 text-[#297A74] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs bg-[#A6D8D2]/15 text-[#297A74] px-3 py-1 rounded-full border border-[#A6D8D2]/30">
                  <Zap className="w-3 h-3" /> {l.partnerBadge}
                </span>
              </div>
              <Link to="/partner" className="flex items-center gap-1 text-[#297A74] text-sm font-semibold hover:gap-2 transition-all">
                {l.viewModule} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Steps ────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[#0C1F1D] mb-4">{l.stepsTitle}</h2>
          <p className="text-[#297A74] mb-14 text-sm">{l.stepsSub}</p>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[8%] right-[8%] h-px z-0" style={{ background: 'linear-gradient(90deg, transparent, #A6D8D2, #A6D8D2, transparent)', opacity: 0.4 }} />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-10 relative z-10">
              {l.steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-[#0C1F1D] rounded-2xl flex items-center justify-center text-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                      {step.emoji}
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#A6D8D2] text-[#0C1F1D] rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <div className="font-semibold text-[#0C1F1D] text-sm">{step.label}</div>
                  <p className="text-xs text-[#297A74] mt-1 text-center leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #F2F1EE 0%, #EAEAE6 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[#0C1F1D] mb-4">{l.pricingTitle}</h2>
            <p className="text-[#297A74] max-w-xl mx-auto text-sm leading-relaxed">{l.pricingSub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {tiers.map((tier) => {
              const isDark = tier.color === 'dark';
              const isMint = tier.color === 'mint';
              return (
                <div
                  key={tier.key}
                  className={`relative rounded-2xl p-8 flex flex-col ${isDark ? 'text-white' : ''}`}
                  style={
                    isDark
                      ? {
                        background: 'linear-gradient(145deg, #0C1F1D 0%, #153330 100%)',
                        boxShadow: '0 0 60px rgba(166,216,210,0.10), 0 20px 60px rgba(0,0,0,0.25)',
                        border: '1px solid rgba(166,216,210,0.15)',
                      }
                      : isMint
                        ? {
                          background: '#FAFAF8',
                          border: '2px solid #A6D8D2',
                          boxShadow: '0 4px 20px rgba(166,216,210,0.15)',
                        }
                        : {
                          background: '#FAFAF8',
                          border: '1px solid #E0DDD8',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }
                  }
                >
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#A6D8D2] text-[#0C1F1D] text-xs font-bold px-4 py-1 rounded-full tracking-wider uppercase shadow-sm">
                      ⭐ {l.popular}
                    </div>
                  )}
                  {isDark && (
                    <div
                      className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(166,216,210,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(166,216,210,0.03) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                      }}
                    />
                  )}
                  <div className="relative mb-6">
                    <div className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isDark ? 'text-[#A6D8D2]' : 'text-[#297A74]'}`}>
                      {tier.name[lang]}
                    </div>
                    <div className={`text-sm leading-snug ${isDark ? 'text-white/45' : 'text-[#297A74]'}`}>{tier.target[lang]}</div>
                  </div>
                  <div className="relative mb-6 pb-6" style={{ borderBottom: isDark ? '1px solid rgba(166,216,210,0.12)' : '1px solid #E0DDD8' }}>
                    <div className={`flex items-end gap-1.5 ${isDark ? 'text-white' : 'text-[#0C1F1D]'}`}>
                      <span className="text-4xl font-bold leading-none">{tier.price}</span>
                      <span className={`text-sm mb-1 ${isDark ? 'text-white/45' : 'text-[#297A74]'}`}>{l.currency}</span>
                    </div>
                  </div>
                  <ul className="relative space-y-3 flex-1">
                    {tier.features[lang].map((f, i) => (
                      <li key={i} className={`flex items-start gap-2.5 text-sm ${isDark ? 'text-white/70' : 'text-[#0C1F1D]'}`}>
                        <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${isDark ? 'text-[#A6D8D2]' : 'text-[#297A74]'}`} />{f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/login"
                    className={`relative mt-8 w-full py-3 rounded-xl text-sm font-semibold text-center transition-colors ${isDark
                      ? 'bg-[#A6D8D2] text-[#0C1F1D] hover:bg-[#8fccc5]'
                      : isMint
                        ? 'bg-[#0C1F1D] text-[#A6D8D2] hover:bg-[#1a3533]'
                        : 'bg-[#0C1F1D] text-white hover:bg-[#1a3533]'
                      }`}
                  >
                    {l.ctaStart} {tier.name[lang]}
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-center text-[#297A74] text-xs mt-8">{l.pricingNote}</p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[#0C1F1D] mb-4">{l.featuresTitle}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {l.features.map((f, i) => (
              <FeatureCard key={i} emoji={f.emoji} title={f.title} desc={f.desc} color={featureColors[i % featureColors.length]} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0C1F1D 0%, #142E2B 50%, #0C1F1D 100%)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(166,216,210,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(166,216,210,0.04) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(166,216,210,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <JigoulaIcon variant="dark" className="w-24 h-10" />
          </div>
          <h2 className="text-white mb-4">{l.ctaTitle}</h2>
          <p className="text-white/40 mb-10 text-sm leading-relaxed max-w-xl mx-auto">{l.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#A6D8D2] text-[#0C1F1D] px-8 py-4 rounded-xl font-semibold hover:bg-[#8fccc5] transition-colors shadow-xl"
            >
              {l.ctaFree} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/merchant"
              className="inline-flex items-center justify-center gap-2 border border-white/14 text-white/60 px-8 py-4 rounded-xl font-semibold hover:border-white/30 hover:text-white transition-colors"
            >
              {l.ctaDemo} <BarChart3 className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-[#060d0c] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <JigoulaLogo variant="dark" size="sm" />
          <div className="flex items-center gap-1.5 text-white/25 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'نابل، تونس · © 2025 Jigoula.cards' : 'Nabeul, Tunisie · © 2025 Jigoula.cards'}
          </div>
          <p className="text-white/20 text-xs tracking-wide">{l.footerPfe}</p>
        </div>
      </footer>
    </div>
  );
}
