import React from 'react';
import { motion } from 'framer-motion';

const handwrittenFonts = [
  "'Brush Script MT', cursive",
  "'Comic Sans MS', cursive",
  "'Segoe Print', cursive",
  "cursive"
];

export default function PolaroidGallery({ products }) {
  const handleClick = (productId) => {
    const element = document.getElementById(`product-${productId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {products.slice(0, 12).map((product, index) => {
        const randomRotation = (Math.random() - 0.5) * 45; // Increased rotation range
        const randomX = Math.random() * 75; // Wider X spread
        const randomY = Math.random() * 65; // Wider Y spread
        const randomFont = handwrittenFonts[index % handwrittenFonts.length];
        
        return (
          <motion.div
            key={product.id}
            className="absolute cursor-pointer"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
              transform: `rotate(${randomRotation}deg)`,
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
                  style={{ fontFamily: randomFont, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  {product.model_name}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}