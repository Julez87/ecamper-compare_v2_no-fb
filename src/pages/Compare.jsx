import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, X, Star, Check, Trophy, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SPEC_LABELS = {
  display_size: 'Display Size',
  storage: 'Storage',
  ram: 'RAM',
  battery_life: 'Battery Life',
  processor: 'Processor',
  connectivity: 'Connectivity',
  weight: 'Weight'
};

export default function Compare() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialIds = urlParams.get('ids')?.split(',').filter(Boolean) || [];
  
  const [selectedIds, setSelectedIds] = useState(initialIds);

  const { data: allProducts = [] } = useQuery({
    queryKey: ['allProducts'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: compareProducts = [], isLoading } = useQuery({
    queryKey: ['compareProducts', selectedIds],
    queryFn: async () => {
      if (selectedIds.length === 0) return [];
      const results = await Promise.all(
        selectedIds.map(id => base44.entities.Product.filter({ id }))
      );
      return results.flat();
    },
    enabled: selectedIds.length > 0
  });

  const addProduct = (productId) => {
    if (selectedIds.length < 4 && !selectedIds.includes(productId)) {
      const newIds = [...selectedIds, productId];
      setSelectedIds(newIds);
      window.history.replaceState(null, '', `${createPageUrl('Compare')}?ids=${newIds.join(',')}`);
    }
  };

  const removeProduct = (productId) => {
    const newIds = selectedIds.filter(id => id !== productId);
    setSelectedIds(newIds);
    window.history.replaceState(null, '', newIds.length > 0 ? `${createPageUrl('Compare')}?ids=${newIds.join(',')}` : createPageUrl('Compare'));
  };

  const availableProducts = allProducts.filter(p => !selectedIds.includes(p.id));

  const getBestValue = (key) => {
    if (compareProducts.length < 2) return null;
    
    const values = compareProducts.map(p => {
      if (key === 'price') return p.price;
      if (key === 'rating') return p.rating;
      return p.specs?.[key];
    });

    if (key === 'price') {
      const min = Math.min(...values.filter(v => v != null));
      return compareProducts.find(p => p.price === min)?.id;
    }
    if (key === 'rating') {
      const max = Math.max(...values.filter(v => v != null));
      return compareProducts.find(p => p.rating === max)?.id;
    }
    return null;
  };

  const emptySlots = Math.max(0, 2 - compareProducts.length);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="mb-2 text-slate-600 hover:text-slate-900 -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Scale className="w-8 h-8 text-violet-600" />
              Compare Products
            </h1>
            <p className="text-slate-600 mt-1">Compare up to 4 products side by side</p>
          </div>
        </div>

        {/* Product Selector */}
        {selectedIds.length < 4 && (
          <Card className="p-4 mb-8 border-0 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">Add product:</span>
              <Select onValueChange={addProduct}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.brand} {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-500">
                {selectedIds.length}/4 products selected
              </span>
            </div>
          </Card>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-4 min-w-full pb-4">
            <AnimatePresence mode="popLayout">
              {compareProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-72 flex-shrink-0"
                >
                  <Card className="border-0 shadow-sm overflow-hidden">
                    {/* Product Header */}
                    <div className="relative bg-gradient-to-br from-white to-slate-100 p-6">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <div className="aspect-square flex items-center justify-center mb-4">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="max-h-32 object-contain"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center">
                            <span className="text-3xl font-bold text-slate-400">{product.brand?.[0]}</span>
                          </div>
                        )}
                      </div>

                      <Badge className="bg-slate-900 text-white text-xs mb-2">{product.category}</Badge>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{product.brand}</p>
                      <h3 className="font-semibold text-slate-900 text-lg leading-tight">{product.name}</h3>
                    </div>

                    {/* Specs */}
                    <div className="divide-y divide-slate-100">
                      {/* Price */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('price') === product.id ? 'bg-green-50' : ''}`}>
                        <span className="text-sm text-slate-600">Price</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-slate-900">${product.price?.toLocaleString()}</span>
                          {getBestValue('price') === product.id && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('rating') === product.id ? 'bg-green-50' : ''}`}>
                        <span className="text-sm text-slate-600">Rating</span>
                        <div className="flex items-center gap-2">
                          {product.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-slate-900">{product.rating}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          {getBestValue('rating') === product.id && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Release Year */}
                      <div className="p-4 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Release Year</span>
                        <span className="font-medium text-slate-900">{product.release_year || '—'}</span>
                      </div>

                      {/* Specs */}
                      {Object.entries(SPEC_LABELS).map(([key, label]) => (
                        <div key={key} className="p-4 flex justify-between items-center">
                          <span className="text-sm text-slate-600">{label}</span>
                          <span className="font-medium text-slate-900 text-right">
                            {product.specs?.[key] || '—'}
                          </span>
                        </div>
                      ))}

                      {/* Pros */}
                      <div className="p-4">
                        <span className="text-sm text-slate-600 block mb-2">Pros</span>
                        {product.pros?.length > 0 ? (
                          <ul className="space-y-1">
                            {product.pros.slice(0, 3).map((pro, i) => (
                              <li key={i} className="text-sm flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </div>

                      {/* Cons */}
                      <div className="p-4">
                        <span className="text-sm text-slate-600 block mb-2">Cons</span>
                        {product.cons?.length > 0 ? (
                          <ul className="space-y-1">
                            {product.cons.slice(0, 3).map((con, i) => (
                              <li key={i} className="text-sm flex items-start gap-1.5">
                                <X className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">{con}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50">
                      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
                        <Button variant="outline" className="w-full">View Details</Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Empty Slots */}
              {[...Array(Math.max(0, Math.min(emptySlots, 4 - compareProducts.length)))].map((_, i) => (
                <motion.div
                  key={`empty-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-72 flex-shrink-0"
                >
                  <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 h-full min-h-[500px] flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium mb-2">Add a product</p>
                      <p className="text-sm text-slate-400">Select from the dropdown above</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {compareProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scale className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">No products to compare</h2>
            <p className="text-slate-600 mb-6">Add products using the dropdown above or browse our catalog</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-violet-600 hover:bg-violet-700">Browse Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}