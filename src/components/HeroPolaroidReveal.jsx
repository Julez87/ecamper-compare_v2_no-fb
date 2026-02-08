import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, ArrowRight, PlusCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function HeroPolaroidRevealStyled({ onBrowseClick, onRequestClick, onPolaroidClick }) {
  const { data: products = [] } = useQuery({
    queryKey: ['products-hero'],
    queryFn: () => base44.entities.Product.list('-created_date', 12),
    initialData: [],
  });

  const photos = useMemo(() => {
    return products
      .filter(p => p.image_url)
      .slice(0, 12)
      .map(p => ({
        id: p.id,
        name: p.model_name,
        url: p.image_url
      }));
  }, [products]);

  // Grid-based layout: spread polaroids evenly, only overlap if not enough space
  const layout = useMemo(() => {
    const count = photos.length;
    if (count === 0) return [];

    const rand = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Determine grid dimensions based on count
    const cols = count <= 4 ? 2 : count <= 6 ? 3 : 4;
    const rows = Math.ceil(count / cols);

    const cellW = 100 / cols;
    const cellH = 100 / rows;

    return photos.map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Center of cell + small jitter
      const jitterX = (rand(i * 11.13 + 1) - 0.5) * cellW * 0.4;
      const jitterY = (rand(i * 7.77 + 2) - 0.5) * cellH * 0.4;
      const left = cellW * (col + 0.5) + jitterX;
      const top = cellH * (row + 0.5) + jitterY;

      const rot = (rand(i * 5.55 + 3) - 0.5) * 30; // -15..+15
      const size = 140 + rand(i * 9.21 + 4) * 80; // 140..220

      return {
        left: Math.max(4, Math.min(96, left)),
        top: Math.max(4, Math.min(96, top)),
        rot,
        size
      };
    });
  }, [photos]);

  const wrapRef = useRef(null);
  const rafRef = useRef(null);

  const [spot, setSpot] = useState({
    x: 0, y: 0, active: false, radius: 150,
  });

  const getLocalXY = (e) => {
    const el = wrapRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const scheduleSpotUpdate = (x, y) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setSpot((s) => ({ ...s, x, y }));
    });
  };

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Detect click on a polaroid by checking pointer position against layout
  const handleClick = (e) => {
    if (!onPolaroidClick || !wrapRef.current) return;
    const { x, y } = getLocalXY(e);
    const rect = wrapRef.current.getBoundingClientRect();
    const pxToPercX = (x / rect.width) * 100;
    const pxToPercY = (y / rect.height) * 100;

    // Find closest polaroid whose center is within its size radius
    for (let i = photos.length - 1; i >= 0; i--) {
      const l = layout[i];
      const halfW = (l.size / rect.width) * 100 / 2;
      const halfH = (l.size / rect.height) * 100 / 2;
      if (Math.abs(pxToPercX - l.left) < halfW * 1.2 && Math.abs(pxToPercY - l.top) < halfH * 1.2) {
        onPolaroidClick(photos[i].id);
        return;
      }
    }
  };

  const clip = spot.active
    ? `circle(${spot.radius}px at ${spot.x}px ${spot.y}px)`
    : `circle(0px at ${spot.x}px ${spot.y}px)`;

  if (photos.length === 0) return null;

  return (
    <section
      ref={wrapRef}
      className="relative w-full min-h-[80vh] overflow-hidden"
      style={{ touchAction: "none" }}
      onPointerEnter={(e) => { const { x, y } = getLocalXY(e); setSpot(s => ({ ...s, active: true, x, y })); }}
      onPointerMove={(e) => { const { x, y } = getLocalXY(e); scheduleSpotUpdate(x, y); }}
      onPointerLeave={() => setSpot(s => ({ ...s, active: false }))}
      onPointerDown={(e) => { const { x, y } = getLocalXY(e); setSpot(s => ({ ...s, active: true, x, y })); }}
      onPointerUp={(e) => {
        handleClick(e);
        setSpot(s => ({ ...s, active: false }));
      }}
      onPointerCancel={() => setSpot(s => ({ ...s, active: false }))}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900" />

      {/* Polaroids (blurred) */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <PolaroidField photos={photos} layout={layout} blurred />
      </div>

      {/* Polaroids (sharp) - spotlight */}
      <div className="absolute inset-0" style={{
        zIndex: 2, clipPath: clip, WebkitClipPath: clip,
        transition: spot.active ? "none" : "clip-path 220ms ease",
        willChange: "clip-path",
      }}>
        <PolaroidField photos={photos} layout={layout} blurred={false} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/45" />
        <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.55)]" />
      </div>

      {/* Hero content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-900/50 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-200">Compare Before You Buy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Find Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Electric Camper</span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto" style={{ textShadow: '0 0 8px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)' }}>
              Compare specs, prices, and features across electric camper vans. Make informed decisions with our comprehensive comparison tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button type="button" className="inline-flex items-center justify-center rounded-full px-8 h-12 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors" onClick={onBrowseClick}>
                Browse Campers <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button type="button" className="inline-flex items-center justify-center rounded-full px-8 h-12 font-semibold bg-white text-slate-700 border border-white/30 shadow-sm hover:bg-white/10 hover:text-white transition-colors" onClick={onRequestClick}>
                <PlusCircle className="w-5 h-5 mr-2" /> Request a Camper
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PolaroidField({ photos, layout, blurred }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nothing+You+Could+Do&display=swap');
        .polaroid-caption { font-family: "Nothing You Could Do", system-ui, sans-serif; }
      `}</style>
      <div className="absolute inset-0" style={{
        filter: blurred ? "blur(14px)" : "none",
        opacity: blurred ? 0.95 : 1,
        transform: "translateZ(0)",
        willChange: blurred ? "filter" : "auto",
      }} aria-hidden>
        {photos.map((p, i) => {
          const l = layout[i];
          return (
            <div key={`${p.name}-${i}-${blurred ? "b" : "s"}`} className="absolute select-none"
              style={{ left: `${l.left}%`, top: `${l.top}%`, transform: `translate(-50%, -50%) rotate(${l.rot}deg)`, width: `${l.size}px` }}>
              <div className="bg-white rounded-sm shadow-xl">
                <div className="p-3 pb-7">
                  <div className="aspect-square overflow-hidden bg-slate-200">
                    <img src={p.url} alt={p.name} className="h-full w-full object-cover" draggable={false} />
                  </div>
                </div>
                <div className="polaroid-caption px-4 pb-4 -mt-5 text-slate-800 text-base">{p.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}