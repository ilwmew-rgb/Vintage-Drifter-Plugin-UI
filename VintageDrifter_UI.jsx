import React, { useState, useRef, useEffect } from 'react';

// --- Procedural Drift Animation Engine ---
const WobblyAura = ({ drift, spread, active, rate }) => {
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

// --- Botanical SVGs ---
const DetailedMonstera = () => (
  <svg viewBox="0 0 200 200" className="absolute -bottom-10 -left-10 w-80 h-80 pointer-events-none opacity-[0.9] mix-blend-multiply z-0" style={{ filter: 'drop-shadow(15px 15px 20px rgba(0,0,0,0.4))' }}>
    <defs><clipPath id="monstera-cuts"><rect width="200" height="200" fill="white" /><ellipse cx="20" cy="70" rx="35" ry="12" transform="rotate(25 20 70)" fill="black" /><ellipse cx="10" cy="110" rx="40" ry="15" transform="rotate(10 10 110)" fill="black" /><ellipse cx="30" cy="160" rx="30" ry="10" transform="rotate(-15 30 160)" fill="black" /><ellipse cx="160" cy="50" rx="40" ry="15" transform="rotate(-30 160 50)" fill="black" /><ellipse cx="180" cy="100" rx="45" ry="16" transform="rotate(-10 180 100)" fill="black" /><ellipse cx="160" cy="150" rx="35" ry="12" transform="rotate(15 160 150)" fill="black" /><circle cx="110" cy="40" r="8" fill="black" /><ellipse cx="60" cy="80" rx="12" ry="6" transform="rotate(30 60 80)" fill="black" /><ellipse cx="140" cy="90" rx="15" ry="7" transform="rotate(-20 140 90)" fill="black" /><circle cx="120" cy="130" r="9" fill="black" /><circle cx="70" cy="140" r="7" fill="black" /></clipPath></defs>
    <g transform="translate(10, 10) rotate(15) scale(0.9)"><path d="M 100 10 C 170 10 190 70 180 130 C 170 190 120 190 100 190 C 80 190 30 190 20 130 C 10 70 30 10 100 10 Z" fill="#2c3e35" clipPath="url(#monstera-cuts)" /><path d="M 100 10 C 100 10 95 190 95 190" stroke="#1e2a24" strokeWidth="3" fill="none" /></g>
    <g transform="translate(-20, 80) rotate(-20) scale(0.6)"><path d="M 100 10 C 170 10 190 70 180 130 C 170 190 120 190 100 190 C 80 190 30 190 20 130 C 10 70 30 10 100 10 Z" fill="#1e2a24" clipPath="url(#monstera-cuts)" /><path d="M 100 10 C 100 10 95 190 95 190" stroke="#111" strokeWidth="4" fill="none" /></g>
  </svg>
);

const DetailedFernsRight = () => (
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

const MatteKnob = ({ label, value, onChange, min = 0, max = 100, size = 60, color = 'charcoal', labelColorOverride, shadingStyle }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(0);
  const handlePointerDown = (e) => { e.preventDefault(); setIsDragging(true); startY.current = e.clientY; startVal.current = value; e.target.setPointerCapture(e.pointerId); };
  const handlePointerMove = (e) => { if (!isDragging) return; e.preventDefault(); const d = startY.current - e.clientY; onChange(Math.max(min, Math.min(max, startVal.current + (d * 0.8) * ((max - min) / 100)))); };
  const handlePointerUp = (e) => { setIsDragging(false); e.target.releasePointerCapture(e.pointerId); };
  const rotation = ((value - min) / (max - min) * 270) - 135;
  const isCoral = color === 'coral';
  return (
    <div className="flex flex-col items-center justify-center group select-none relative z-10">
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

const BotanicalCenterDial = ({ drift, setDrift, spread, setSpread, rate }) => {
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

  return (
    <div className="relative flex justify-center items-center z-20" style={{ width: 340, height: 340 }}>
      <WobblyAura drift={drift} spread={spread} active={isDraggingDrift || isDraggingSpread} rate={rate} />
      <div className="absolute rounded-full cursor-ns-resize flex justify-center items-center group z-10" style={{ width: 320, height: 320, backgroundColor: '#1f1e1d', backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent, transparent 2px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px), conic-gradient(from 0deg at 50% 50%, #111, #333, #111, #333, #111)', boxShadow: '18px 18px 35px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.1), inset -3px -3px 8px rgba(0,0,0,0.8)' }}
        onPointerDown={handleSpreadDown} onPointerMove={handleSpreadMove} onPointerUp={handleSpreadUp} onPointerCancel={handleSpreadUp}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <circle cx="160" cy="160" r="140" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="160" cy="160" r="120" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="90" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="20 40" />
          {[...Array(11)].map((_, i) => (<text key={i} x="160" y="35" fill="#d4af37" fontSize="8" fontFamily="monospace" textAnchor="middle" style={{ transformOrigin: '160px 160px', transform: `rotate(${-135 + i * 27}deg)` }}>{i < 9 ? `0${i+1}` : `${i+1}`}</text>))}
        </svg>
        <div className="absolute inset-0 transition-transform duration-75 pointer-events-none" style={{ transform: `rotate(${spreadRot}deg)` }}>
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-2 h-6 bg-[#e66a53] rounded-full shadow-[0_0_10px_#e66a53]" />
        </div>
        <div className="absolute rounded-full cursor-ns-resize flex justify-center items-center hover:brightness-110 transition-all z-20" style={{ width: 140, height: 140, background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #a88842 0deg, #edd39a 45deg, #a88842 90deg, #edd39a 135deg, #a88842 180deg, #edd39a 225deg, #a88842 270deg, #edd39a 315deg, #a88842 360deg)', boxShadow: '15px 15px 30px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.9), inset -4px -4px 8px rgba(0,0,0,0.6)' }}
          onPointerDown={handleDriftDown} onPointerMove={handleDriftMove} onPointerUp={handleDriftUp} onPointerCancel={handleDriftUp}>
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
  const [bgIndex, setBgIndex] = useState(0);
  const [showOutputs, setShowOutputs] = useState(true);
  const [parallelCables, setParallelCables] = useState(true);

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

            <DetailedMonstera />
            <DetailedFernsRight />

            <div className={`absolute inset-0 bg-[#3a352d]/50 backdrop-grayscale transition-all duration-700 z-40 pointer-events-none ${power ? 'opacity-0' : 'opacity-100'}`} />

            <div className="absolute top-[6%] left-[8%] z-10 flex flex-col items-start">
              <h1 className="text-3xl leading-none font-black tracking-tighter text-[#e66a53] drop-shadow-sm flex gap-3"><span>VINTAGE</span> <span>DRIFTER</span></h1>
              <p className="text-[10px] tracking-[0.4em] font-bold text-[#8b7b65] mt-1">POLARIS BOTANICA</p>
            </div>

            <div className="absolute top-[6%] right-[10%] z-10 flex flex-col items-center">
              <div className="text-[12px] font-black tracking-[0.2em] text-[#e66a53] mb-4 drop-shadow-sm">POLARIS DSP</div>
              <button onClick={() => setPower(!power)} className="relative w-8 h-14 bg-[#111] rounded-md border border-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),10px_10px_20px_rgba(0,0,0,0.4)] flex justify-center items-center">
                <div className="w-3 h-8 rounded-full bg-gradient-to-b from-[#edd39a] to-[#a88842] shadow-[0_5px_10px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-transform duration-200" style={{ transform: power ? 'translateY(-8px)' : 'translateY(8px)' }} />
              </button>
              <div className="text-center text-[9px] tracking-[0.2em] font-bold text-[#8b7b65] mt-4">POWER</div>
            </div>

            <div className="absolute top-[16%] left-[30%] z-10 flex gap-8">
              <MatteKnob label="Input" value={input} onChange={setInput} size={55} />
              <MatteKnob label="Output" value={output} onChange={setOutput} size={55} />
            </div>

            <div className="absolute top-[52%] left-[50%] -translate-x-1/2 -translate-y-1/2">
              <BotanicalCenterDial drift={drift} setDrift={setDrift} spread={spread} setSpread={setSpread} rate={rate} />
            </div>

            <ModeSelectorEngine mode={mode} setMode={setMode} styleIndex={modeStyle} power={power} />

            <div className="absolute top-[38%] right-[10%] z-10 grid grid-cols-2 gap-x-6 gap-y-10 justify-items-center">
              <div className="relative">
                <MatteKnob label="Filter" value={character} onChange={setCharacter} size={50} labelColorOverride="text-white/90 drop-shadow-md" />
                <button onClick={() => setCharFilter(charFilter === 1 ? 0 : 1)} className="absolute -top-1 -right-3 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/30 text-[#edd39a] border border-white/10 hover:bg-black/50 transition-colors">
                  {charFilter === 1 ? '12dB' : '6dB'}
                </button>
              </div>
              <MatteKnob label="Sweeten" value={sweeten} onChange={setSweeten} size={50} labelColorOverride="text-white/90 drop-shadow-md" />
              <div className="relative">
                <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                  <HardwareLED active={power && biasHF > 20} color="coral" size={6} label="DRV" />
                </div>
                <MatteKnob label="Sat" value={biasHF} onChange={setBiasHF} size={45} labelColorOverride="text-white/90 drop-shadow-md" />
              </div>
              <MatteKnob label="Noise" value={noise} onChange={setNoise} size={45} labelColorOverride="text-white/90 drop-shadow-md" />
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
      <div className="hidden lg:flex flex-col items-center pt-16 gap-10 w-[240px] rounded-[3.5rem] border-[4px] border-white/80 shrink-0" style={{ height: '600px' }}>
        
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

        {/* Toggle Outputs */}
        <div className="w-full px-6 flex flex-col items-center gap-3 relative mt-4">
          <button 
            onClick={() => setShowOutputs(!showOutputs)}
            className={`w-14 h-8 rounded-full border-[3px] border-white/80 flex items-center px-0.5 transition-colors duration-300 ${showOutputs ? 'bg-white/20' : 'bg-transparent'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ${showOutputs ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className="text-white/90 text-[15px] font-medium tracking-wide">output cables</span>
        </div>

        {/* Toggle Cable Routing */}
        <div className="w-full px-6 flex flex-col items-center gap-3 relative mt-4">
          <button 
            onClick={() => setParallelCables(!parallelCables)}
            className={`w-14 h-8 rounded-full border-[3px] border-white/80 flex items-center px-0.5 transition-colors duration-300 ${parallelCables ? 'bg-white/20' : 'bg-transparent'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ${parallelCables ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className="text-white/90 text-[15px] font-medium tracking-wide text-center leading-tight">parallel routing</span>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
        body { overflow: hidden; touch-action: none; }
        input[type="range"] { -webkit-user-select: auto; user-select: auto; }
      `}} />
    </div>
  );
}
