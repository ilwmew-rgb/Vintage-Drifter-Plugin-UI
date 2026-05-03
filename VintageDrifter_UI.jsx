import React, { useState, useRef, useEffect } from 'react';

const DRIFT_ANIMATION_STYLES = [
  'Original Drift',
  'Aurora Veil',
  'Aurora Flutter'
];

const ORGANIC_AURORA_VARIANTS = {
  2: {
    type: 'fractalNoise',
    numOctaves: 2,
    seedValues: '17;17;52;23;23',
    keyTimes: '0;0.66;0.75;0.88;1',
    channels: ['R', 'G'],
    axis: 'horizontal',
    cycle: (intensity, rate) => Math.max(1.02, 1.62 - intensity * 0.2 - rate / 270),
    frequency: (intensity) => `${(0.018 + intensity * 0.01).toFixed(3)} ${(0.082 + intensity * 0.032).toFixed(3)}`,
    restScale: (intensity) => 0.22 + intensity * 0.62,
    burstScale: (intensity) => 8 + intensity * 20,
    blur: (intensity) => 0.06 + intensity * 0.11
  }
};

// --- Procedural Drift Animation Engine ---
const OriginalWobblyAura = ({ drift, spread, active, rate }) => {
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const requestRef = useRef();
  const tRef = useRef(0);
  const isPerfectRef = useRef(false);
  const paramsRef = useRef({ drift, rate });
  useEffect(() => { paramsRef.current = { drift, rate }; }, [drift, rate]);

  useEffect(() => {
    let lastUpdate = 0;
    const loop = (timestamp) => {
      requestRef.current = requestAnimationFrame(loop);
      if (timestamp - lastUpdate < 30) return;
      lastUpdate = timestamp;
      const { drift, rate } = paramsRef.current;
      if (drift <= 0.1) {
        if (!isPerfectRef.current) {
          if (ring1Ref.current) ring1Ref.current.style.borderRadius = '50%';
          if (ring2Ref.current) ring2Ref.current.style.borderRadius = '50%';
          isPerfectRef.current = true;
        }
        return;
      }
      isPerfectRef.current = false;
      tRef.current += 0.03 * Math.max(0.5, rate / 20);
      const t = tRef.current;
      const w = drift / 100;
      const getWobble = (offset, scale) => {
        const b1 = 50 + (w * scale * Math.sin(t + offset));
        const b2 = 50 - (w * scale * 0.8 * Math.cos(t * 1.2 + offset));
        const b3 = 50 + (w * scale * 1.2 * Math.sin(t * 0.8 + offset));
        const b4 = 50 - (w * scale * Math.cos(t * 1.1 + offset));
        return `${b1}% ${100-b1}% ${b2}% ${100-b2}% / ${b3}% ${b4}% ${100-b4}% ${100-b3}%`;
      };
      if (ring1Ref.current && ring2Ref.current) {
        ring1Ref.current.style.borderRadius = getWobble(0, 12);
        ring2Ref.current.style.borderRadius = getWobble(2, 18);
      }
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const animSpeed = Math.max(1, 10 - (rate / 10));
  const visualSpread = spread * 0.5;
  const spreadScaleX = 1 + (visualSpread / 166.6);
  const spreadScaleY = 1 + (visualSpread / 500);

  return (
    <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-out flex justify-center items-center ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
      <div className="absolute w-full h-full rounded-full blur-[60px] transition-transform duration-75" style={{ backgroundColor: '#e66a53', opacity: 0.15 + (drift/100)*0.1 + (spread/100)*0.15, transform: `translateX(-${visualSpread * 1.5}px) scaleX(${1 + visualSpread/200})` }} />
      <div className="absolute w-full h-full rounded-full blur-[60px] transition-transform duration-75" style={{ backgroundColor: '#edd39a', opacity: 0.15 + (drift/100)*0.1 + (spread/100)*0.15, transform: `translateX(${visualSpread * 1.5}px) scaleX(${1 + visualSpread/200})` }} />
      <div className="absolute w-[160%] h-[160%] flex justify-center items-center transition-transform duration-75" style={{ filter: 'drop-shadow(0 0 8px rgba(230,106,83,0.4))', transform: `scaleX(${spreadScaleX}) scaleY(${spreadScaleY})` }}>
        <div className="absolute w-[85%] h-[85%] transition-transform mix-blend-screen" style={{ animation: `spin ${animSpeed * 2.5}s linear infinite` }}>
          <div ref={ring1Ref} className="w-full h-full border-[2.5px] border-[#e66a53] border-dashed opacity-80" style={{ borderRadius: '50%', transition: 'border-radius 0.1s ease-out' }} />
        </div>
        <div className="absolute w-[70%] h-[70%] transition-transform mix-blend-screen" style={{ filter: 'drop-shadow(0 0 6px #edd39a)', animation: `spin ${animSpeed * 1.8}s linear infinite reverse` }}>
          <div ref={ring2Ref} className="w-full h-full border-[2px] border-[#edd39a] opacity-90" style={{ borderRadius: '50%', transition: 'border-radius 0.1s ease-out' }} />
        </div>
      </div>
    </div>
  );
};

const CreativeDriftAura = ({ drift, spread, active, rate, animationStyle }) => {
  const organicVariant = ORGANIC_AURORA_VARIANTS[animationStyle];
  const isOrganic = Boolean(organicVariant);
  const intensity = Math.max(0.08, drift / 100);
  const visualSpread = spread * 0.5;
  const spreadScaleX = 1 + (visualSpread / 135);
  const spreadScaleY = 1 + (visualSpread / 520);
  const spreadShift = visualSpread * 1.25;
  const baseSpeed = Math.max(1.6, 10 - (rate / 9));
  const glowOpacity = active ? 0.2 + intensity * 0.26 + (spread / 100) * 0.12 : 0;
  const organicRestScale = organicVariant ? organicVariant.restScale(intensity) : 0;
  const organicBurstScale = organicVariant ? organicVariant.burstScale(intensity) : 0;
  const organicBlur = organicVariant ? organicVariant.blur(intensity) : 0;
  const organicCycle = organicVariant ? organicVariant.cycle(intensity, rate) : 2;
  const organicFrequency = organicVariant ? organicVariant.frequency(intensity) : '0.014 0.032';
  const stageStyle = {
    '--drift-speed': `${baseSpeed}s`,
    '--drift-speed-fast': `${Math.max(0.85, baseSpeed * 0.58)}s`,
    '--drift-speed-slow': `${baseSpeed * 1.7}s`,
    '--liquid-cycle': `${organicCycle}s`
  };
  const chromaGlow = (
    <>
      <div
        className="absolute w-[95%] h-[95%] rounded-full blur-[72px] transition-all duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(230,106,83,0.95), rgba(230,106,83,0.16) 52%, transparent 72%)',
          opacity: glowOpacity,
          transform: `translateX(-${spreadShift}px) scaleX(${1 + visualSpread / 180})`
        }}
      />
      <div
        className="absolute w-[95%] h-[95%] rounded-full blur-[72px] transition-all duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(237,211,154,0.95), rgba(237,211,154,0.14) 52%, transparent 72%)',
          opacity: glowOpacity,
          transform: `translateX(${spreadShift}px) scaleX(${1 + visualSpread / 180})`
        }}
      />
    </>
  );

  return (
    <div
      className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-out flex justify-center items-center ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
      style={stageStyle}
    >
      {isOrganic && (
        <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
          <defs>
            <filter id="driftAuroraLiquid" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
              <feTurbulence type={organicVariant.type} baseFrequency={organicFrequency} numOctaves={organicVariant.numOctaves} seed="7" result="liquidNoise">
                <animate attributeName="seed" values={organicVariant.seedValues} keyTimes={organicVariant.keyTimes} dur={`${organicCycle}s`} repeatCount="indefinite" />
              </feTurbulence>
              <feGaussianBlur in="liquidNoise" stdDeviation={organicBlur} result="softLiquidNoise" />
              {organicVariant.axis === 'horizontal' && (
                <feColorMatrix
                  in="softLiquidNoise"
                  type="matrix"
                  values="1 0 0 0 0  0 0 0 0 0.5  0 0 1 0 0  0 0 0 1 0"
                  result="horizontalLiquidNoise"
                />
              )}
              <feDisplacementMap
                in="SourceGraphic"
                in2={organicVariant.axis === 'horizontal' ? 'horizontalLiquidNoise' : 'softLiquidNoise'}
                scale={organicRestScale}
                xChannelSelector={organicVariant.channels[0]}
                yChannelSelector={organicVariant.channels[1]}
              >
                <animate
                  attributeName="scale"
                  values={organicVariant.scaleValues
                    ? organicVariant.scaleValues(organicRestScale, organicBurstScale)
                    : `${organicRestScale};${organicRestScale};${organicBurstScale};${organicRestScale};${organicRestScale}`}
                  keyTimes={organicVariant.keyTimes}
                  dur={`${organicCycle}s`}
                  repeatCount="indefinite"
                />
              </feDisplacementMap>
            </filter>
          </defs>
        </svg>
      )}
      {chromaGlow}
      <div
        className={`absolute w-[168%] h-[168%] ${isOrganic ? 'drift-aurora-liquid-field' : ''}`}
        style={{
          transform: `scaleX(${spreadScaleX}) scaleY(${spreadScaleY})`,
          filter: isOrganic ? 'url(#driftAuroraLiquid)' : undefined
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="drift-aurora-sheet absolute left-1/2 top-1/2 mix-blend-screen"
            style={{
              width: `${74 - i * 8}%`,
              height: `${86 - i * 6}%`,
              borderRadius: `${44 + i * 6}% ${56 - i * 2}% ${42 + i * 4}% ${58 - i * 3}% / ${60 - i * 3}% ${40 + i * 5}% ${56 - i * 2}% ${44 + i * 4}%`,
              background: i % 2
                ? 'linear-gradient(130deg, transparent 8%, rgba(237,211,154,0.08), rgba(237,211,154,0.62), transparent 74%)'
                : 'linear-gradient(50deg, transparent 7%, rgba(230,106,83,0.1), rgba(230,106,83,0.55), transparent 78%)',
              filter: `blur(${2 + i * 0.7}px) saturate(1.25)`,
              opacity: 0.38 + intensity * 0.42,
              animationDuration: `${baseSpeed * (1.06 + i * 0.14)}s`,
              animationDelay: `${i * -0.9}s`
            }}
          />
        ))}
        <div className="drift-aurora-core absolute left-1/2 top-1/2 w-[28%] h-[28%] rounded-full bg-[#edd39a]/35 blur-[12px] mix-blend-screen" style={{ animationDuration: `${baseSpeed * 0.8}s` }} />
      </div>
    </div>
  );
};

const WobblyAura = (props) => (
  (props.animationStyle ?? 0) === 0
    ? <OriginalWobblyAura {...props} />
    : <CreativeDriftAura {...props} />
);

// --- Botanical SVGs ---
const DetailedMonstera = ({ showStems = true }) => (
  <svg viewBox="0 0 200 200" className="absolute -bottom-10 -left-10 w-80 h-80 pointer-events-none opacity-[0.9] mix-blend-multiply z-0" style={{ filter: 'drop-shadow(15px 15px 20px rgba(0,0,0,0.4))' }}>
    <defs><clipPath id="monstera-cuts"><rect width="200" height="200" fill="white" /><ellipse cx="20" cy="70" rx="35" ry="12" transform="rotate(25 20 70)" fill="black" /><ellipse cx="10" cy="110" rx="40" ry="15" transform="rotate(10 10 110)" fill="black" /><ellipse cx="30" cy="160" rx="30" ry="10" transform="rotate(-15 30 160)" fill="black" /><ellipse cx="160" cy="50" rx="40" ry="15" transform="rotate(-30 160 50)" fill="black" /><ellipse cx="180" cy="100" rx="45" ry="16" transform="rotate(-10 180 100)" fill="black" /><ellipse cx="160" cy="150" rx="35" ry="12" transform="rotate(15 160 150)" fill="black" /><circle cx="110" cy="40" r="8" fill="black" /><ellipse cx="60" cy="80" rx="12" ry="6" transform="rotate(30 60 80)" fill="black" /><ellipse cx="140" cy="90" rx="15" ry="7" transform="rotate(-20 140 90)" fill="black" /><circle cx="120" cy="130" r="9" fill="black" /><circle cx="70" cy="140" r="7" fill="black" /></clipPath></defs>
    <g transform="translate(10, 10) rotate(15) scale(0.9)"><path d="M 100 10 C 170 10 190 70 180 130 C 170 190 120 190 100 190 C 80 190 30 190 20 130 C 10 70 30 10 100 10 Z" fill="#2c3e35" clipPath="url(#monstera-cuts)" />{showStems && <path d="M 100 10 C 100 10 95 190 95 190" stroke="#1e2a24" strokeWidth="3" fill="none" />}</g>
    <g transform="translate(-20, 80) rotate(-20) scale(0.6)"><path d="M 100 10 C 170 10 190 70 180 130 C 170 190 120 190 100 190 C 80 190 30 190 20 130 C 10 70 30 10 100 10 Z" fill="#1e2a24" clipPath="url(#monstera-cuts)" />{showStems && <path d="M 100 10 C 100 10 95 190 95 190" stroke="#111" strokeWidth="4" fill="none" />}</g>
  </svg>
);

const DetailedFernsRight = ({ showFerns = true }) => {
  if (!showFerns) return null;
  return (
  <svg viewBox="0 0 200 200" className="absolute -bottom-10 -right-10 w-80 h-80 pointer-events-none opacity-[0.9] mix-blend-multiply z-0" style={{ filter: 'drop-shadow(-10px 15px 20px rgba(0,0,0,0.4))' }}>
    <g transform="translate(60, 20) rotate(35) scale(0.8)">
      <line x1="100" y1="200" x2="100" y2="0" stroke="#2c3e35" strokeWidth="4" strokeLinecap="round" />
      {[...Array(20)].map((_, i) => { const y = 180 - (i * 9), s = 35 - (i * 1.5); return (<g key={`f1-${i}`}><path d={`M 100 ${y} C ${100-s*0.8} ${y-s*0.2} ${100-s} ${y-s*0.8} ${100-s*1.2} ${y-s} C ${100-s*0.5} ${y-s*0.3} 100 ${y-2} 100 ${y}`} fill="#2c3e35" /><path d={`M 100 ${y-4} C ${100+s*0.8} ${y-4-s*0.2} ${100+s} ${y-4-s*0.8} ${100+s*1.2} ${y-4-s} C ${100+s*0.5} ${y-4-s*0.3} 100 ${y-6} 100 ${y-4}`} fill="#1e2a24" /></g>); })}
    </g>
    <g transform="translate(130, 60) rotate(-15) scale(0.6)">
      <line x1="100" y1="200" x2="100" y2="0" stroke="#3a2323" strokeWidth="4" strokeLinecap="round" />
      {[...Array(18)].map((_, i) => { const y = 180 - (i * 10), s = 30 - (i * 1.5); return (<g key={`f2-${i}`}><path d={`M 100 ${y} C ${100-s*0.8} ${y-s*0.2} ${100-s} ${y-s*0.8} ${100-s*1.2} ${y-s} C ${100-s*0.5} ${y-s*0.3} 100 ${y-2} 100 ${y}`} fill="#4d2b2b" /><path d={`M 100 ${y-4} C ${100+s*0.8} ${y-4-s*0.2} ${100+s} ${y-4-s*0.8} ${100+s*1.2} ${y-4-s} C ${100+s*0.5} ${y-4-s*0.3} 100 ${y-6} 100 ${y-4}`} fill="#3a2323" /></g>); })}
    </g>
    <g transform="translate(40, 100)"><circle cx="50" cy="50" r="18" fill="#a63c3c" /><circle cx="65" cy="40" r="14" fill="#c44d4d" /><circle cx="40" cy="35" r="12" fill="#8a2e2e" /><circle cx="55" cy="55" r="8" fill="#e66a53" /><path d="M 50 68 Q 60 90 80 120" stroke="#a63c3c" strokeWidth="2" fill="none" /></g>
  </svg>
  );
};

const HardwareLED = ({ active, color = 'red', size = 8, label, pulse = false }) => {
  const colors = {
    red: { bg: '#ff4444', glow: '0 0 12px #ff4444' },
    green: { bg: '#44ff44', glow: '0 0 12px #44ff44' },
    amber: { bg: '#ffaa00', glow: '0 0 12px #ffaa00' },
    coral: { bg: '#e66a53', glow: '0 0 12px #e66a53' },
    gold: { bg: '#d4af37', glow: '0 0 12px #d4af37' }
  };
  const theme = colors[color] || colors.red;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: size + 4, height: size + 4 }}>
        <div className="absolute inset-0 rounded-full bg-black/40 shadow-inner" />
        <div 
          className={`rounded-full transition-all duration-200 ${pulse && active ? 'animate-pulse' : ''}`}
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: active ? theme.bg : '#222',
            boxShadow: active ? theme.glow : 'inset 0 1px 1px rgba(0,0,0,0.5)',
            border: active ? 'none' : '1px solid rgba(255,255,255,0.05)'
          }}
        />
      </div>
      {label && <span className="text-[9px] font-bold tracking-[0.2em] text-[#8b7b65] uppercase">{label}</span>}
    </div>
  );
};


const AnalogCables = ({ position = 'left', parallel = true }) => {
  const leftCable1Splayed = "M 150,210 C 150,120 90,80 30,-20";
  const leftCable2Splayed = "M 235,210 C 235,120 295,80 355,-20";
  const rightCable1Splayed = "M 150,210 C 150,150 70,90 10,-20";
  const rightCable2Splayed = "M 235,210 C 235,100 320,130 380,-20";

  const leftCable1Parallel = "M 150,210 C 150,120 90,80 30,-20";
  const leftCable2Parallel = "M 235,210 C 235,120 175,80 115,-20";
  const rightCable1Parallel = "M 150,210 C 150,120 220,80 280,-20";
  const rightCable2Parallel = "M 235,210 C 235,100 290,60 350,-20";

  const path1 = position === 'left' ? (parallel ? leftCable1Parallel : leftCable1Splayed) : (parallel ? rightCable1Parallel : rightCable1Splayed);
  const path2 = position === 'left' ? (parallel ? leftCable2Parallel : leftCable2Splayed) : (parallel ? rightCable2Parallel : rightCable2Splayed);

  return (
    <div className={`absolute top-0 ${position === 'left' ? 'left-[20%] -translate-x-1/2' : 'right-[20%] translate-x-1/2'} -translate-y-[85%] w-[45%] z-0 pointer-events-none`}>
      <svg viewBox="0 0 400 300" className="w-full h-auto" style={{ 
        filter: 'drop-shadow(15px 25px 20px rgba(0,0,0,0.6))',
        transform: position === 'right' ? 'scaleX(-1)' : 'none'
      }}>
        <defs>
          <linearGradient id="jackGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0a0a0a"/>
            <stop offset="15%" stopColor="#2a2a2a"/>
            <stop offset="30%" stopColor="#666"/>
            <stop offset="50%" stopColor="#1a1a1a"/>
            <stop offset="80%" stopColor="#0a0a0a"/>
            <stop offset="95%" stopColor="#333"/>
            <stop offset="100%" stopColor="#000"/>
          </linearGradient>
        </defs>

        {/* Cable 1 */}
        <g>
          <path d={path1} fill="none" stroke="#050505" strokeWidth="26" strokeLinecap="round" />
          <path d={path1} fill="none" stroke="#1c1c1c" strokeWidth="22" strokeLinecap="round" />
          <path d={path1} fill="none" stroke="#2a2a2a" strokeWidth="12" strokeLinecap="round" style={{ transform: 'translate(-1px, -1px)' }} />
          <path d={path1} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.15" style={{ transform: 'translate(-3px, -3px)' }} />
        </g>
        
        {/* Jack 1 */}
        <rect x="134" y="200" width="32" height="100" fill="url(#jackGrad)" rx="4" />
        <rect x="130" y="270" width="40" height="30" fill="#111" rx="2" />
        <rect x="134" y="215" width="32" height="4" fill="#d1c5ab" opacity="0.9" />
        
        {/* Cable 2 */}
        <g>
          <path d={path2} fill="none" stroke="#050505" strokeWidth="26" strokeLinecap="round" />
          <path d={path2} fill="none" stroke="#1c1c1c" strokeWidth="22" strokeLinecap="round" />
          <path d={path2} fill="none" stroke="#2a2a2a" strokeWidth="12" strokeLinecap="round" style={{ transform: 'translate(-1px, -1px)' }} />
          <path d={path2} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.15" style={{ transform: 'translate(-3px, -3px)' }} />
        </g>

        {/* Jack 2 */}
        <rect x="219" y="200" width="32" height="100" fill="url(#jackGrad)" rx="4" />
        <rect x="215" y="270" width="40" height="30" fill="#111" rx="2" />
        <rect x="219" y="215" width="32" height="4" fill="#e66a53" opacity="0.9" />
        
        {/* Ribs */}
        {[...Array(6)].map((_, i) => (
          <g key={`rib-${i}`}>
            <line x1="134" y1={235 + i*6} x2="166" y2={235 + i*6} stroke="#050505" strokeWidth="2" />
            <line x1="219" y1={235 + i*6} x2="251" y2={235 + i*6} stroke="#050505" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
};

// --- UI Components ---
const KNOB_STYLES = [
  { name: 'Original (Levitating)', boxShadow: '12px 12px 20px rgba(0,0,0,0.45), 4px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.9)', backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)', backgroundColor: '#111' },
  { name: 'Heavy Cast Iron', boxShadow: '0px 20px 25px rgba(0,0,0,0.6), 0px 5px 10px rgba(0,0,0,0.8), inset 0px 2px 4px rgba(255,255,255,0.1), inset 0px -4px 8px rgba(0,0,0,0.9)', backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.95) 100%)', backgroundColor: '#1a1a1a' },
  { name: 'Anodized Studio', boxShadow: '0px 10px 15px rgba(0,0,0,0.3), 0px 3px 6px rgba(0,0,0,0.4), inset 0px 1px 1px rgba(255,255,255,0.2), inset 0px -1px 2px rgba(0,0,0,0.6)', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.6) 100%)', backgroundColor: '#262626' },
  { name: 'Vintage Bakelite', boxShadow: '8px 12px 15px rgba(0,0,0,0.6), 2px 4px 6px rgba(0,0,0,0.5), inset 2px 2px 4px rgba(255,255,255,0.3), inset -3px -3px 6px rgba(0,0,0,0.8)', backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.9) 80%)', backgroundColor: '#111' },
  { name: 'Dark Brushed Metal', boxShadow: '0px 12px 20px rgba(0,0,0,0.5), 0px 4px 8px rgba(0,0,0,0.6), inset 0px 1px 3px rgba(255,255,255,0.4), inset 0px -2px 5px rgba(0,0,0,0.9)', backgroundImage: 'conic-gradient(from 180deg at 50% 50%, #1a1a1a 0deg, #3a3a3a 45deg, #1a1a1a 90deg, #3a3a3a 135deg, #1a1a1a 180deg, #3a3a3a 225deg, #1a1a1a 270deg, #3a3a3a 315deg, #1a1a1a 360deg)', backgroundColor: '#111' },
  { name: 'Soft Matte Rubber', boxShadow: '0px 15px 30px rgba(0,0,0,0.35), 0px 5px 15px rgba(0,0,0,0.45), inset 0px 1px 1px rgba(255,255,255,0.05), inset 0px -2px 4px rgba(0,0,0,0.5)', backgroundImage: 'none', backgroundColor: '#1f1f1f' },
  { name: 'Recessed Dome', boxShadow: '0px 2px 4px rgba(0,0,0,0.8), 0px 0px 2px rgba(0,0,0,0.9), inset 0px 5px 10px rgba(255,255,255,0.1), inset 0px -5px 10px rgba(0,0,0,0.9)', backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%)', backgroundColor: '#141414' },
  { name: 'Machined Grip', boxShadow: '0px 10px 15px rgba(0,0,0,0.7), 0px 2px 4px rgba(0,0,0,0.8), inset 0px 1px 2px rgba(255,255,255,0.3), inset 0px -1px 3px rgba(0,0,0,0.9)', backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, #1a1a1a 0px, #2a2a2a 2px, #1a1a1a 4px)', backgroundColor: '#111' },
  { name: 'Polished Onyx', boxShadow: '0px 15px 25px rgba(0,0,0,0.6), 0px 6px 12px rgba(0,0,0,0.7), inset 0px 2px 5px rgba(255,255,255,0.5), inset 0px -3px 8px rgba(0,0,0,0.9)', backgroundImage: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.9) 100%)', backgroundColor: '#0a0a0a' }
];

const MatteKnob = ({ label, value, onChange, onDoubleClick, min = 0, max = 100, size = 60, color = 'charcoal', labelColorOverride, shadingStyle }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(0);
  const handlePointerDown = (e) => { e.preventDefault(); setIsDragging(true); startY.current = e.clientY; startVal.current = value; e.target.setPointerCapture(e.pointerId); };
  const handlePointerMove = (e) => { if (!isDragging) return; e.preventDefault(); const d = startY.current - e.clientY; onChange(Math.max(min, Math.min(max, startVal.current + (d * 0.8) * ((max - min) / 100)))); };
  const handlePointerUp = (e) => { setIsDragging(false); e.target.releasePointerCapture(e.pointerId); };
  const rotation = ((value - min) / (max - min) * 270) - 135;
  const isCoral = color === 'coral';
  return (
    <div className="flex flex-col items-center justify-center group select-none relative z-10" onDoubleClick={onDoubleClick}>
      <div className="relative rounded-full cursor-ns-resize touch-none" style={{ width: size, height: size, backgroundColor: isCoral ? '#e66a53' : (shadingStyle?.backgroundColor || '#111'), boxShadow: isCoral ? '10px 10px 18px rgba(180,60,40,0.4), 4px 4px 6px rgba(180,60,40,0.3), inset 2px 2px 5px rgba(255,255,255,0.4), inset -2px -2px 5px rgba(0,0,0,0.3)' : (shadingStyle?.boxShadow || '12px 12px 20px rgba(0,0,0,0.45), 4px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.9)'), backgroundImage: isCoral ? 'none' : (shadingStyle?.backgroundImage || 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)') }}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
        <div className="absolute inset-0 transition-transform duration-75" style={{ transform: `rotate(${rotation}deg)` }}>
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 rounded-full" style={{ width: size * 0.06, height: size * 0.25, background: isCoral ? '#fff' : 'linear-gradient(to bottom, #d4af37, #8a6a1c)', boxShadow: isCoral ? '0 1px 2px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.8)' }} />
        </div>
      </div>
      <div className={`mt-4 text-[9px] font-black tracking-[0.2em] uppercase ${labelColorOverride || (isCoral ? 'text-[#fff] drop-shadow-md' : 'text-[#7a7465]')}`}>{label}</div>
    </div>
  );
};

const GlassButton = ({ active, onClick, label, size = 45 }) => (
  <div className="flex flex-col items-center gap-2 z-10">
    <button onClick={onClick} className="relative rounded-full outline-none flex items-center justify-center group transition-transform active:scale-95" style={{ width: size, height: size, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: active ? '10px 10px 20px rgba(0,0,0,0.2), 0 0 15px rgba(212,175,55,0.4), inset 0 0 10px rgba(255,255,255,0.5)' : '10px 10px 20px rgba(0,0,0,0.15)' }}>
      <div className="rounded-full transition-all duration-300" style={{ width: size * 0.4, height: size * 0.4, backgroundColor: active ? '#d4af37' : 'rgba(0,0,0,0.3)', boxShadow: active ? '0 0 10px #d4af37' : 'inset 0 1px 3px rgba(0,0,0,0.5)' }} />
    </button>
    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#5a5549]">{label}</span>
  </div>
);

const MiniToggle = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all ${active ? 'bg-[#d4af37] text-[#111] shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'bg-black/20 text-[#7a7465] border border-white/10'}`}>{label}</button>
);

const DropdownSelect = ({ options, value, onChange, width = 80 }) => (
  <select value={value} onChange={e => onChange(Number(e.target.value))} className="bg-black/30 text-[#edd39a] text-[9px] font-bold tracking-wider rounded-lg px-2 py-1.5 border border-white/10 outline-none backdrop-blur-md cursor-pointer" style={{ width }}>
    {options.map((opt, i) => <option key={i} value={i} className="bg-[#2d2c2b] text-[#edd39a]">{opt}</option>)}
  </select>
);

const CENTER_DIAL_SHADOWS = [
  { name: 'Original', shadow: '18px 18px 35px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.1), inset -3px -3px 8px rgba(0,0,0,0.8)' },
  { name: 'Refined Grounded', shadow: '2px 2px 8px rgba(0,0,0,0.7), 18px 18px 40px rgba(0,0,0,0.4), inset 1px 1px 3px rgba(255,255,255,0.15), inset -4px -4px 10px rgba(0,0,0,0.9)' },
  { name: 'Balanced Distance', shadow: '1px 1px 5px rgba(0,0,0,0.4), 18px 18px 35px rgba(0,0,0,0.5), inset 2px 2px 4px rgba(255,255,255,0.15), inset -3px -3px 8px rgba(0,0,0,0.85)' },
  { name: 'Crisp Hover', shadow: '2px 2px 6px rgba(0,0,0,0.3), 20px 20px 30px rgba(0,0,0,0.45), inset 1px 1px 2px rgba(255,255,255,0.2), inset -2px -2px 6px rgba(0,0,0,0.9)' }
];

const BotanicalCenterDial = ({ drift, setDrift, spread, setSpread, rate, shadowStyle, animationStyle = 0, onDoubleClickDrift, onDoubleClickSpread }) => {
  const [isDraggingDrift, setIsDraggingDrift] = useState(false);
  const [isDraggingSpread, setIsDraggingSpread] = useState(false);
  const driftY = useRef(0), driftStart = useRef(0), spreadY = useRef(0), spreadStart = useRef(0);
  const handleDriftDown = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingDrift(true); driftY.current = e.clientY; driftStart.current = drift; e.target.setPointerCapture(e.pointerId); };
  const handleDriftMove = (e) => { if (!isDraggingDrift) return; e.preventDefault(); e.stopPropagation(); setDrift(Math.max(0, Math.min(100, driftStart.current + (driftY.current - e.clientY) * 0.8))); };
  const handleDriftUp = (e) => { setIsDraggingDrift(false); e.target.releasePointerCapture(e.pointerId); };
  const handleSpreadDown = (e) => { e.preventDefault(); setIsDraggingSpread(true); spreadY.current = e.clientY; spreadStart.current = spread; e.target.setPointerCapture(e.pointerId); };
  const handleSpreadMove = (e) => { if (!isDraggingSpread) return; e.preventDefault(); setSpread(Math.max(0, Math.min(100, spreadStart.current + (spreadY.current - e.clientY) * 0.8))); };
  const handleSpreadUp = (e) => { setIsDraggingSpread(false); e.target.releasePointerCapture(e.pointerId); };
  const driftRot = (drift / 100 * 270) - 135;
  const spreadRot = (spread / 100 * 270) - 135;
  const auraActive = isDraggingDrift || isDraggingSpread || drift > 0.25;

  return (
    <div className="relative flex justify-center items-center z-20" style={{ width: 340, height: 340 }}>
      <WobblyAura drift={drift} spread={spread} active={auraActive} rate={rate} animationStyle={animationStyle} />
      <div className="absolute rounded-full cursor-ns-resize flex justify-center items-center group z-10" style={{ width: 320, height: 320, backgroundColor: '#1f1e1d', backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent, transparent 2px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px), conic-gradient(from 0deg at 50% 50%, #111, #333, #111, #333, #111)', boxShadow: shadowStyle || '2px 2px 8px rgba(0,0,0,0.7), 18px 18px 40px rgba(0,0,0,0.4), inset 1px 1px 3px rgba(255,255,255,0.15), inset -4px -4px 10px rgba(0,0,0,0.9)' }}
        onPointerDown={handleSpreadDown} onPointerMove={handleSpreadMove} onPointerUp={handleSpreadUp} onPointerCancel={handleSpreadUp} onDoubleClick={onDoubleClickSpread}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <circle cx="160" cy="160" r="140" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="4 6.995" />
          <circle cx="160" cy="160" r="120" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="90" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="20 42.83" />
          {[...Array(11)].map((_, i) => (<text key={i} x="160" y="35" fill="#d4af37" fontSize="8" fontFamily="monospace" textAnchor="middle" style={{ transformOrigin: '160px 160px', transform: `rotate(${-135 + i * 27}deg)` }}>{i < 9 ? `0${i+1}` : `${i+1}`}</text>))}
        </svg>
        <div className="absolute inset-0 transition-transform duration-75 pointer-events-none" style={{ transform: `rotate(${spreadRot}deg)` }}>
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-2 h-6 bg-[#e66a53] rounded-full shadow-[0_0_10px_#e66a53]" />
        </div>
        <div className="absolute rounded-full cursor-ns-resize flex justify-center items-center hover:brightness-110 transition-all z-20" style={{ width: 140, height: 140, background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #a88842 0deg, #edd39a 45deg, #a88842 90deg, #edd39a 135deg, #a88842 180deg, #edd39a 225deg, #a88842 270deg, #edd39a 315deg, #a88842 360deg)', boxShadow: '15px 15px 30px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.9), inset -4px -4px 8px rgba(0,0,0,0.6)' }}
          onPointerDown={handleDriftDown} onPointerMove={handleDriftMove} onPointerUp={handleDriftUp} onPointerCancel={handleDriftUp} onDoubleClick={onDoubleClickDrift}>
          <div className="absolute inset-2 rounded-full pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.2) 100%)', boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.5)' }} />
          <div className="absolute inset-0 transition-transform duration-75 pointer-events-none" style={{ transform: `rotate(${driftRot}deg)` }}>
            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-1.5 h-7 bg-[#1a1a1a] rounded-full opacity-95 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.4)]" />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-8 text-center pointer-events-none">
        <div className="text-[11px] font-black tracking-[0.3em] text-[#2d2c2b]">DRIFT CORE</div>
        <div className="text-[9px] font-bold tracking-[0.2em] text-[#f4ead6] drop-shadow-sm mt-1">SPREAD MATRIX</div>
      </div>
    </div>
  );
};

// --- Preset Browser ---
const PresetBrowser = ({ presets, currentPreset, onPrev, onNext, onLoad, onSave }) => {
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const handleSave = () => { if (saveName.trim()) { onSave(saveName.trim()); setShowSave(false); setSaveName(''); } };
  return (
    <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
      <button onClick={onPrev} className="w-7 h-7 rounded-full bg-[#2d2c2b] text-[#edd39a] text-sm font-bold flex items-center justify-center hover:bg-[#3d3c3b] transition-colors shadow-lg border border-white/5">‹</button>
      <div className="relative">
        <select value={currentPreset} onChange={e => onLoad(Number(e.target.value))} className="bg-[#2d2c2b]/90 backdrop-blur-md text-[#edd39a] text-[10px] font-bold tracking-wider rounded-lg px-4 py-2 border border-white/10 outline-none cursor-pointer shadow-lg min-w-[180px] text-center appearance-none">
          <option value={-1} className="bg-[#2d2c2b]">— Init —</option>
          {presets.map((name, i) => <option key={i} value={i} className="bg-[#2d2c2b]">{name}</option>)}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[#edd39a] text-[9px] pointer-events-none">▼</div>
      </div>
      <button onClick={onNext} className="w-7 h-7 rounded-full bg-[#2d2c2b] text-[#edd39a] text-sm font-bold flex items-center justify-center hover:bg-[#3d3c3b] transition-colors shadow-lg border border-white/5">›</button>
      <button onClick={() => { setSaveName('My Preset'); setShowSave(true); }} className="ml-1 px-3 py-1.5 rounded-lg bg-[#e66a53] text-white text-[9px] font-bold tracking-wider uppercase hover:brightness-110 transition-all shadow-lg">Save</button>
      {showSave && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#2d2c2b]/95 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-white/10 z-50 min-w-[220px]">
          <div className="text-[10px] text-[#edd39a] font-bold tracking-wider mb-2 uppercase">Save Preset</div>
          <input value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} className="w-full bg-black/30 text-[#edd39a] text-[11px] rounded-lg px-3 py-2 border border-white/10 outline-none mb-2" placeholder="Preset name..." autoFocus />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 py-1.5 rounded-lg bg-[#e66a53] text-white text-[9px] font-bold tracking-wider uppercase">Save</button>
            <button onClick={() => setShowSave(false)} className="flex-1 py-1.5 rounded-lg bg-white/10 text-[#7a7465] text-[9px] font-bold tracking-wider uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================================================================
// MAIN APP — All controls with local state, no JUCE bridge
// ===================================================================
//
// PARAMETER REFERENCE (for wiring back to JUCE later):
//   input        (0-100, maps to -24 to +24 dB)
//   output       (0-100, maps to -24 to +24 dB)
//   drift        (0-100, maps to detune 0-1)
//   spread       (0-100, maps to driftSpread 0-1)
//   character    (0-100, maps to character 0-1)    — labeled "Filter"
//   charFilter   (0 or 1)                          — 6dB / 12dB toggle
//   sweeten      (0-100, maps to sweeten 0-1)
//   biasHF       (0-100, maps to biasHF 0-1)       — labeled "Sat"
//   noise        (0-100, maps to noise 0-1)
//   rate         (0-100, maps to lfoRate 0.05-8 Hz)
//   depth        (0-100, maps to lfoDepth 0-1)
//   stereoPhase  (0-100, maps to lfoStereoPhase 0-180°)
//   mode         ('calm'=0, 'vintage'=1, 'unstable'=2, 'dream'=3)
//   autoGain     (true/false, maps to autogain 0/1)
//   lfoEnabled   (true/false)
//   lfoSync      (true/false)
//   lfoShape     (0=Sine, 1=Triangle, 2=Drift)
//   lfoSyncDiv   (0-13, index into SYNC_DIVS array)
//   power        (true/false, UI-only bypass)
//

const SHAPES = ['Sine', 'Triangle', 'Drift'];
const SYNC_DIVS = ['4/1', '2/1', '1/1', '1/2', '1/4', '1/8', '1/16', '1/32', '1/4T', '1/8T', '1/16T', '1/4D', '1/8D', '1/16D'];
const DEMO_PRESETS = ['Subtle Warmth', 'Vinyl Drift', 'Tape Machine', 'Broken Cassette', 'Chorus Width', 'Slow Swirl', 'Synced Wobble', 'Sweet Dream', 'Subtle Detune', 'Broken Radio', 'Drum Saturator', 'Lush & Full'];

const MODE_STYLE_NAMES = [
  'Glassmorphism (Original)',
  'Flush Walnut (Gold)', 'Flush Walnut (Ivory)', 'Flush Walnut (Matte)'
];

const BACKGROUNDS = [
  { name: 'Warm Sand', color: '#c8bba6' },
  { name: 'Aged Cork', color: '#b5a895' },
  { name: 'Muted Clay', color: '#a39785' },
  { name: 'Smoked Taupe', color: '#918676' },
  { name: 'Warm Charcoal', color: '#2a2826' },
  { name: 'Deep Espresso', color: '#2d2621' },
  { name: 'Dark Slate', color: '#212326' },
  { name: 'Midnight Ash', color: '#1c1c1a' }
];

const ModeSelectorEngine = ({ mode, setMode, styleIndex, power }) => {
  const modes = ['calm', 'vintage', 'unstable'];
  
  switch (styleIndex) {
    case 0: // Glassmorphism (Original)
      return (
        <div className="absolute top-[48%] left-[8%] -translate-y-1/2 flex flex-col gap-4 p-4 rounded-[2rem] bg-white/20 backdrop-blur-md border border-white/40 shadow-xl z-10">
          {modes.map(m => (
            <div key={m} className="flex flex-col items-center gap-2 z-10">
              <button onClick={() => setMode(m)} className="relative w-8 h-8 rounded-full outline-none flex items-center justify-center transition-transform active:scale-95" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: power && mode === m ? '5px 5px 15px rgba(0,0,0,0.15), 0 0 12px rgba(212,175,55,0.3), inset 0 0 8px rgba(255,255,255,0.5)' : '5px 5px 15px rgba(0,0,0,0.1)' }}>
                <div className="rounded-full transition-all duration-300" style={{ width: 12, height: 12, backgroundColor: power && mode === m ? '#d4af37' : 'rgba(0,0,0,0.2)', boxShadow: power && mode === m ? '0 0 8px #d4af37' : 'inset 0 1px 2px rgba(0,0,0,0.3)' }} />
              </button>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#7a7465]">{m}</span>
            </div>
          ))}
        </div>
      );


    case 1: // Flush Walnut (Gold)
      return (
        <div className="absolute top-[48%] left-[8%] -translate-y-1/2 flex flex-col gap-5 p-4 rounded-full z-10" style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.8), inset -1px -1px 2px rgba(255,255,255,0.1), 0 1px 1px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          {modes.map(m => (
            <div key={m} className="flex flex-col items-center gap-2">
              <button onClick={() => setMode(m)} className={`w-8 h-8 rounded-full transition-all border border-[#111] flex items-center justify-center
                ${power && mode === m ? 'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.9)] scale-95' : 'shadow-[3px_4px_6px_rgba(0,0,0,0.6),inset_1px_1px_2px_rgba(255,255,255,0.4)]'}
              `} style={{ background: 'linear-gradient(135deg, #d4af37 0%, #8a6a1c 100%)' }}>
                 <div className={`w-1.5 h-1.5 rounded-full ${power && mode === m ? 'bg-[#e66a53] shadow-[0_0_5px_#e66a53]' : 'bg-[#33250a] shadow-inner'}`} />
              </button>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#d4af37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{m}</span>
            </div>
          ))}
        </div>
      );

    case 2: // Flush Walnut (Ivory)
      return (
        <div className="absolute top-[48%] left-[8%] -translate-y-1/2 flex flex-col gap-5 p-4 rounded-full z-10" style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.8), inset -1px -1px 2px rgba(255,255,255,0.1), 0 1px 1px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          {modes.map(m => (
            <div key={m} className="flex flex-col items-center gap-2">
              <button onClick={() => setMode(m)} className={`w-9 h-9 rounded-full transition-all flex items-center justify-center border border-[#111]
                ${power && mode === m ? 'bg-[#dcd5c4] shadow-[inset_2px_4px_8px_rgba(0,0,0,0.4)] scale-95' : 'bg-gradient-to-br from-[#ffffff] to-[#e8e0cc] shadow-[0_4px_6px_rgba(0,0,0,0.7),inset_1px_1px_2px_white]'}
              `}>
                <div className={`w-2 h-2 rounded-full border border-black/10 transition-all ${power && mode === m ? 'bg-[#e66a53] shadow-[0_0_8px_#e66a53,inset_1px_1px_2px_rgba(255,255,255,0.5)]' : 'bg-[#d2c9b4] shadow-inner'}`} />
              </button>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#e8e0cc] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">{m}</span>
            </div>
          ))}
        </div>
      );

    case 3: // Flush Walnut (Matte)
      return (
        <div className="absolute top-[48%] left-[8%] -translate-y-1/2 flex flex-col gap-5 p-4 rounded-[2rem] z-10" style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.2)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.8), inset -1px -1px 2px rgba(255,255,255,0.1), 0 1px 1px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          {modes.map(m => {
            const ledColor = m === 'calm' ? '#4ade80' : m === 'vintage' ? '#fb923c' : '#ef4444';
            return (
              <div key={m} className="flex flex-col items-center gap-2">
                <button onClick={() => setMode(m)} className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border border-black
                  ${power && mode === m ? 'bg-[#111] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.9)] scale-95' : 'bg-[#262626] shadow-[0_4px_6px_rgba(0,0,0,0.8),inset_1px_1px_1px_rgba(255,255,255,0.1)]'}
                `}>
                  <div 
                    className={`w-3 h-[3px] rounded-full ${!power || mode !== m ? 'bg-[#111] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]' : ''}`}
                    style={power && mode === m ? { backgroundColor: ledColor, boxShadow: `0 0 8px ${ledColor}` } : {}}
                  />
                </button>
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" style={{ color: '#d3ba8c' }}>{m}</span>
              </div>
            );
          })}
        </div>
      );


    default: return null;
  }
};

const FRAMES = [
  { name: 'Naked', style: {} },

  { name: 'Oiled Walnut (Premium)', inset: '-inset-5', radius: '3rem',
    style: { 
      backgroundImage: 'url("/textures/walnut.png")', 
      backgroundSize: '200px', 
      boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.1), inset -2px -2px 8px rgba(0,0,0,0.8), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    } },
];

const FILTER_SWITCH_NAMES = [
  'Original Pill',
  'Metal Toggle',
  'Studio Push',
  'Bakelite Slider',
  'LED Tactile',
  'Minimalist Engraved',
  'Brass Rocker',
  'Japandi Wood'
];

const FilterSwitchEngine = ({ value, onChange, styleIndex }) => {
  const is12 = value === 1;
  const label = is12 ? '12dB' : '6dB';

  switch (styleIndex) {
    case 0:
      return (
        <button onClick={() => onChange(is12 ? 0 : 1)} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/30 text-[#edd39a] border border-white/10 hover:bg-black/50 transition-colors shadow-sm">
          {label}
        </button>
      );
    case 1:
      return (
        <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => onChange(is12 ? 0 : 1)}>
          <div className="w-3.5 h-6 rounded-sm bg-gradient-to-b from-[#888] to-[#444] shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),2px_2px_4px_rgba(0,0,0,0.8)] relative flex justify-center border border-[#222]">
            <div className={`w-2 h-3.5 rounded-full bg-gradient-to-b from-[#ddd] to-[#999] absolute transition-all duration-150 shadow-[0_2px_3px_rgba(0,0,0,0.6)] ${is12 ? 'top-[1px]' : 'bottom-[1px]'}`} />
          </div>
          <span className="text-[7px] font-bold text-[#edd39a] drop-shadow-md">{label}</span>
        </div>
      );
    case 2:
      return (
        <button onClick={() => onChange(is12 ? 0 : 1)} className="w-7 h-7 rounded-full bg-[#1a1a1a] border-2 border-[#333] shadow-[0_3px_6px_rgba(0,0,0,0.8)] relative flex justify-center items-center overflow-hidden active:scale-95 transition-transform group">
          <div className={`absolute inset-1 rounded-full transition-colors duration-200 ${is12 ? 'bg-[#e66a53] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_0_8px_#e66a53]' : 'bg-[#2a2a2a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]'}`} />
          <span className="relative z-10 text-[7px] font-black tracking-tighter text-white drop-shadow-md">{label}</span>
        </button>
      );
    case 3:
      return (
        <div className="flex flex-col items-center cursor-pointer group" onClick={() => onChange(is12 ? 0 : 1)}>
          <div className="w-7 h-3.5 rounded bg-[#1a110b] border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.1)] relative">
            <div className={`w-3.5 h-full rounded-[2px] bg-gradient-to-b from-[#4a2e22] to-[#2c1a12] absolute top-0 transition-all duration-200 border-t border-white/20 shadow-[1px_0_3px_rgba(0,0,0,0.9)] ${is12 ? 'right-0' : 'left-0'}`} />
          </div>
          <span className="text-[7px] font-bold text-[#edd39a] mt-0.5">{label}</span>
        </div>
      );
    case 4:
      return (
        <button onClick={() => onChange(is12 ? 0 : 1)} className="w-6 h-6 rounded bg-gradient-to-b from-[#333] to-[#111] border border-[#111] shadow-[2px_2px_5px_rgba(0,0,0,0.8),inset_1px_1px_2px_rgba(255,255,255,0.1)] flex flex-col justify-center gap-0.5 items-center active:scale-95 transition-transform group">
          <div className={`w-1.5 h-1.5 rounded-full ${is12 ? 'bg-[#ff4444] shadow-[0_0_6px_#ff4444]' : 'bg-[#ffaa00] shadow-[0_0_6px_#ffaa00]'}`} />
          <span className="text-[6px] font-bold text-[#aaa]">{label}</span>
        </button>
      );
    case 5:
      return (
        <button onClick={() => onChange(is12 ? 0 : 1)} className="px-2 py-1 bg-gradient-to-br from-[#dfd5c5] to-[#bca68e] rounded-sm shadow-[1px_1px_4px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.6)] border border-[#9a8670] active:shadow-[inset_1px_1px_4px_rgba(0,0,0,0.5)] transition-all">
          <span className="text-[8px] font-black text-[#4a3e2e] mix-blend-multiply opacity-80">{label}</span>
        </button>
      );
    case 6:
      return (
        <div className="w-7 h-5 rounded-sm bg-[#111] p-[1.5px] shadow-[0_2px_5px_rgba(0,0,0,0.8)] cursor-pointer group" onClick={() => onChange(is12 ? 0 : 1)}>
          <div className={`w-full h-full rounded-[1px] bg-gradient-to-b from-[#ffe082] to-[#c79121] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.5)] border border-[#6a4c0a] flex items-center justify-center transition-transform duration-150 ${is12 ? 'rotate-x-12' : '-rotate-x-12'}`} style={{ perspective: '100px' }}>
             <span className="text-[6px] font-black text-[#4a2e05] opacity-80">{label}</span>
          </div>
        </div>
      );
    case 7:
      return (
        <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => onChange(is12 ? 0 : 1)}>
           <div className={`w-4 h-4 rounded-full bg-gradient-to-br from-[#d4b998] to-[#b89873] border border-[#8a6e51] shadow-[2px_2px_5px_rgba(0,0,0,0.5),inset_1px_1px_3px_rgba(255,255,255,0.5)] flex justify-center items-center transition-transform duration-200 ${is12 ? 'rotate-90' : 'rotate-0'}`}>
             <div className="w-2.5 h-0.5 bg-[#4a3521] shadow-inner rounded-full" />
           </div>
           <span className="text-[7px] font-bold text-[#e66a53] tracking-wider drop-shadow-sm">{label}</span>
        </div>
      );
    default: return null;
  }
};

const IO_SCALE_NAMES = [
  "None", 
  "Classic Dots", 
  "Studio Ticks", 
  "Minimalist Arcs", 
  "Vintage Continuous",
  "Modern Percent",
  "Bold Industrial",
  "Japandi Radial",
  "Decibel Arcs",
  "Radar Sweep",
  "Broadcast Ring",
  "Precision Diamond",
  "Double Arc",
  "Compass Rose"
];

const KnobScaleRing = ({ styleIndex, size = 55 }) => {
  if (styleIndex === 0) return null;
  
  const r = size / 2 + 25; // Increased radius for scale to prevent clipping
  const vBox = `-${r} -${r} ${r*2} ${r*2}`;
  const ringStyle = { 
    width: r*2, 
    height: r*2, 
    top: size / 2, 
    left: '50%', 
    transform: 'translate(-50%, -50%)' 
  };
  const svgClass = "absolute pointer-events-none overflow-visible";

  switch (styleIndex) {
    case 1:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(11)].map((_, i) => {
            const angle = -140 + (i * 28);
            const rad = (angle - 90) * (Math.PI / 180);
            return <circle key={i} cx={Math.cos(rad) * (r-14)} cy={Math.sin(rad) * (r-14)} r="1.8" fill="#5a5549" opacity="0.8" />;
          })}
          <text x={0} y={-r + 9} textAnchor="middle" fill="#3a352d" fontSize="10" fontWeight="bold" opacity="0.9">0</text>
          <text x={-r + 14} y={r - 16} textAnchor="end" fill="#5a5549" fontSize="9" fontWeight="bold" opacity="0.8">-24</text>
          <text x={r - 14} y={r - 16} textAnchor="start" fill="#5a5549" fontSize="9" fontWeight="bold" opacity="0.8">+12</text>
        </svg>
      );
    case 2:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(10)].map((_, i) => {
            const angle = -140 + (i * 31.11);
            return <line key={i} x1="0" y1={-r + 11} x2="0" y2={-r + 17} stroke="#5a5549" strokeWidth="1.2" opacity="0.8" transform={`rotate(${angle})`} />;
          })}
          <text x={-r + 15} y={r - 13} textAnchor="end" fill="#5a5549" fontSize="7" fontWeight="bold" opacity="0.7">1</text>
          <text x={r - 15} y={r - 13} textAnchor="start" fill="#5a5549" fontSize="7" fontWeight="bold" opacity="0.7">10</text>
        </svg>
      );
    case 3:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-13)} ${Math.sin(-230 * Math.PI/180)*(r-13)} A ${r-13} ${r-13} 0 0 1 ${Math.cos(-95 * Math.PI/180)*(r-13)} ${Math.sin(-95 * Math.PI/180)*(r-13)}`} fill="none" stroke="#5a5549" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d={`M ${Math.cos(-85 * Math.PI/180)*(r-13)} ${Math.sin(-85 * Math.PI/180)*(r-13)} A ${r-13} ${r-13} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-13)} ${Math.sin(50 * Math.PI/180)*(r-13)}`} fill="none" stroke="#3a352d" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        </svg>
      );
    case 4:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-13)} ${Math.sin(-230 * Math.PI/180)*(r-13)} A ${r-13} ${r-13} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-13)} ${Math.sin(50 * Math.PI/180)*(r-13)}`} fill="none" stroke="#5a5549" strokeWidth="3" opacity="0.4" />
          {[...Array(21)].map((_, i) => {
            const angle = -140 + (i * 14);
            const isMajor = i % 5 === 0;
            return <line key={i} x1="0" y1={-r + 9} x2="0" y2={-r + 15} stroke="#5a5549" strokeWidth={isMajor ? 1.5 : 0.8} opacity="0.8" transform={`rotate(${angle})`} />;
          })}
        </svg>
      );
    case 5:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(31)].map((_, i) => {
            const angle = -140 + (i * 9.33);
            const rad = (angle - 90) * (Math.PI / 180);
            return <circle key={i} cx={Math.cos(rad) * (r-13)} cy={Math.sin(rad) * (r-13)} r="0.8" fill="#3a352d" opacity={0.4 + (i/30)*0.6} />;
          })}
          <text x={-r + 9} y={r - 9} textAnchor="end" fill="#5a5549" fontSize="6" opacity="0.8">0%</text>
          <text x={r - 9} y={r - 9} textAnchor="start" fill="#3a352d" fontSize="6" opacity="1.0">100%</text>
        </svg>
      );
    case 6:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = -140 + (i * 70);
            return <line key={i} x1="0" y1={-r + 11} x2="0" y2={-r + 17} stroke="#3a352d" strokeWidth="3" strokeLinecap="square" transform={`rotate(${angle})`} />;
          })}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = -140 + (i * 70);
            return <line key={`i-${i}`} x1="0" y1={-r + 12} x2="0" y2={-r + 16} stroke="#8b7b65" strokeWidth="1.5" strokeLinecap="square" opacity="0.9" transform={`rotate(${angle})`} />;
          })}
        </svg>
      );
    case 7:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-15)} ${Math.sin(-230 * Math.PI/180)*(r-15)} A ${r-15} ${r-15} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-15)} ${Math.sin(50 * Math.PI/180)*(r-15)}`} fill="none" stroke="#5a5549" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.7" />
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-9)} ${Math.sin(-230 * Math.PI/180)*(r-9)} A ${r-9} ${r-9} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-9)} ${Math.sin(50 * Math.PI/180)*(r-9)}`} fill="none" stroke="#5a5549" strokeWidth="0.4" strokeDasharray="1 3" opacity="0.5" />
          <circle cx={Math.cos(-90 * Math.PI/180)*(r-15)} cy={Math.sin(-90 * Math.PI/180)*(r-15)} r="2" fill="#3a352d" opacity="1.0" />
        </svg>
      );
    case 8: // Decibel Arcs
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-14)} ${Math.sin(-230 * Math.PI/180)*(r-14)} A ${r-14} ${r-14} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-14)} ${Math.sin(50 * Math.PI/180)*(r-14)}`} fill="none" stroke="#5a5549" strokeWidth="0.5" opacity="0.3" />
          <text x={0} y={-r + 9} textAnchor="middle" fill="#3a352d" fontSize="9" fontWeight="bold">0</text>
          <text x={-r + 14} y={r - 16} textAnchor="end" fill="#5a5549" fontSize="8" fontWeight="bold">-12</text>
          <text x={r - 14} y={r - 16} textAnchor="start" fill="#5a5549" fontSize="8" fontWeight="bold">+12</text>
          {[0, 1, 2].map(i => {
            const a = -140 + (i * 140);
            return <circle key={i} cx={Math.cos((a-90)*Math.PI/180)*(r-14)} cy={Math.sin((a-90)*Math.PI/180)*(r-14)} r="2" fill="#3a352d" />;
          })}
        </svg>
      );
    case 9: // Radar Sweep
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(20)].map((_, i) => {
            const angle = -140 + (i * 14.7);
            const rad = (angle - 90) * (Math.PI / 180);
            return <circle key={i} cx={Math.cos(rad)*(r-13)} cy={Math.sin(rad)*(r-13)} r={1 + i*0.1} fill="#5a5549" opacity={0.1 + i*0.04} />;
          })}
        </svg>
      );
    case 10: // Broadcast Ring
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(6)].map((_, i) => {
            const angle = -140 + (i * 56);
            return <line key={i} x1="0" y1={-r + 12} x2="0" y2={-r + 19} stroke="#5a5549" strokeWidth="4" strokeLinecap="round" opacity="0.8" transform={`rotate(${angle})`} />;
          })}
          <circle cx="0" cy="0" r={r-15} fill="none" stroke="#5a5549" strokeWidth="1" strokeDasharray="2 10" opacity="0.2" />
        </svg>
      );
    case 11: // Precision Diamond
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(11)].map((_, i) => {
            const angle = -140 + (i * 28);
            return <rect key={i} x="-2" y={-r + 13} width="4" height="4" fill="#3a352d" opacity="0.8" transform={`rotate(${angle})`} />;
          })}
        </svg>
      );
    case 12: // Double Arc
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-15)} ${Math.sin(-230 * Math.PI/180)*(r-15)} A ${r-15} ${r-15} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-15)} ${Math.sin(50 * Math.PI/180)*(r-15)}`} fill="none" stroke="#3a352d" strokeWidth="2" opacity="0.8" />
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-10)} ${Math.sin(-230 * Math.PI/180)*(r-10)} A ${r-10} ${r-10} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-10)} ${Math.sin(50 * Math.PI/180)*(r-10)}`} fill="none" stroke="#5a5549" strokeWidth="1" strokeDasharray="1 3" opacity="0.5" />
        </svg>
      );
    case 13: // Compass Rose
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[0, 90, 180, 270].map(a => (
            <g key={a} transform={`rotate(${a - 45})`}>
              <line x1="0" y1={-r + 10} x2="0" y2={-r + 20} stroke="#3a352d" strokeWidth="1.5" />
              <line x1="-5" y1={-r + 15} x2="5" y2={-r + 15} stroke="#3a352d" strokeWidth="0.5" />
            </g>
          ))}
          <circle cx="0" cy="0" r={r-15} fill="none" stroke="#5a5549" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
        </svg>
      );
    default: return null;
  }
};

export default function App() {
  const [power, setPower] = useState(true);
  const [input, setInput] = useState(50);
  const [output, setOutput] = useState(50);
  const [drift, setDrift] = useState(0);
  const [spread, setSpread] = useState(50);
  const [character, setCharacter] = useState(80);
  const [charFilter, setCharFilter] = useState(1);
  const [sweeten, setSweeten] = useState(60);
  const [biasHF, setBiasHF] = useState(40);
  const [noise, setNoise] = useState(30);
  const [rate, setRate] = useState(30);
  const [depth, setDepth] = useState(0);
  const [stereoPhase, setStereoPhase] = useState(0);
  const [mode, setMode] = useState('vintage');
  const [autoGain, setAutoGain] = useState(true);
  const [lfoEnabled, setLfoEnabled] = useState(false);
  const [lfoSync, setLfoSync] = useState(false);
  const [lfoShape, setLfoShape] = useState(0);
  const [lfoSyncDiv, setLfoSyncDiv] = useState(4);
  const [currentPreset, setCurrentPreset] = useState(-1);
  const [frameStyle, setFrameStyle] = useState(0);
  const [modeStyle, setModeStyle] = useState(0);
  const [knobStyle, setKnobStyle] = useState(0);
  const [centerDialStyle, setCenterDialStyle] = useState(1);
  const [driftAnimation, setDriftAnimation] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [showOutputs, setShowOutputs] = useState(true);
  const [parallelCables, setParallelCables] = useState(true);
  const [showStems, setShowStems] = useState(false);
  const [showFerns, setShowFerns] = useState(true);
  const [filterSwitchStyle, setFilterSwitchStyle] = useState(0);
  const [ioScaleStyle, setIoScaleStyle] = useState(1);

  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setScale(entries[0].contentRect.width / 850);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden gap-16 xl:gap-24 flex-col lg:flex-row" style={{ backgroundColor: BACKGROUNDS[bgIndex].color, transition: 'background-color 0.5s ease' }}>
      
      {/* Plugin Area */}
      <div ref={containerRef} className="relative w-full max-w-[680px] aspect-square flex items-center justify-center flex-shrink-0">
        <div className="absolute" style={{ width: 850, height: 850, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          
          {/* Frame Wrapper */}
          <div 
            className={`absolute ${FRAMES[frameStyle].inset || '-inset-6'} transition-all duration-500 pointer-events-none`} 
            style={{ borderRadius: FRAMES[frameStyle].radius || '4.5rem', zIndex: -1, ...FRAMES[frameStyle].style }}
          >
            {FRAMES[frameStyle].innerStyle && (
              <div 
                className={`absolute ${FRAMES[frameStyle].innerStyle.inset || 'inset-2'} transition-all duration-500`} 
                style={{ borderRadius: FRAMES[frameStyle].innerStyle.radius || '4rem', ...FRAMES[frameStyle].innerStyle }} 
              />
            )}
            {FRAMES[frameStyle].overlayStyle && (
              <div 
                className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none transition-all duration-500" 
                style={{ borderRadius: 'inherit', ...FRAMES[frameStyle].overlayStyle }} 
              />
            )}
          </div>

          <AnalogCables position="left" parallel={parallelCables} />
          {showOutputs && <AnalogCables position="right" parallel={parallelCables} />}

          <PresetBrowser presets={DEMO_PRESETS} currentPreset={currentPreset}
            onPrev={() => setCurrentPreset(p => (p - 1 + DEMO_PRESETS.length) % DEMO_PRESETS.length)}
            onNext={() => setCurrentPreset(p => (p + 1) % DEMO_PRESETS.length)}
            onLoad={setCurrentPreset} onSave={(name) => console.log('Save preset:', name)} />

          <div className="relative w-full h-full rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.4),0_20px_30px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-500 bg-[#f4ead6] z-10">

            <div className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply" style={{ opacity: 0.28, backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%222.0%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')" }} />
            <div className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] bg-[#e66a53] rounded-full mix-blend-multiply opacity-90" />
            <div className="absolute top-[40%] -left-[15%] w-[40%] h-[40%] bg-[#e0a96d] rounded-full mix-blend-multiply opacity-70" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#b04a4a] rounded-full mix-blend-multiply opacity-50" />

            <DetailedMonstera showStems={showStems} />
            <DetailedFernsRight showFerns={showFerns} />

            <div className={`absolute inset-0 bg-[#3a352d]/50 backdrop-grayscale transition-all duration-700 z-40 pointer-events-none ${power ? 'opacity-0' : 'opacity-100'}`} />

            <div className="absolute top-[6%] left-[8%] z-10 flex flex-col items-start">
              <h1 className="text-3xl leading-none font-black tracking-tighter text-[#e66a53] drop-shadow-sm flex gap-3"><span>VINTAGE</span> <span>DRIFTER</span></h1>
              <p className="text-[10px] tracking-[0.4em] font-bold text-[#8b7b65] mt-1">BY POLARIS DSP</p>
            </div>

            <div className="absolute top-[6%] right-[10%] z-10 flex flex-col items-center">
              <div className="text-[12px] font-black tracking-[0.2em] text-[#e66a53] mb-4 drop-shadow-sm">POWER</div>
              <button onClick={() => setPower(!power)} className="relative w-8 h-14 bg-[#111] rounded-md border border-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),10px_10px_20px_rgba(0,0,0,0.4)] flex justify-center items-center">
                <div className="w-3 h-8 rounded-full bg-gradient-to-b from-[#edd39a] to-[#a88842] shadow-[0_5px_10px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-transform duration-200" style={{ transform: power ? 'translateY(-8px)' : 'translateY(8px)' }} />
              </button>
            </div>

            <div className="absolute top-[calc(16%+20px)] left-[calc(30%-40px)] z-10 flex gap-[68px]">
              <div className="relative">
                <KnobScaleRing styleIndex={ioScaleStyle} size={55} />
                <MatteKnob label="Input" value={input} onChange={setInput} onDoubleClick={() => setInput(50)} size={55} />
              </div>
              <div className="relative">
                <KnobScaleRing styleIndex={ioScaleStyle} size={55} />
                <MatteKnob label="Output" value={output} onChange={setOutput} onDoubleClick={() => setOutput(50)} size={55} />
              </div>
            </div>

            <div className="absolute top-[52%] left-[50%] -translate-x-1/2 -translate-y-1/2">
              <BotanicalCenterDial 
                drift={drift} setDrift={setDrift} onDoubleClickDrift={() => setDrift(0)}
                spread={spread} setSpread={setSpread} onDoubleClickSpread={() => setSpread(0)}
                rate={rate} shadowStyle={CENTER_DIAL_SHADOWS[centerDialStyle].shadow} animationStyle={driftAnimation}
              />
            </div>

            <ModeSelectorEngine mode={mode} setMode={setMode} styleIndex={modeStyle} power={power} />

            <div className="absolute top-[38%] right-[10%] z-30 grid grid-cols-2 gap-x-6 gap-y-10 justify-items-center">
              <div className="relative">
                <MatteKnob label="Filter" value={character} onChange={setCharacter} onDoubleClick={() => setCharacter(0)} size={50} labelColorOverride="text-white/90 drop-shadow-md" />
                <div className="absolute -top-3 -right-6 z-40">
                  <FilterSwitchEngine value={charFilter} onChange={setCharFilter} styleIndex={filterSwitchStyle} />
                </div>
              </div>
              <MatteKnob label="Sweeten" value={sweeten} onChange={setSweeten} onDoubleClick={() => setSweeten(0)} size={50} labelColorOverride="text-white/90 drop-shadow-md" />
              <div className="relative">
                <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                  <HardwareLED active={power && biasHF > 20} color="coral" size={6} label="DRV" />
                </div>
                <MatteKnob label="Sat" value={biasHF} onChange={setBiasHF} onDoubleClick={() => setBiasHF(0)} size={45} labelColorOverride="text-white/90 drop-shadow-md" />
              </div>
              <MatteKnob label="Noise" value={noise} onChange={setNoise} onDoubleClick={() => setNoise(0)} size={45} labelColorOverride="text-white/90 drop-shadow-md" />
            </div>

            <div className="absolute bottom-[28%] right-[7%] z-30 flex flex-col items-center gap-2">
              <div className="relative w-[148px] h-9 rounded-lg bg-[#2d2c2b]/78 border border-white/15 shadow-[8px_10px_18px_rgba(0,0,0,0.28),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-md">
                <select
                  value={driftAnimation}
                  onChange={e => setDriftAnimation(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                  {DRIFT_ANIMATION_STYLES.map((name, i) => <option key={i} value={i} className="bg-[#2d2c2b] text-[#edd39a]">{name}</option>)}
                </select>
                <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
                  <span className="text-[#edd39a] text-[9px] font-black tracking-[0.12em] uppercase text-center leading-tight">{DRIFT_ANIMATION_STYLES[driftAnimation]}</span>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[#e66a53] text-[9px] pointer-events-none">▼</div>
              </div>
              <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-white/90 drop-shadow-md">drift visual</span>
            </div>

            <div className="absolute bottom-[10%] left-[12%] z-10 flex gap-6 items-end">
              <div className="flex flex-col items-center gap-3">
                <HardwareLED active={power && lfoEnabled} color="gold" size={6} label="LFO" pulse={true} />
                <MatteKnob label="Rate" value={rate} onChange={setRate} size={70} labelColorOverride="text-white/90 drop-shadow-md" shadingStyle={KNOB_STYLES[knobStyle]} />
              </div>
            </div>

            <div className="absolute bottom-[6%] left-[26%] z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MiniToggle label="LFO" active={lfoEnabled} onClick={() => setLfoEnabled(!lfoEnabled)} />
                {lfoEnabled && <MiniToggle label="Sync" active={lfoSync} onClick={() => setLfoSync(!lfoSync)} />}
              </div>
              {lfoEnabled && (
                <div className="flex items-center gap-2">
                  <DropdownSelect options={SHAPES} value={lfoShape} onChange={setLfoShape} width={70} />
                  {lfoSync && <DropdownSelect options={SYNC_DIVS} value={lfoSyncDiv} onChange={setLfoSyncDiv} width={60} />}
                </div>
              )}
            </div>

            <div className="absolute bottom-[12%] left-[50%] -translate-x-1/2 z-10 flex gap-8 p-3 rounded-full bg-[#2d2c2b] shadow-2xl border border-white/10" style={{ boxShadow: '12px 12px 20px rgba(0,0,0,0.45)' }}>
              <div className="flex flex-col items-center">
                <input type="range" className="w-16 accent-[#d4af37]" min="0" max="100" value={depth} onChange={e => setDepth(Number(e.target.value))} />
                <span className="text-[9px] text-[#a19e95] tracking-widest mt-1 uppercase">Depth</span>
              </div>
              <div className="flex flex-col items-center">
                <input type="range" className="w-16 accent-[#d4af37]" min="0" max="100" value={stereoPhase} onChange={e => setStereoPhase(Number(e.target.value))} />
                <span className="text-[9px] text-[#a19e95] tracking-widest mt-1 uppercase">Stereo φ</span>
              </div>
            </div>

            <div className="absolute bottom-[12%] right-[15%] z-10">
              <button onClick={() => setAutoGain(!autoGain)} className="w-16 h-16 rounded-full flex justify-center items-center active:scale-95 transition-transform border-2 border-white/20" style={{ backgroundColor: '#e66a53', boxShadow: '12px 12px 20px rgba(180,60,40,0.5), inset 2px 2px 5px rgba(255,255,255,0.5), inset -2px -2px 5px rgba(0,0,0,0.3)' }}>
                <div className={`w-6 h-6 rounded-full ${autoGain && power ? 'bg-white shadow-[0_0_15px_white]' : 'bg-[#a34433] shadow-inner'} transition-all`} />
              </button>
              <div className="text-center text-[9px] tracking-[0.2em] font-bold text-[#fff] drop-shadow-md mt-3 uppercase">Auto Gain</div>
            </div>

          </div>
        </div>
      </div>

      {/* Sidebar Panel - Sketch Style */}
      <div className="hidden lg:flex flex-col items-center py-10 gap-6 w-[280px] rounded-[3.5rem] border-[4px] border-white/80 shrink-0">
        
        {/* Dropdown 1: Frame Style */}
        <div className="w-full px-6 flex flex-col items-center gap-3 relative">
          <div className="relative w-full h-14">
            <select 
              value={frameStyle} 
              onChange={e => setFrameStyle(Number(e.target.value))}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent rounded-[2rem] border-[4px] border-white/80 outline-none cursor-pointer appearance-none z-10"
            >
              {FRAMES.map((f, i) => <option key={i} value={i} className="bg-[#c8bba6] text-[#5a5549]">{f.name}</option>)}
            </select>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-white font-medium text-[15px] tracking-wide">{FRAMES[frameStyle].name}</span>
            </div>
          </div>
          <span className="text-white/90 text-[15px] font-medium tracking-wide">frame style</span>
        </div>

        {/* Dropdown 2: Mode Selector Style */}
        <div className="w-full px-6 flex flex-col items-center gap-3 relative">
          <div className="relative w-full h-14">
            <select 
              value={modeStyle} 
              onChange={e => setModeStyle(Number(e.target.value))}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent rounded-[2rem] border-[4px] border-white/80 outline-none cursor-pointer appearance-none z-10"
            >
              {MODE_STYLE_NAMES.map((name, i) => <option key={i} value={i} className="bg-[#c8bba6] text-[#5a5549]">{name}</option>)}
            </select>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-white font-medium text-[15px] tracking-wide text-center leading-tight px-4">{MODE_STYLE_NAMES[modeStyle]}</span>
            </div>
          </div>
          <span className="text-white/90 text-[15px] font-medium tracking-wide">mode style</span>
        </div>

        {/* Dropdown 3: Knob Shading Style */}
        <div className="w-full px-6 flex flex-col items-center gap-3 relative">
          <div className="relative w-full h-14">
            <select 
              value={knobStyle} 
              onChange={e => setKnobStyle(Number(e.target.value))}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent rounded-[2rem] border-[4px] border-white/80 outline-none cursor-pointer appearance-none z-10"
            >
              {KNOB_STYLES.map((style, i) => <option key={i} value={i} className="bg-[#c8bba6] text-[#5a5549]">{style.name}</option>)}
            </select>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-white font-medium text-[15px] tracking-wide text-center leading-tight px-4">{KNOB_STYLES[knobStyle].name}</span>
            </div>
          </div>
          <span className="text-white/90 text-[15px] font-medium tracking-wide">knob shading</span>
        </div>

        {/* Dropdown 4: Center Dial Shading */}
        <div className="w-full px-6 flex flex-col items-center gap-3 relative">
          <div className="relative w-full h-14">
            <select 
              value={centerDialStyle} 
              onChange={e => setCenterDialStyle(Number(e.target.value))}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent rounded-[2rem] border-[4px] border-white/80 outline-none cursor-pointer appearance-none z-10"
            >
              {CENTER_DIAL_SHADOWS.map((style, i) => <option key={i} value={i} className="bg-[#c8bba6] text-[#5a5549]">{style.name}</option>)}
            </select>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-white font-medium text-[15px] tracking-wide text-center leading-tight px-4">{CENTER_DIAL_SHADOWS[centerDialStyle].name}</span>
            </div>
          </div>
          <span className="text-white/90 text-[15px] font-medium tracking-wide">center dial</span>
        </div>

        {/* Dropdown 3: Background */}
        <div className="w-full px-6 flex flex-col items-center gap-3 relative">
          <div className="relative w-full h-14">
            <select 
              value={bgIndex} 
              onChange={e => setBgIndex(Number(e.target.value))}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent rounded-[2rem] border-[4px] border-white/80 outline-none cursor-pointer appearance-none z-10"
            >
              {BACKGROUNDS.map((bg, i) => <option key={i} value={i} className="bg-[#c8bba6] text-[#5a5549]">{bg.name}</option>)}
            </select>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-white font-medium text-[15px] tracking-wide text-center leading-tight px-4">{BACKGROUNDS[bgIndex].name}</span>
            </div>
          </div>
          <span className="text-white/90 text-[15px] font-medium tracking-wide">environment</span>
        </div>

        {/* Dropdown 5: Filter Switch */}
        <div className="w-full px-6 flex flex-col items-center gap-3 relative">
          <div className="relative w-full h-14">
            <select 
              value={filterSwitchStyle} 
              onChange={e => setFilterSwitchStyle(Number(e.target.value))}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent rounded-[2rem] border-[4px] border-white/80 outline-none cursor-pointer appearance-none z-10"
            >
              {FILTER_SWITCH_NAMES.map((name, i) => <option key={i} value={i} className="bg-[#c8bba6] text-[#5a5549]">{name}</option>)}
            </select>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-white font-medium text-[15px] tracking-wide text-center leading-tight px-4">{FILTER_SWITCH_NAMES[filterSwitchStyle]}</span>
            </div>
          </div>
          <span className="text-white/90 text-[15px] font-medium tracking-wide">filter switch</span>
        </div>

        {/* Dropdown 6: I/O Scale */}
        <div className="w-full px-6 flex flex-col items-center gap-3 relative">
          <div className="relative w-full h-14">
            <select 
              value={ioScaleStyle} 
              onChange={e => setIoScaleStyle(Number(e.target.value))}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent rounded-[2rem] border-[4px] border-white/80 outline-none cursor-pointer appearance-none z-10"
            >
              {IO_SCALE_NAMES.map((name, i) => <option key={i} value={i} className="bg-[#c8bba6] text-[#5a5549]">{name}</option>)}
            </select>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-white font-medium text-[15px] tracking-wide text-center leading-tight px-4">{IO_SCALE_NAMES[ioScaleStyle]}</span>
            </div>
          </div>
          <span className="text-white/90 text-[15px] font-medium tracking-wide">i/o scales</span>
        </div>

        {/* Toggles Grid */}
        <div className="w-full px-4 grid grid-cols-2 gap-x-2 gap-y-5 mt-2">
          
          {/* Toggle Outputs */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowOutputs(!showOutputs)}
              className={`w-12 h-7 rounded-full border-[3px] border-white/80 flex items-center px-0.5 transition-colors duration-300 ${showOutputs ? 'bg-white/20' : 'bg-transparent'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showOutputs ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className="text-white/90 text-[12px] font-medium tracking-wide text-center leading-tight">cables</span>
          </div>

          {/* Toggle Cable Routing */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setParallelCables(!parallelCables)}
              className={`w-12 h-7 rounded-full border-[3px] border-white/80 flex items-center px-0.5 transition-colors duration-300 ${parallelCables ? 'bg-white/20' : 'bg-transparent'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${parallelCables ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className="text-white/90 text-[12px] font-medium tracking-wide text-center leading-tight">parallel</span>
          </div>

          {/* Toggle Monstera Stems */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowStems(!showStems)}
              className={`w-12 h-7 rounded-full border-[3px] border-white/80 flex items-center px-0.5 transition-colors duration-300 ${showStems ? 'bg-white/20' : 'bg-transparent'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showStems ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className="text-white/90 text-[12px] font-medium tracking-wide text-center leading-tight">stems</span>
          </div>

          {/* Toggle Right Ferns */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowFerns(!showFerns)}
              className={`w-12 h-7 rounded-full border-[3px] border-white/80 flex items-center px-0.5 transition-colors duration-300 ${showFerns ? 'bg-white/20' : 'bg-transparent'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showFerns ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className="text-white/90 text-[12px] font-medium tracking-wide text-center leading-tight">ferns</span>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .drift-aurora-sheet {
          transform: translate(-50%, -50%);
          transform-origin: center;
          animation-name: drift-aurora-fold;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes drift-aurora-fold {
          0%, 100% { transform: translate(-50%, -50%) rotate(-14deg) scale(0.92, 1.04); border-radius: 44% 56% 42% 58% / 62% 38% 58% 42%; }
          45% { transform: translate(calc(-50% + 16px), calc(-50% - 10px)) rotate(12deg) scale(1.08, 0.96); border-radius: 60% 40% 58% 42% / 38% 62% 44% 56%; }
          72% { transform: translate(calc(-50% - 10px), calc(-50% + 8px)) rotate(4deg) scale(1.02, 1.08); border-radius: 52% 48% 38% 62% / 54% 46% 64% 36%; }
        }
        .drift-aurora-liquid-field {
          will-change: filter, transform;
          animation: drift-aurora-liquid-breathe var(--drift-speed-slow) ease-in-out infinite;
        }
        @keyframes drift-aurora-liquid-breathe {
          0%, 100% { opacity: 1; }
          45% { opacity: 0.92; }
          72% { opacity: 0.98; }
        }
        .drift-aurora-core {
          transform: translate(-50%, -50%);
          animation-name: drift-core-pulse;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes drift-core-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.82); opacity: 0.18; }
          50% { transform: translate(-50%, -50%) scale(1.22); opacity: 0.42; }
        }
        * { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
        body { overflow: hidden; touch-action: none; }
        input[type="range"] { -webkit-user-select: auto; user-select: auto; }
      `}} />
    </div>
  );
}
