import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, ArrowRight, PlusCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function HeroPolaroidRevealStyled({ onBrowseClick, onRequestClick }) {
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
        name: p.model_name,
        url: p.image_url
      }));
  }, [products]);

  // Stable pseudo-random layout (doesn't change on rerender)
  const layout = useMemo(() => {
    const rand = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return photos.map((_, i) => {
      const r1 = rand(i * 11.13 + 1);
      const r2 = rand(i * 7.77 + 2);
      const r3 = rand(i * 5.55 + 3);
      const r4 = rand(i * 9.21 + 4);

      // Keep inside bounds (and leave center a bit clearer for the hero text)
      const left = 6 + r1 * 88; // 6..94
      const top = 10 + r2 * 80; // 10..90
      const rot = -22 + r3 * 44; // -22..+22
      const size = 150 + r4 * 110; // 150..260

      // Slightly push some cards away from the very center
      const centerPullX = left > 40 && left < 60 ? (left < 50 ? -10 : 10) : 0;
      const centerPullY = top > 35 && top < 65 ? (top < 50 ? -8 : 8) : 0;

      return { left: left + centerPullX, top: top + centerPullY, rot, size };
    });
  }, [photos]);

  const wrapRef = useRef(null);
  const rafRef = useRef(null);

  const [spot, setSpot] = useState({
    x: 0,
    y: 0,
    active: false,
    radius: 150,
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
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const clip = spot.active
    ? `circle(${spot.radius}px at ${spot.x}px ${spot.y}px)`
    : `circle(0px at ${spot.x}px ${spot.y}px)`;

  if (photos.length === 0) return null;

  return (
    <section
      ref={wrapRef}
      className="relative w-full min-h-[80vh] overflow-hidden"
      style={{ touchAction: "none" }}
      onPointerEnter={(e) => {
        const { x, y } = getLocalXY(e);
        setSpot((s) => ({ ...s, active: true, x, y }));
      }}
      onPointerMove={(e) => {
        const { x, y } = getLocalXY(e);
        scheduleSpotUpdate(x, y);
      }}
      onPointerLeave={() => setSpot((s) => ({ ...s, active: false }))}
      onPointerDown={(e) => {
        const { x, y } = getLocalXY(e);
        setSpot((s) => ({ ...s, active: true, x, y }));
      }}
      onPointerUp={() => setSpot((s) => ({ ...s, active: false }))}
      onPointerCancel={() => setSpot((s) => ({ ...s, active: false }))}
    >
      {/* Background gradient like your screenshot */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900" />

      {/* Polaroids (sharp) - ONLY visible through spotlight */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: clip,
          WebkitClipPath: clip,
          transition: spot.active ? "none" : "clip-path 220ms ease",
          willChange: "clip-path",
        }}
      >
        <PolaroidField photos={photos} layout={layout} blurred={false} />
      </div>

      {/* Polaroids (blurred) - ALWAYS visible */}
      <div className="absolute inset-0">
        <PolaroidField photos={photos} layout={layout} blurred />
      </div>

      {/* Vignette / depth like screenshot */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/45" />
        <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.55)]" />
      </div>

      {/* HERO CONTENT (top layer) — matches screenshot */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-200">
                Compare Before You Buy
              </span>
            </div>

            {/* headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Find Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Electric Camper
              </span>
            </h1>

            {/* subcopy */}
            <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
              Compare specs, prices, and features across electric camper vans. Make
              informed decisions with our comprehensive comparison tool.
            </p>

            {/* buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full px-8 h-12 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                onClick={onBrowseClick}
              >
                Browse Campers <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full px-8 h-12 font-semibold
                           bg-white text-slate-700 border border-white/30 shadow-sm
                           hover:bg-white/10 hover:text-white transition-colors"
                onClick={onRequestClick}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Request a Camper
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
      {/* Google font (polaroid captions only) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nothing+You+Could+Do&display=swap');
        .polaroid-caption {
          font-family: "Nothing You Could Do", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          filter: blurred ? "blur(14px)" : "none",
          opacity: blurred ? 0.95 : 1,
          transform: "translateZ(0)",
          willChange: blurred ? "filter" : "auto",
        }}
        aria-hidden
      >
        {photos.map((p, i) => {
          const l = layout[i];

          return (
            <div
              key={`${p.name}-${i}-${blurred ? "b" : "s"}`}
              className="absolute select-none"
              style={{
                left: `${l.left}%`,
                top: `${l.top}%`,
                transform: `translate(-50%, -50%) rotate(${l.rot}deg)`,
                width: `${l.size}px`,
              }}
            >
              <div className="bg-white rounded-sm shadow-xl">
                {/* Polaroid frame */}
                <div className="p-3 pb-7">
                  <div className="aspect-square overflow-hidden bg-slate-200">
                    <img
                      src={p.url}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Handwritten caption */}
                <div className="polaroid-caption px-4 pb-4 -mt-5 text-slate-800 text-base">
                  {p.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}