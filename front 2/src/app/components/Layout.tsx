import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { JigoulaLogo } from './JigoulaLogo';
import { useLang } from '../context/LangContext';

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center bg-[#0C1F1D]/8 rounded-lg p-0.5 border border-[#0C1F1D]/10">
      {(['fr', 'ar'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-md text-xs font-semibold tracking-wider uppercase transition-all ${
            lang === l
              ? 'bg-[#0C1F1D] text-[#A6D8D2] shadow-sm'
              : 'text-[#297A74] hover:text-[#0C1F1D]'
          }`}
        >
          {l === 'fr' ? 'FR' : 'ع'}
        </button>
      ))}
    </div>
  );
}

function LangToggleDark() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/14">
      {(['fr', 'ar'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-md text-xs font-semibold tracking-wider uppercase transition-all ${
            lang === l
              ? 'bg-[#A6D8D2] text-[#0C1F1D] shadow-sm'
              : 'text-white/55 hover:text-white'
          }`}
        >
          {l === 'fr' ? 'FR' : 'ع'}
        </button>
      ))}
    </div>
  );
}

export default function Layout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { t }     = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLanding  = location.pathname === '/';
  const isMerchant = location.pathname.startsWith('/merchant');
  const isPartner  = location.pathname.startsWith('/partner');
  const isClient   = location.pathname.startsWith('/client');

  useEffect(() => {
    if (!isLanding) return;
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [isLanding]);

  if (isClient) {
    return (
      <div className="min-h-screen bg-[#F2F1EE]">
        <Outlet />
      </div>
    );
  }

  const navBg = isLanding
    ? scrolled
      ? 'bg-[#0C1F1D]/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/6'
      : 'bg-transparent'
    : 'bg-[#FAFAF8] border-b border-[#E0DDD8] shadow-sm';

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F1EE]">
      <header className={`${isLanding ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-30 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <JigoulaLogo variant={isLanding ? 'dark' : 'light'} size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {!isMerchant && !isPartner && (
              <>
                {[
                  { to: '/client/demo', label: t.nav.client   },
                  { to: '/merchant',   label: t.nav.merchant  },
                  { to: '/partner',    label: t.nav.partner   },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      isLanding
                        ? 'text-white/65 hover:text-white hover:bg-white/8'
                        : 'text-[#297A74] hover:text-[#0C1F1D] hover:bg-[#A6D8D2]/15'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  to="/login"
                  className={`ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
                    isLanding
                      ? 'bg-[#A6D8D2] text-[#0C1F1D] hover:bg-[#8fccc5]'
                      : 'bg-[#0C1F1D] text-[#A6D8D2] hover:bg-[#1a3533]'
                  }`}
                >
                  {t.nav.login}
                </Link>
              </>
            )}
            {(isMerchant || isPartner) && (
              <div className="flex items-center gap-2">
                {isMerchant && (
                  <Link to="/partner" className="px-3 py-2 text-sm text-[#297A74] hover:bg-[#A6D8D2]/15 rounded-lg transition-colors">
                    {t.nav.partnerSpace}
                  </Link>
                )}
                {isPartner && (
                  <Link to="/merchant" className="px-3 py-2 text-sm text-[#297A74] hover:bg-[#A6D8D2]/15 rounded-lg transition-colors">
                    {t.nav.merchantSpace}
                  </Link>
                )}
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#297A74]/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />{t.nav.logout}
                </button>
              </div>
            )}
            {isLanding ? <LangToggleDark /> : <LangToggle />}
          </nav>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            {isLanding ? <LangToggleDark /> : <LangToggle />}
            <button
              className="p-2 rounded-lg transition-colors hover:bg-white/8"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen
                ? <X size={20} className={isLanding ? 'text-white' : 'text-[#0C1F1D]'} />
                : <Menu size={20} className={isLanding ? 'text-white' : 'text-[#0C1F1D]'} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={`md:hidden border-t shadow-lg ${isLanding ? 'bg-[#0C1F1D]/98 border-white/8' : 'bg-[#FAFAF8] border-[#E0DDD8]'}`}>
            <div className="px-4 py-3 flex flex-col gap-1">
              {[
                { to: '/client/demo', label: t.nav.client   },
                { to: '/merchant',   label: t.nav.merchant  },
                { to: '/partner',    label: t.nav.partner   },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`py-2.5 px-3 rounded-lg text-sm transition-colors ${
                    isLanding
                      ? 'text-white/75 hover:text-white hover:bg-white/8'
                      : 'text-[#0C1F1D] hover:bg-[#A6D8D2]/15'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/login"
                className={`py-2.5 px-3 font-semibold rounded-lg text-sm transition-colors ${
                  isLanding
                    ? 'text-[#A6D8D2] hover:bg-white/8'
                    : 'text-[#297A74] hover:bg-[#A6D8D2]/15'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {t.nav.login}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className={`flex-1 ${isLanding ? '' : ''}`}><Outlet /></main>
    </div>
  );
}
