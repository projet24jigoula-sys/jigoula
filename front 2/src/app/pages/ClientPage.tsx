import { useParams, Link } from 'react-router';
import { Gift, Clock, ArrowLeft, CheckCircle, MapPin, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { JigoulaIcon } from '../components/JigoulaLogo';
import { useLang } from '../context/LangContext';
import { apiRequest } from '../../api/api';
import { useAuth } from '../context/AuthContext';

export default function ClientPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const c = t.client;
  const [justScanned, setJustScanned] = useState(true);
  const [reviewDone, setReviewDone] = useState(false);

  const [shop, setShop] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setJustScanned(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        // GET /client/shops/{shop_id} returns ClientShopDetailsResponse: { shop, visits }
        const details = await apiRequest(`/client/shops/${shopId}`);
        setShop(details.shop);          // ClientVisitedShopResponse
        setProgress(details.shop?.loyalty ?? null);  // LoyaltyProgressResponse nested
        setHistory(details.visits ?? []);  // ScanHistoryResponse[]
      } catch (err) {
        console.error('ClientPage load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [shopId]);

  const stampCols = (progress?.required_visits || 10) <= 8 ? 4 : 5;

  const fontStyle = {
    fontFamily: lang === 'ar' ? "'Cairo',sans-serif" : "'Century Gothic','Trebuchet MS',sans-serif",
  };

  const th = {
    headerBg: 'linear-gradient(160deg, #1A0A04 0%, #4A1C08 50%, #1A0A04 100%)',
    cardGradient: 'linear-gradient(140deg, #2D1208 0%, #6B2810 70%, #3D1A0A 100%)',
    accent: '#E8A06A',
    accentDim: 'rgba(232,160,106,0.14)',
    accentBorder: 'rgba(232,160,106,0.24)',
    stampFilled: '#E8A06A',
    stampFilledText: '#1A0A04',
    muted: 'rgba(232,160,106,0.55)',
    glow: '0 0 60px rgba(232,160,106,0.08)',
  };

  if (loading) return <div className="min-h-screen bg-[#F2F1EE] flex items-center justify-center">Chargement...</div>;
  if (!shop) return <div className="min-h-screen bg-[#F2F1EE] flex items-center justify-center">Shop not found</div>;

  return (
    <div className="min-h-screen bg-[#F2F1EE] flex justify-center" style={fontStyle}>
      <div className="w-full max-w-md flex flex-col">

        {/* Scan confirmation banner */}
        <div
          className={`text-white px-5 py-3 flex items-center gap-3 transition-all duration-700 overflow-hidden ${justScanned ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ background: th.headerBg }}
        >
          <CheckCircle className="w-5 h-5 shrink-0" style={{ color: th.accent }} />
          <span className="text-sm font-medium">{c.scanOk}</span>
        </div>

        {/* Shop header */}
        <div className="text-white relative overflow-hidden" style={{ background: th.headerBg }}>
          {/* Decorative radial blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-30" style={{ background: th.accent }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-20" style={{ background: th.accent }} />
          </div>
          <div className="relative px-6 pt-6 pb-14">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm mb-6 w-fit transition-opacity hover:opacity-100"
              style={{ color: th.muted }}
            >
              <ArrowLeft className="w-4 h-4" /> {c.back}
            </Link>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                style={{ background: th.accentDim, border: `1.5px solid ${th.accentBorder}` }}
              >
                {shop.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-white leading-tight text-lg">{shop.name}</h1>
                <div className="flex items-center gap-1.5 text-sm mt-1" style={{ color: th.muted }}>
                  <MapPin className="w-3.5 h-3.5 shrink-0" />{shop.location}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 -mt-8 px-4 pb-6 space-y-4">

          {/* Customer identity */}
          <div className="bg-[#FAFAF8] rounded-2xl p-5 shadow-md border border-[#E0DDD8]">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{ background: th.accentDim, color: th.accent, border: `1.5px solid ${th.accentBorder}` }}
              >
                {user?.full_name?.substring(0, 2).toUpperCase() || 'Me'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#0C1F1D]">{user?.full_name || 'Client'}</div>
                <div className="text-sm text-[#297A74] truncate">
                  {user?.email}
                </div>
              </div>
              <div
                className="shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: th.accentDim, color: th.accent, border: `1px solid ${th.accentBorder}` }}
              >
                {progress?.total_visits || 0} {c.visits}
              </div>
            </div>
          </div>

          {/* Loyalty card — Stamps */}
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: th.cardGradient, boxShadow: th.glow }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: `radial-gradient(ellipse at 90% 10%, ${th.accentDim} 0%, transparent 55%)` }}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: th.muted }}>
                    {lang === 'ar' ? 'كارت الولاء' : 'CARTE FIDÉLITÉ'}
                  </div>
                  <div className="font-semibold text-white">{c.collectVisits.replace('{n}', String(progress?.required_visits || 10))}</div>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: th.accentDim, border: `1px solid ${th.accentBorder}` }}
                >
                  🎫
                </div>
              </div>
              <div
                className="grid gap-2 mb-4"
                style={{ gridTemplateColumns: `repeat(${stampCols}, 1fr)` }}
              >
                {Array.from({ length: progress?.required_visits || 10 }).map((_, i) => {
                  const isActive = progress ? i < progress.active_visits_count : false;
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-xl flex items-center justify-center font-semibold transition-all"
                      style={
                        isActive
                          ? { background: th.stampFilled, color: th.stampFilledText, fontSize: 14 }
                          : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.22)', fontSize: 11 }
                      }
                    >
                      {isActive ? '✓' : i + 1}
                    </div>
                  );
                })}
              </div>
              <div
                className="rounded-xl px-4 py-2.5 flex items-center justify-between"
                style={{ background: th.accentDim, border: `1px solid ${th.accentBorder}` }}
              >
                <span className="text-sm font-semibold" style={{ color: th.accent }}>
                  {c.stampsProgress.replace('{cur}', String(progress?.active_visits_count || 0)).replace('{total}', String(progress?.required_visits || 10))}
                </span>
                <span className="text-sm text-white/65">🎁 <span className="font-medium">{progress?.reward_title || 'Récompense'}</span></span>
              </div>
            </div>
          </div>

          {/* Reward status */}
          <div className="bg-[#FAFAF8] rounded-2xl p-5 shadow-sm border border-[#E0DDD8]">
            <h3 className="text-[#0C1F1D] mb-3 flex items-center gap-2 text-sm font-semibold">
              <Gift className="w-4 h-4 text-[#297A74]" />{c.rewards}
            </h3>
            {progress?.is_eligible_for_reward ? (
              <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ background: th.accentDim, border: `1px solid ${th.accentBorder}` }}
              >
                <div>
                  <div className="font-semibold text-sm" style={{ color: th.accent }}>{progress?.reward_title}</div>
                  <div className="text-xs text-[#297A74]/70 mt-0.5">{c.presentCounter}</div>
                </div>
                <span className="text-2xl">🎉</span>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-[#297A74] text-sm">
                  {c.stillNeeded.replace('{n}', String((progress?.required_visits || 10) - (progress?.active_visits_count || 0)))}
                </div>
                <div className="mt-2 text-sm font-semibold" style={{ color: th.accent }}>🎁 {progress?.reward_title}</div>
              </div>
            )}
          </div>

          {/* Visit history */}
          <div className="bg-[#FAFAF8] rounded-2xl p-5 shadow-sm border border-[#E0DDD8]">
            <h3 className="text-[#0C1F1D] mb-4 flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-4 h-4 text-[#297A74]" />{c.history}
            </h3>
            <div className="space-y-0">
              {history.length === 0 && <div className="text-sm text-gray-500 py-2">Aucune visite récente</div>}
              {history.map((visit: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0 border-[#F2F1EE]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                      style={{ background: th.accentDim }}
                    >
                      ☕
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#0C1F1D]">{new Date(visit.scanned_at).toLocaleDateString()}</div>
                      <div className="text-xs text-[#297A74]">{new Date(visit.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <span className="text-xs text-[#297A74]">{c.visitLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Google review CTA */}
          {!reviewDone ? (
            <div
              className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ background: th.cardGradient }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: `radial-gradient(ellipse at 0% 100%, ${th.accentDim} 0%, transparent 55%)` }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5" fill="currentColor" style={{ color: th.accent }} />
                  <span className="font-semibold text-sm">{c.reviewTitle}</span>
                </div>
                <p className="text-white/55 text-sm mb-4 leading-relaxed">
                  {c.reviewSub.replace('{n}', String(shop.currentStamps))}
                </p>
                <button
                  onClick={() => setReviewDone(true)}
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ background: th.stampFilled, color: th.stampFilledText }}
                >
                  ⭐ {c.reviewBtn}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: th.accentDim, border: `1px solid ${th.accentBorder}` }}
            >
              <div className="text-3xl mb-2">🙏</div>
              <div className="font-semibold" style={{ color: th.accent }}>{c.reviewDone}</div>
              <div className="text-sm text-[#297A74]/70 mt-1">{c.reviewDoneSub}</div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-2 pb-4">
            <div className="flex items-center justify-center gap-2 text-[#297A74]/35 text-xs">
              <JigoulaIcon variant="light" className="w-8 h-3" />{c.poweredBy}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
