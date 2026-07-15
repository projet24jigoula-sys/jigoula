import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import * as Tabs from '@radix-ui/react-tabs';
import { ArrowRight, Eye, EyeOff, Store, Building2, AlertCircle } from 'lucide-react';
import { JigoulaLogoFull } from '../components/JigoulaLogo';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { login, registerClient } = useAuth();
  const a = t.auth;
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(searchParams.get('register') === 'true');
  const [userType, setUserType] = useState<'merchant' | 'partner' | 'client'>('client');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (isRegister && userType === 'client') {
        user = await registerClient({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          email: email,
          password: password
        });
        toast.success("Compte créé avec succès !");
      } else {
        user = await login(email, password);
      }

      // Determine where they should go based on their role
      if (user.role === 'ADMIN') {
        navigate('/partner');
      } else if (user.role === 'MERCHANT') {
        navigate('/merchant');
      } else if (user.role === 'CLIENT') {
        try {
          const { apiRequest } = await import('../../api/api');
          const visited = await apiRequest('/client/visited-shops');
          if (visited && visited.shops && visited.shops.length === 1) {
            navigate(`/client/${visited.shops[0].shop_id}`);
          } else {
            navigate('/client/dashboard');
          }
        } catch (e) {
          navigate('/client/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fontStyle = { fontFamily: lang === 'ar' ? "'Cairo',sans-serif" : "'Century Gothic','Trebuchet MS',sans-serif" };

  return (
    <div className="min-h-screen bg-[#F2F1EE] flex items-center justify-center p-6" style={fontStyle}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/"><JigoulaLogoFull variant="light" width={160} /></Link>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-[#0C1F1D]">{a.title}</h2>
          <p className="text-[#297A74] text-sm mt-1">{a.sub}</p>
        </div>

        <div className="bg-[#FAFAF8] rounded-2xl shadow-sm border border-[#E0DDD8] p-8">
          <Tabs.Root value={userType} onValueChange={(v) => setUserType(v as 'merchant' | 'partner' | 'client')}>
            <Tabs.List className="grid grid-cols-3 bg-[#F2F1EE] rounded-xl p-1 mb-6">
              <Tabs.Trigger value="client" className="flex items-center justify-center py-2.5 px-2 rounded-lg text-sm data-[state=active]:bg-[#0C1F1D] data-[state=active]:text-[#A6D8D2] text-[#297A74] transition-all font-semibold">
                Client
              </Tabs.Trigger>
              <Tabs.Trigger value="merchant" className="flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm data-[state=active]:bg-[#0C1F1D] data-[state=active]:text-[#A6D8D2] text-[#297A74] transition-all">
                {a.tabMerchant}
              </Tabs.Trigger>
              <Tabs.Trigger value="partner" className="flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm data-[state=active]:bg-[#0C1F1D] data-[state=active]:text-[#A6D8D2] text-[#297A74] transition-all">
                {a.tabPartner}
              </Tabs.Trigger>
            </Tabs.List>

            {(['client', 'merchant', 'partner'] as const).map((type) => (
              <Tabs.Content key={type} value={type}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {isRegister && type === 'client' && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" required className="w-full border border-[#E0DDD8] bg-[#F2F1EE] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#A6D8D2] focus:ring-2 focus:ring-[#A6D8D2]/20 text-[#0C1F1D]" />
                      </div>
                      <div>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" required className="w-full border border-[#E0DDD8] bg-[#F2F1EE] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#A6D8D2] focus:ring-2 focus:ring-[#A6D8D2]/20 text-[#0C1F1D]" />
                      </div>
                      <div className="col-span-2">
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="N° Téléphone (+216...)" required className="w-full border border-[#E0DDD8] bg-[#F2F1EE] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#A6D8D2] focus:ring-2 focus:ring-[#A6D8D2]/20 text-[#0C1F1D]" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#0C1F1D] mb-1.5">
                      {type === 'merchant' ? a.emailLabel : a.emailPartner}
                    </label>
                    <input
                      type={type === 'merchant' ? 'text' : 'email'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={type === 'merchant' ? 'cafe.albaraka@gmail.com' : 'groupe.nabeul@partner.tn'}
                      className="w-full border border-[#E0DDD8] bg-[#F2F1EE] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#A6D8D2] focus:ring-2 focus:ring-[#A6D8D2]/20 text-[#0C1F1D] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0C1F1D] mb-1.5">{a.password}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        className="w-full border border-[#E0DDD8] bg-[#F2F1EE] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#A6D8D2] focus:ring-2 focus:ring-[#A6D8D2]/20 text-[#0C1F1D] transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#297A74] hover:text-[#0C1F1D] p-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 mb-5">
                    {type === 'client' ? (
                      <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-xs text-[#297A74] hover:underline">
                        {isRegister ? "Déjà membre ? Se connecter" : "Créer un compte client"}
                      </button>
                    ) : (
                      <span />
                    )}
                    <a href="#" className="text-xs text-[#297A74] hover:underline">{a.forgot}</a>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#0C1F1D] text-[#A6D8D2] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#1a3533] transition-colors shadow-sm disabled:opacity-50">
                    {loading ? '...' : (isRegister && type === 'client' ? "S'inscrire" : a.submit)} {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </Tabs.Content>
            ))}
          </Tabs.Root>

          <div className="mt-6 pt-6 border-t border-[#E0DDD8] text-center">
            <Link to="/" className="text-sm text-[#297A74] hover:text-[#0C1F1D] transition-colors">{a.back}</Link>
          </div>
        </div>

        <div className="mt-4 bg-[#A6D8D2]/10 border border-[#A6D8D2]/25 rounded-xl p-4 text-center">
          <p className="text-[#297A74] text-sm">
            <span className="font-semibold text-[#0C1F1D]">{a.demoTitle}</span> — {a.demoSub}
          </p>
        </div>
      </div>
    </div>
  );
}
