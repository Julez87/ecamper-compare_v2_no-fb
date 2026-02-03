import React from 'react';
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CompareBar({ compareList, onRemove, onClear }) {
  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Scale className="w-5 h-5 text-violet-600" />
              <span className="font-medium">Compare</span>
              <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-sm font-medium">
                {compareList.length}/4
              </span>
            </div>

            <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-2">
              {compareList.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-2 bg-slate-50 rounded-lg p-3 flex-shrink-0 relative"
                >
                  <button 
                    onClick={() => onRemove(product.id)}
                    className="absolute -top-1 -right-1 p-1 bg-white hover:bg-slate-100 rounded-full shadow-sm transition-colors border border-slate-200"
                  >
                    <X className="w-3 h-3 text-slate-500" />
                  </button>
                  {product.image_url ? (
                    <img src={product.image_url} alt="" className="w-16 h-16 object-cover rounded-full border-2 border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-400 border-2 border-slate-200">
                      {product.model_name?.[0] || product.brand?.[0]}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-700 max-w-[80px] truncate text-center">
                    {product.model_name?.replace(/^(VW|Mercedes|Fiat|Peugeot|Citroën|Ford|Renault)\s+/i, '') || product.name}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClear} className="text-slate-500">
                Clear all
              </Button>
              <Link to={createPageUrl('Compare') + `?ids=${compareList.map(p => p.id).join(',')}`}>
                <Button 
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6"
                  disabled={compareList.length < 2}
                >
                  Compare Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}