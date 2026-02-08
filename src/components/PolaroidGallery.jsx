import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function PolaroidGallery({ products }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Calculate positions once and reuse for both layers
  const positions = useMemo(() => {
    return products.slice(0, 12).map((_, index) => ({
      rotation: (Math.random() - 0.5) * 45,
      x: Math.random() * 75,
      y: Math.random() * 65
    }));
  }, [products]);

  const handleClick = (productId) => {
    const element = document.getElementById(`product-${productId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const renderPolaroids = (blurred = false) => {
    return products.slice(0, 12).map((product, index) => {
      const pos = positions[index];
      
      return (
        <motion.div
          key={`${product.id}-${blurred ? 'blur' : 'clear'}`}
          className="absolute cursor-pointer"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `rotate(${pos.rotation}deg)`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ 
            scale: 1.3, 
            rotate: 0, 
            zIndex: 50,
            transition: { duration: 0.3 }
          }}
          onClick={() => handleClick(product.id)}
        >
          <div className="bg-white p-3 shadow-xl hover:shadow-2xl transition-shadow" style={{ width: '140px' }}>
            <div className="aspect-square bg-slate-100 mb-2 overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.model_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <span className="text-4xl">🚐</span>
                </div>
              )}
            </div>
            <div className="relative">
              <p 
                className="text-center text-sm font-semibold text-slate-900 truncate bg-white/90 backdrop-blur-sm px-2 py-1 rounded"
                style={{ 
                  fontFamily: "'Nothing You Could Do', cursive",
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)' 
                }}
              >
                {product.model_name}
              </p>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nothing+You+Could+Do&display=swap" rel="stylesheet" />
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        onMouseMove={handleMouseMove}
        style={{ position: 'relative' }}
      >
      {/* Blurred layer */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ filter: 'blur(8px)' }}
      >
        {renderPolaroids(true)}
      </div>

      {/* Clear layer with mask */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          maskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`,
        }}
      >
        <div className="pointer-events-auto">
          {renderPolaroids(false)}
        </div>
      </div>
      </div>
    </>
  );
}