import React, { useEffect, useMemo, useRef, useState } from "react";

export default function PolaroidGallery({ products }) {
  const photos = useMemo(
    () =>
      products.slice(0, 12).map((p) => ({
        name: p.model_name,
        url: p.image_url || "https://via.placeholder.com/900?text=🚐",
      })),
    [products]
  );

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

      const left = 6 + r1 * 88;
      const top = 10 + r2 * 80;
      const rot = -22 + r3 * 44;
      const size = 150 + r4 * 110;

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

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
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

      <div className="absolute inset-0">
        <PolaroidField photos={photos} layout={layout} blurred />
      </div>
    </div>
  );
}

function PolaroidField({ photos, layout, blurred }) {
  return (
    <>
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