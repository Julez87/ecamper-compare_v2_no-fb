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
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {products.slice(0, 12).map((product, index) => {
        const randomRotation = (Math.random() - 0.5) * 20;
        const randomX = Math.random() * 80 + 10;
        const randomY = Math.random() * 70 + 15;
        const randomFont = handwrittenFonts[index % handwrittenFonts.length];
        
        return (
          <motion.div
            key={product.id}
            className="absolute pointer-events-auto cursor-pointer"
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
            <div className="bg-white p-3 shadow-xl" style={{ width: '140px' }}>
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
              <p 
                className="text-center text-sm text-slate-800 truncate"
                style={{ fontFamily: randomFont }}
              >
                {product.model_name}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}