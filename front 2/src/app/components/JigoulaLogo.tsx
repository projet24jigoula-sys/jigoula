import type { CSSProperties } from 'react';

/* Jigoula.cards — Brand identity components
   Logo: loyalty card icon with rising bar chart + growth arrow
   Palette: Deep Forest #0C1F1D · Aerial Mint #A6D8D2 · Deep Teal #297A74
   Font: Sora SemiBold (brand) · Inter (body) · Cairo (Arabic) */

interface JigoulaIconProps {
  variant?: 'dark' | 'light';
  className?: string;
  style?: CSSProperties;
}

/* ── Icon mark: card with bar chart + arrow ──────────────── */
export function JigoulaIcon({ variant = 'dark', className = '', style }: { variant?: 'dark' | 'light', className?: string, style?: CSSProperties }) {
  const bg = variant === 'dark' ? '#A6D8D2' : '#0C1F1D';
  const outLine = variant === 'dark' ? '#0C1F1D' : '#A6D8D2';
  const corePoint = variant === 'dark' ? '#FAFAF8' : '#A6D8D2';
  const divider = variant === 'dark' ? '#0C1F1D' : '#FAFAF8';

  return (
    <svg viewBox="0 0 340 240" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Eye Shape Frame */}
      <path d="M42,70 C78,25 262,25 298,70 C262,115 78,115 42,70Z" fill={bg} />
      {/* Loyalty/Signal Lines */}
      <path d="M122,95 C122,70 143.5,50 170,50 C196.5,50 218,70 218,95" fill="none" stroke={outLine} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M136,95 C136,77 151.2,62 170,62 C188.8,62 204,77 204,95" fill="none" stroke={outLine} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M150,95 C150,84 159,75 170,75 C181,75 190,84 190,95" fill="none" stroke={divider} strokeWidth="4.5" strokeLinecap="round" />
      {/* The Core Point */}
      <circle cx="170" cy="92" r="7.5" fill={corePoint} />
    </svg>
  );
}

/* ── App icon: dark rounded square (for favicons / mobile) ── */
export function JigoulaAppIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0C1F1D" />
      <rect x="10" y="40" width="10" height="14" rx="2" fill="#A6D8D2" opacity="0.5" />
      <rect x="27" y="30" width="10" height="24" rx="2" fill="#A6D8D2" opacity="0.75" />
      <rect x="44" y="20" width="10" height="34" rx="2" fill="#A6D8D2" />
      <path d="M44 20 L54 10" stroke="#FAFAF8" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 10 L54 10 L54 18" stroke="#FAFAF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10 42 L27 33 L44 22" fill="none" stroke="#FAFAF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
    </svg>
  );
}

/* ── Full stacked lockup — hero / auth ───────────────────── */
export function JigoulaLogoFull({ width = 220, variant = 'light' }: { width?: number, variant?: 'dark' | 'light' }) {
  const isLight = variant === 'light';
  const bgFill = isLight ? '#0C1F1D' : '#A6D8D2';
  const strokeColor = isLight ? '#A6D8D2' : '#0C1F1D';
  const innerStroke = isLight ? '#FAFAF8' : '#FAFAF8';
  const dotColor = isLight ? '#A6D8D2' : '#0C1F1D';
  const text1 = isLight ? '#0C1F1D' : '#ffffff';
  const text2 = isLight ? '#297A74' : '#A6D8D2';

  return (
    <div className="flex flex-col items-center select-none" style={{ width }}>
      <svg viewBox="0 0 340 240" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M42,70 C78,25 262,25 298,70 C262,115 78,115 42,70Z" fill={bgFill} />
        <path d="M122,95 C122,70 143.5,50 170,50 C196.5,50 218,70 218,95" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
        <path d="M136,95 C136,77 151.2,62 170,62 C188.8,62 204,77 204,95" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
        <path d="M150,95 C150,84 159,75 170,75 C181,75 190,84 190,95" fill="none" stroke={innerStroke} strokeWidth="6" strokeLinecap="round" />
        <circle cx="170" cy="92" r="8" fill={strokeColor} />

        <text x="170" y="162" textAnchor="middle" fontFamily="'Century Gothic', 'Trebuchet MS', system-ui, sans-serif" fontSize="38" fontWeight="bold" letterSpacing="9" fill={text1}>JIGOULA</text>
        <line x1="90" y1="178" x2="250" y2="178" stroke={strokeColor} strokeWidth="1.5" opacity="0.8" />
        <text x="170" y="210" textAnchor="middle" fontFamily="'Century Gothic', 'Trebuchet MS', system-ui, sans-serif" fontSize="16" fontWeight="normal" letterSpacing="14" fill={text2}>CARDS</text>
      </svg>
    </div>
  );
}

/* ── Horizontal wordmark — navbar ────────────────────────── */
export function JigoulaLogo({ size = 'md', variant = 'light' }: { size?: 'sm' | 'md' | 'lg', variant?: 'dark' | 'light' }) {
  const sizes = { sm: 90, md: 130, lg: 180 };
  const w = sizes[size];
  const isLight = variant === 'light';

  const bgFill = isLight ? '#0C1F1D' : '#A6D8D2';
  const strokeColor = isLight ? '#A6D8D2' : '#0C1F1D';
  const innerStroke = isLight ? '#FAFAF8' : '#FAFAF8';
  const text1 = isLight ? '#0C1F1D' : '#ffffff';
  const text2 = isLight ? '#297A74' : '#A6D8D2';

  return (
    <div className="flex items-center select-none" style={{ width: w }}>
      <svg viewBox="0 0 340 180" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
        {/* Adjusted viewBox heavily to act as a horizontal logo */}
        <g transform="scale(0.85) translate(0, 15)">
          <path d="M42,70 C78,25 262,25 298,70 C262,115 78,115 42,70Z" fill={bgFill} />
          <path d="M122,95 C122,70 143.5,50 170,50 C196.5,50 218,70 218,95" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M136,95 C136,77 151.2,62 170,62 C188.8,62 204,77 204,95" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M150,95 C150,84 159,75 170,75 C181,75 190,84 190,95" fill="none" stroke={innerStroke} strokeWidth="6" strokeLinecap="round" />
          <circle cx="170" cy="92" r="8" fill={strokeColor} />
          <text x="170" y="162" textAnchor="middle" fontFamily="'Century Gothic', 'Trebuchet MS', system-ui, sans-serif" fontSize="38" fontWeight="bold" letterSpacing="9" fill={text1}>JIGOULA</text>
          <text x="170" y="195" textAnchor="middle" fontFamily="'Century Gothic', 'Trebuchet MS', system-ui, sans-serif" fontSize="16" fontWeight="normal" letterSpacing="14" fill={text2}>CARDS</text>
        </g>
      </svg>
    </div>
  );
}
