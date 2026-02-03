import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onCompare, isInCompare, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <Badge className="bg-slate-900 text-white text-xs font-medium px-2 py-0.5">
            {product.category}
          </Badge>
          {product.is_featured && (
            <Badge className="bg-violet-600 text-white text-xs font-medium px-2 py-0.5">
              Featured
            </Badge>
          )}
        </div>
        
        <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-slate-400">{product.brand?.[0]}</span>
            </div>
          )}
        </div>
        
        <div className="p-5">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
            {product.brand}
          </p>
          <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-slate-700">{product.rating}</span>
              </div>
            )}
            {product.release_year && (
              <span className="text-xs text-slate-400">• {product.release_year}</span>
            )}
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-slate-900">
                ${product.price?.toLocaleString()}
              </span>
            </div>
            
            <Button
              size="sm"
              variant={isInCompare ? "default" : "outline"}
              className={`rounded-full transition-all duration-200 ${
                isInCompare 
                  ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                  : 'border-slate-200 hover:border-violet-600 hover:text-violet-600'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onCompare(product);
              }}
            >
              {isInCompare ? (
                <><Check className="w-4 h-4 mr-1" /> Added</>
              ) : (
                <><Plus className="w-4 h-4 mr-1" /> Compare</>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}