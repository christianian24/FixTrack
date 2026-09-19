import React from 'react';
import { Outlet } from 'react-router-dom';
import { CheckCircle2, Building2, ArrowUpRight } from 'lucide-react';

const stats = [
  { label: 'Resolution', value: '98.4%', suffix: '' },
  { label: 'Avg. time', value: '1.8', suffix: ' hr' },
  { label: 'Locations', value: '14', suffix: '' },
];

const features = [
  'Duplicate detection prevents redundant work orders',
  'Photo-verified before & after audit trail',
  'Role-based access for all 5 user types',
];

export const AuthLayout: React.FC = () => {
  return (
    <div className="auth-shell relative isolate min-h-screen overflow-hidden bg-[#eef3f6] flex flex-col justify-between">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-ambient-orb absolute -left-20 top-10 h-[22rem] w-[22rem] rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="bg-ambient-orb absolute -right-12 top-8 h-[24rem] w-[24rem] rounded-full bg-sky-200/30 blur-3xl" />
        <div className="bg-ambient-orb absolute bottom-[-5rem] left-[-4rem] h-[24rem] w-[24rem] rounded-full bg-[#cfeaf9]/50 blur-3xl" />
        <div className="bg-ambient-orb absolute bottom-14 right-[-2rem] h-[18rem] w-[18rem] rounded-full bg-[#dfeef9]/55 blur-3xl" />

        <div className="campus-scene absolute inset-x-0 bottom-[-1.5rem] left-0 hidden lg:block">
          <svg viewBox="0 0 1700 500" preserveAspectRatio="xMidYMax meet" className="h-[28rem] w-full opacity-90" aria-hidden="true">
            <defs>
              <linearGradient id="campusGlowBar" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(148,163,184,0.12)" />
                <stop offset="40%" stopColor="rgba(125,211,252,0.22)" />
                <stop offset="100%" stopColor="rgba(148,163,184,0.10)" />
              </linearGradient>
            </defs>

            <ellipse cx="840" cy="200" rx="680" ry="150" fill="rgba(125,211,252,0.12)" />
            <path d="M0 300 C 240 240, 360 250, 520 275 S 790 330, 980 300 S 1360 240, 1700 290 L1700 500 L0 500 Z" fill="rgba(255,255,255,0.26)" />
            <path d="M40 360 C 220 330, 300 314, 460 330 S 760 360, 980 330 S 1360 308, 1660 338 L1660 430 L40 430 Z" fill="rgba(178, 214, 236, 0.18)" />

            <g opacity="0.42">
              <rect x="48" y="250" width="110" height="110" fill="rgba(148,163,184,0.12)" stroke="rgba(148,163,184,0.14)" />
              <path d="M48 280 H158 M78 250 V360 M108 250 V360 M138 250 V360" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
            </g>

            <g opacity="0.72">
              <path d="M130 455 C 320 430, 440 440, 620 455 S 1050 470, 1505 445" stroke="rgba(148,163,184,0.18)" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M210 470 C 335 448, 490 452, 675 470 S 1050 485, 1490 465" stroke="rgba(255,255,255,0.22)" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>

            <g opacity="0.7">
              <path d="M80 445 L95 390 L110 445 Z" fill="rgba(148,163,184,0.14)" />
              <path d="M118 445 L136 384 L154 445 Z" fill="rgba(148,163,184,0.12)" />
              <path d="M300 448 L318 388 L336 448 Z" fill="rgba(148,163,184,0.14)" />
              <path d="M1420 442 L1438 388 L1456 442 Z" fill="rgba(148,163,184,0.14)" />
              <path d="M1550 448 L1569 396 L1588 448 Z" fill="rgba(148,163,184,0.12)" />
            </g>

            <g opacity="0.66">
              <path d="M610 440 L632 390 L654 440 Z" fill="rgba(148,163,184,0.12)" />
              <path d="M690 444 L710 392 L730 444 Z" fill="rgba(148,163,184,0.12)" />
              <path d="M1320 446 L1338 392 L1356 446 Z" fill="rgba(148,163,184,0.12)" />
            </g>

            <g opacity="0.65">
              <path d="M178 450 L178 390 M168 396 L188 396" stroke="rgba(148,163,184,0.18)" strokeWidth="2" />
              <path d="M518 448 L518 392 M508 398 L528 398" stroke="rgba(148,163,184,0.16)" strokeWidth="2" />
              <path d="M1210 448 L1210 394 M1200 399 L1220 399" stroke="rgba(148,163,184,0.16)" strokeWidth="2" />
              <path d="M1468 450 L1468 394 M1458 398 L1478 398" stroke="rgba(148,163,184,0.18)" strokeWidth="2" />
            </g>

            <g opacity="0.82">
              <rect x="110" y="180" width="150" height="170" fill="rgba(148,163,184,0.11)" stroke="rgba(148,163,184,0.18)" />
              <rect x="145" y="220" width="80" height="130" fill="rgba(255,255,255,0.17)" />
              <path d="M145 235 H225 M145 270 H225 M145 305 H225" stroke="rgba(148,163,184,0.18)" strokeWidth="3" />
              <path d="M110 180 L185 140 L260 180" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.18)" />
            </g>

            <g opacity="0.9">
              <rect x="310" y="150" width="170" height="200" fill="rgba(148,163,184,0.12)" stroke="rgba(148,163,184,0.2)" />
              <rect x="340" y="185" width="110" height="165" fill="rgba(255,255,255,0.14)" />
              <path d="M340 215 H450 M340 250 H450 M340 285 H450 M340 320 H450" stroke="rgba(148,163,184,0.18)" strokeWidth="3" />
              <path d="M310 150 L395 110 L480 150" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.2)" />
            </g>

            <g opacity="0.82">
              <rect x="560" y="130" width="140" height="220" fill="rgba(148,163,184,0.10)" stroke="rgba(148,163,184,0.18)" />
              <rect x="590" y="160" width="80" height="190" fill="rgba(255,255,255,0.12)" />
              <path d="M590 200 H670 M590 240 H670 M590 280 H670" stroke="rgba(148,163,184,0.18)" strokeWidth="3" />
              <path d="M560 130 L630 90 L700 130" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.18)" />
            </g>

            <g opacity="0.88">
              <rect x="720" y="205" width="240" height="145" fill="rgba(148,163,184,0.11)" stroke="rgba(148,163,184,0.2)" />
              <rect x="760" y="235" width="160" height="115" fill="rgba(255,255,255,0.15)" />
              <path d="M760 260 H920 M760 295 H920 M760 330 H920" stroke="rgba(148,163,184,0.18)" strokeWidth="3" />
            </g>

            <g opacity="0.85">
              <rect x="990" y="155" width="200" height="195" fill="rgba(148,163,184,0.11)" stroke="rgba(148,163,184,0.2)" />
              <rect x="1025" y="192" width="130" height="158" fill="rgba(255,255,255,0.15)" />
              <path d="M1025 235 H1155 M1025 275 H1155 M1025 315 H1155" stroke="rgba(148,163,184,0.18)" strokeWidth="3" />
              <path d="M990 155 L1090 110 L1190 155" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.18)" />
            </g>

            <g opacity="0.9">
              <rect x="1240" y="190" width="150" height="160" fill="rgba(148,163,184,0.10)" stroke="rgba(148,163,184,0.18)" />
              <rect x="1275" y="225" width="80" height="125" fill="rgba(255,255,255,0.14)" />
              <path d="M1275 260 H1355 M1275 295 H1355" stroke="rgba(148,163,184,0.18)" strokeWidth="3" />
              <path d="M1240 190 L1315 145 L1390 190" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.18)" />
            </g>

            <g opacity="0.72">
              <path d="M40 430 C 220 390, 420 380, 600 400 S 980 435, 1170 395 S 1460 374, 1660 420" stroke="rgba(102, 163, 196, 0.32)" strokeWidth="10" fill="none" strokeLinecap="round" />
              <path d="M0 458 H1700" stroke="rgba(148,163,184,0.18)" strokeWidth="2" />
            </g>

            <g opacity="0.7">
              <circle cx="135" cy="360" r="10" fill="rgba(148,163,184,0.20)" />
              <circle cx="230" cy="350" r="9" fill="rgba(148,163,184,0.18)" />
              <circle cx="520" cy="390" r="9" fill="rgba(148,163,184,0.18)" />
              <circle cx="870" cy="372" r="10" fill="rgba(148,163,184,0.20)" />
              <circle cx="1180" cy="385" r="9" fill="rgba(148,163,184,0.18)" />
              <circle cx="1495" cy="350" r="10" fill="rgba(148,163,184,0.18)" />
            </g>

            <g opacity="0.6">
              <path d="M70 430 L70 380 M92 430 L92 365 M114 430 L114 388" stroke="rgba(148,163,184,0.22)" strokeWidth="3" />
              <path d="M1510 430 L1510 382 M1532 430 L1532 360 M1554 430 L1554 392" stroke="rgba(148,163,184,0.22)" strokeWidth="3" />
              <path d="M236 355 L820 355" stroke="rgba(148,163,184,0.10)" strokeWidth="2" />
              <path d="M1040 355 L1586 355" stroke="rgba(148,163,184,0.10)" strokeWidth="2" />
            </g>

            <g opacity="0.72">
              <rect x="1465" y="245" width="18" height="120" fill="rgba(148,163,184,0.18)" />
              <circle cx="1474" cy="233" r="16" fill="rgba(255,255,255,0.22)" stroke="rgba(148,163,184,0.18)" />
              <path d="M1488 243 L1540 285" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
            </g>

            <g opacity="0.66">
              <path d="M45 335 L120 335 M88 315 L88 355" stroke="rgba(148,163,184,0.15)" strokeWidth="2" />
              <path d="M1555 310 L1625 310 M1588 290 L1588 330" stroke="rgba(148,163,184,0.15)" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>

      <main className="relative z-10 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-[1280px] items-center justify-center">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.28fr_0.72fr]">
            <div className="login-hero-panel hidden min-h-[620px] flex-col justify-center rounded-[28px] bg-transparent px-3 lg:flex">
              <div className="max-w-[690px]">
                <div className="mb-10 flex items-center gap-4 pl-1">
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#dff5ff] shadow-[0_8px_20px_rgba(15,155,213,0.15)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.7),_transparent_45%)]" />
                    <div className="relative flex h-7 w-7 items-center justify-center rounded-md border border-[#9ed9f4] bg-white/80 text-[#0f9bd5] shadow-inner">
                      <Building2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[2rem] font-bold tracking-[-0.06em] text-slate-800">FixTrack</div>
                    <div className="text-[0.92rem] text-slate-500">School Facility Portal</div>
                  </div>
                </div>

                <h1 className="mb-6 text-[4.2rem] font-black leading-[0.92] tracking-[-0.07em] text-slate-800">
                  Keep your campus<br />in top shape
                </h1>

                <p className="max-w-[640px] text-[1.15rem] leading-[1.6] text-slate-600">
                  Report facility concerns, track repairs in real time, and keep campus infrastructure running smoothly.
                </p>

                <div className="mt-8 grid max-w-[540px] grid-cols-3 gap-4">
                  {stats.map((item, index) => (
                    <div
                      key={item.label}
                      className="stat-card rounded-[16px] border border-slate-200 bg-white/70 px-4 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.03)] backdrop-blur-sm"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {item.label}
                      </div>
                      <div className="flex items-baseline gap-1 text-[2.3rem] font-black tracking-[-0.06em] text-slate-800">
                        <span>{item.value}</span>
                        {item.suffix && <span className="text-[1.2rem] font-bold text-slate-600">{item.suffix}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-4">
                  {features.map((feature, index) => (
                    <div
                      key={feature}
                      className="feature-row flex items-start gap-4 text-[1.12rem] text-slate-700"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#dff5ff] text-[#0f9bd5]">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-5 text-[0.9rem] text-slate-500">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="status-pulse h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                  All campus systems operational
                </div>
                <div className="flex items-center gap-1 font-medium text-slate-500">
                  AY 2026–27
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-[490px]">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 px-6 text-center">
        <p className="text-[10px] text-slate-500 tracking-[0.04em] uppercase">
          FixTrack · School Facility Concern Reporting & Maintenance System · AY 2026–27
        </p>
      </footer>
    </div>
  );
};
