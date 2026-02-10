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
import { ArrowLeft, Plus, X, Trophy, Scale, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackTrigger from '@/components/feedback/FeedbackTrigger';
import FeedbackModal from '@/components/feedback/FeedbackModal';

export default function Compare() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialIds = urlParams.get('ids')?.split(',').filter(Boolean) || [];
  
  const [selectedIds, setSelectedIds] = useState(initialIds);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSentiment, setFeedbackSentiment] = useState(null);

  const openFeedback = (sentiment, topic) => {
    setFeedbackSentiment(sentiment);
    setFeedbackOpen(true);
  };

  const { data: allProducts = [] } = useQuery({
    queryKey: ['allProducts'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: allCompanies = [] } = useQuery({
    queryKey: ['rentalCompanies'],
    queryFn: () => base44.entities.RentalCompany.list()
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

  const availableProducts = allProducts
    .filter(p => p.released === true && !selectedIds.includes(p.id))
    .sort((a, b) => (a.model_name || '').localeCompare(b.model_name || ''));

  const getBestValue = (key, higherIsBetter = true) => {
    if (compareProducts.length < 2) return [];
    
    let values = [];
    compareProducts.forEach(p => {
      let value = null;
      if (key === 'buy_from_price') value = p.buy_from_price;
      else if (key === 'rent_from_price') {
        const prices = allCompanies
          .flatMap((company) => company.available_campers || [])
          .filter((c) => c.camper_id === p.id)
          .map((c) => c.rent_price)
          .filter((pr) => pr != null);
        value = prices.length > 0 ? Math.min(...prices) : null;
      }
      else if (key === 'actual_range_km') value = p.camper_data?.camper_range_km;
      else if (key === 'seats') value = p.camper_data?.seats;
      else if (key === 'sleeps') value = p.sleeping?.sleeps;
      else if (key === 'solar_panel_max_w') value = p.energy?.solar_panel_max_w;
      else if (key === 'camping_battery_wh') value = p.energy?.camping_battery_wh;
      else if (key === 'fridge_l') value = p.kitchen?.fridge_l;
      else if (key === 'stove_plates') value = p.kitchen?.stove_plates;
      else if (key === 'fresh_water_l') value = p.bathroom?.fresh_water_l;
      else if (key === 'eco_tags') {
        value = 0;
        if (p.kitchen?.fridge_type === 'electric') value++;
        if (p.kitchen?.stove_type === 'electric') value++;
        if (p.climate?.vehicle_heating === 'electric') value++;
        if (p.climate?.stand_heating === 'electric') value++;
        if (p.climate?.vehicle_cooling === 'electric') value++;
        if (p.energy?.solar_panel_available === 'yes') value++;
        if (p.climate?.seat_heating === 'yes') value++;
        if (p.climate?.steering_wheel_heating === 'yes') value++;
        if (p.eco_scoring?.furniture_materials_eco) value++;
        if (p.eco_scoring?.flooring_material_eco) value++;
        if (p.eco_scoring?.insulation_material_eco) value++;
        if (p.eco_scoring?.textile_material_eco) value++;
        if (p.bathroom?.toilet_type === 'separation') value++;
      }
      values.push({ id: p.id, value });
    });

    const validValues = values.filter(v => v.value != null).map(v => v.value);
    if (validValues.length === 0) return [];

    const target = higherIsBetter ? Math.max(...validValues) : Math.min(...validValues);
    const allEqualTarget = validValues.every(v => v === target);
    if (allEqualTarget) return [];
    
    return values.filter(v => v.value === target).map(v => v.id);
  };

  const getHighlights = (product) => {
    const highlights = [];
    
    // Gas-Free
    const isGasFree = 
      product.kitchen?.stove_type !== 'gas' && 
      product.climate?.vehicle_heating !== 'gas' &&
      product.climate?.stand_heating !== 'gas';
    if (isGasFree) highlights.push('Gas-Free');
    
    // Eco Materials
    const hasEcoMaterials = 
      product.eco_scoring?.furniture_materials_eco ||
      product.eco_scoring?.flooring_material_eco ||
      product.eco_scoring?.insulation_material_eco ||
      product.eco_scoring?.textile_material_eco;
    if (hasEcoMaterials) highlights.push('Eco Materials');
    
    // Family Friendly
    if ((product.sleeping?.sleeps || 0) >= 4 && (product.camper_data?.seats || 0) >= 4) {
      highlights.push('Family Friendly');
    }
    
    // Off-Grid
    if (product.energy?.solar_panel_available === 'yes' && 
        (product.energy?.camping_battery_wh || 0) >= 1000) {
      highlights.push('Off-Grid');
    }
    
    // Winter Ready
    if ((product.climate?.stand_heating === 'electric' || product.climate?.stand_heating === 'gas') &&
        product.climate?.insulation === 'yes') {
      highlights.push('Winter Ready');
    }
    
    return highlights;
  };

  const getEcoTagCount = (product) => {
    let count = 0;
    if (product.kitchen?.fridge_type === 'electric') count++;
    if (product.kitchen?.stove_type === 'electric') count++;
    if (product.climate?.vehicle_heating === 'electric') count++;
    if (product.climate?.stand_heating === 'electric') count++;
    if (product.climate?.vehicle_cooling === 'electric') count++;
    if (product.energy?.solar_panel_available === 'yes') count++;
    if (product.climate?.seat_heating === 'yes') count++;
    if (product.climate?.steering_wheel_heating === 'yes') count++;
    if (product.eco_scoring?.furniture_materials_eco) count++;
    if (product.eco_scoring?.flooring_material_eco) count++;
    if (product.eco_scoring?.insulation_material_eco) count++;
    if (product.eco_scoring?.textile_material_eco) count++;
    if (product.bathroom?.toilet_type === 'separation') count++;
    return count;
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
                      {p.model_name}
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

                      <div className="min-h-[120px]">
                        <Badge className="bg-slate-900 text-white text-xs mb-2">{product.size_category}</Badge>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                          {product.base_vehicle?.brand} {product.base_vehicle?.model}
                        </p>
                        <h3 className="font-semibold text-slate-900 text-lg leading-tight">{product.model_name}</h3>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="divide-y divide-slate-100">
                      {/* Buy Price */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('buy_from_price', false).includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Buy Price</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {product.buy_from_price ? `€${product.buy_from_price.toLocaleString()}` : '—'}
                          </span>
                          {getBestValue('buy_from_price', false).includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Rent Price */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('rent_from_price', false).includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Rent per Day</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">
                            {(() => {
                              const prices = allCompanies
                                .flatMap((company) => company.available_campers || [])
                                .filter((c) => c.camper_id === product.id)
                                .map((c) => c.rent_price)
                                .filter((p) => p != null);
                              return prices.length > 0 ? `€${Math.min(...prices)}` : '—';
                            })()}
                          </span>
                          {getBestValue('rent_from_price', false).includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Actual Range */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('actual_range_km').includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Actual Range</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {product.camper_data?.camper_range_km ? `${product.camper_data.camper_range_km} km` : '—'}
                          </span>
                          {getBestValue('actual_range_km').includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Seats */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('seats').includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Seats</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{product.camper_data?.seats || '—'}</span>
                          {getBestValue('seats').includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Sleeps */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('sleeps').includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Sleeps</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{product.sleeping?.sleeps || '—'}</span>
                          {getBestValue('sleeps').includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Solar Panel */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('solar_panel_max_w').includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Solar Panel</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {product.energy?.solar_panel_max_w ? `${product.energy.solar_panel_max_w} W` : '—'}
                          </span>
                          {getBestValue('solar_panel_max_w').includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Camping Battery */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('camping_battery_wh').includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Camping Battery</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {product.energy?.camping_battery_wh ? `${product.energy.camping_battery_wh} Wh` : '—'}
                          </span>
                          {getBestValue('camping_battery_wh').includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Fridge */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('fridge_l').includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Fridge Size</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {product.kitchen?.fridge_l ? `${product.kitchen.fridge_l} L` : '—'}
                          </span>
                          {getBestValue('fridge_l').includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Amount Stoves */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('stove_plates').includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Amount Stoves</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{product.kitchen?.stove_plates || '—'}</span>
                          {getBestValue('stove_plates').includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Fresh Water */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('fresh_water_l').includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Fresh Water</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {product.bathroom?.fresh_water_l ? `${product.bathroom.fresh_water_l} L` : '—'}
                          </span>
                          {getBestValue('fresh_water_l').includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Eco-Tags */}
                      <div className={`p-4 flex justify-between items-center ${getBestValue('eco_tags').includes(product.id) ? 'bg-emerald-100' : ''}`}>
                        <span className="text-sm text-slate-600">Eco-Tags</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{getEcoTagCount(product)}</span>
                          {getBestValue('eco_tags').includes(product.id) && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="p-4">
                        <span className="text-sm text-slate-600 block mb-2">Highlights</span>
                        {getHighlights(product).length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {getHighlights(product).map((highlight, i) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
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
        {/* Feedback at bottom */}
        <div className="flex justify-center pt-12 pb-4">
          <FeedbackTrigger topic="Comparison" onOpen={openFeedback} />
        </div>
      </div>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        sentiment={feedbackSentiment}
        defaultTopic="Comparison"
      />
    </div>
  );
}