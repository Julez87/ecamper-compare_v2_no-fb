import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Check, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const RENTAL_COLORS = {
  "Roadsurfer": "bg-orange-600 hover:bg-orange-700",
  "Indie Campers": "bg-blue-600 hover:bg-blue-700",
  "Campanda": "bg-green-600 hover:bg-green-700",
  "McRent": "bg-red-600 hover:bg-red-700",
  "Outbase": "bg-purple-600 hover:bg-purple-700",
  "Tonke": "bg-teal-600 hover:bg-teal-700",
  "Ventje": "bg-indigo-600 hover:bg-indigo-700"
};

export default function ProductCard({ product, onCompare, isInCompare, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
        onClick={onClick}
      >
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <Badge className="bg-emerald-600 text-white text-xs font-medium px-2 py-0.5">
            {product.size_category || 'Camper Van'}
          </Badge>
          {product.is_featured && (
            <Badge className="bg-violet-600 text-white text-xs font-medium px-2 py-0.5">
              Featured
            </Badge>
          )}
        </div>
        
        <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.model_name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200">
              <span className="text-4xl font-bold text-slate-400">🚐</span>
            </div>
          )}
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">
            {product.base_vehicle?.brand || 'Electric Camper'}
          </p>
          <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-3 line-clamp-2">
            {product.model_name}
          </h3>
          
          {/* Top Features Pills */}
          {product.top_features?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.top_features.slice(0, 5).map((feature, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                  <Award className="w-3 h-3" /> {feature}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="space-y-2 mb-4 mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500">Buy from</span>
              <span className="text-xl font-bold text-slate-900">
                €{product.buy_from_price?.toLocaleString() || '—'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500">Rent from</span>
              <span className="text-lg font-semibold text-emerald-600">
                €{product.rent_from_price?.toLocaleString() || '—'}/day
              </span>
            </div>
          </div>
          
          {/* Rental Companies */}
          {product.rental_companies?.length > 0 && (
            <div className="space-y-2 mb-4 pt-3 border-t">
              <p className="text-xs text-slate-500 font-medium">Available at:</p>
              <div className="flex flex-wrap gap-2">
                {product.rental_companies.map((company, i) => (
                  <button
                    key={i}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs text-white px-3 py-1.5 rounded-full font-medium transition-colors ${RENTAL_COLORS[company] || 'bg-slate-600 hover:bg-slate-700'}`}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <Button
            size="sm"
            variant={isInCompare ? "default" : "outline"}
            className={`w-full rounded-full transition-all duration-200 ${
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
      </Card>
    </motion.div>
  );
}