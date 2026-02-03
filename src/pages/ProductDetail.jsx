import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Scale, Share2, Car, Home, Battery, 
  Utensils, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.size_category],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ size_category: product.size_category });
      return products.filter(p => p.id !== productId).slice(0, 4);
    },
    enabled: !!product?.size_category
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Product not found</h2>
          <Link to={createPageUrl('Home')}>
            <Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-6 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-gradient-to-br from-white to-slate-100 rounded-3xl p-8 md:p-12 aspect-square flex items-center justify-center sticky top-8">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-200 rounded-3xl flex items-center justify-center">
                  <span className="text-6xl font-bold text-slate-400">{product.brand?.[0]}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-slate-900 text-white">{product.size_category}</Badge>
                {product.is_featured && (
                  <Badge className="bg-violet-600 text-white">Featured</Badge>
                )}
              </div>
              <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">
                {product.base_vehicle?.brand} {product.base_vehicle?.model}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">{product.model_name}</h1>
            </div>

            <div className="flex flex-wrap gap-3">
              {product.top_features?.map((feature, i) => (
                <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700">{feature}</Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {product.buy_from_price && (
                <div>
                  <p className="text-sm text-slate-500">Buy from</p>
                  <p className="text-2xl font-bold text-slate-900">€{product.buy_from_price?.toLocaleString()}</p>
                </div>
              )}
              {product.rent_from_price && (
                <div>
                  <p className="text-sm text-slate-500">Rent from</p>
                  <p className="text-2xl font-bold text-emerald-600">€{product.rent_from_price}/day</p>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-slate-600 text-lg leading-relaxed">{product.description}</p>
            )}

            <div className="flex gap-3">
              <Link to={createPageUrl('Compare') + `?ids=${product.id}`} className="flex-1">
                <Button size="lg" className="w-full bg-violet-600 hover:bg-violet-700 rounded-full">
                  <Scale className="w-5 h-5 mr-2" /> Add to Compare
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-4">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Rental Companies */}
            {product.rental_companies?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Available at:</p>
                <div className="flex flex-wrap gap-2">
                  {product.rental_companies.map((company, i) => (
                    <Badge key={i} variant="outline" className="px-3 py-1">{company}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="vehicle" className="mt-8">
              <TabsList className="bg-slate-100 p-1">
                <TabsTrigger value="vehicle"><Car className="w-4 h-4 mr-1" /> Vehicle</TabsTrigger>
                <TabsTrigger value="camper"><Home className="w-4 h-4 mr-1" /> Camper</TabsTrigger>
                <TabsTrigger value="interior"><Utensils className="w-4 h-4 mr-1" /> Interior</TabsTrigger>
                <TabsTrigger value="energy"><Battery className="w-4 h-4 mr-1" /> Energy</TabsTrigger>
                <TabsTrigger value="features"><Smartphone className="w-4 h-4 mr-1" /> Features</TabsTrigger>
              </TabsList>

              <TabsContent value="vehicle" className="mt-6">
                <Card className="p-6 border-0 shadow-sm space-y-4">
                  {product.base_vehicle && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {product.base_vehicle.wltp_range_km && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">WLTP Range</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.wltp_range_km} km</p>
                          </div>
                        )}
                        {product.base_vehicle.battery_size_kwh && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Battery Size</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.battery_size_kwh} kWh</p>
                          </div>
                        )}
                        {product.base_vehicle.kw && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Engine Power</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.kw} kW</p>
                          </div>
                        )}
                        {product.base_vehicle.consumption_kwh_100km && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Consumption</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.consumption_kwh_100km} kWh/100km</p>
                          </div>
                        )}
                        {product.base_vehicle.charging_speed_dc_kw && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">DC Fast Charging</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.charging_speed_dc_kw} kW</p>
                          </div>
                        )}
                        {product.base_vehicle.weight_empty_kg && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Weight</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.weight_empty_kg} kg</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="camper" className="mt-6">
                <Card className="p-6 border-0 shadow-sm space-y-4">
                  {product.camper_data && (
                    <div className="grid grid-cols-2 gap-4">
                      {product.camper_data.length_m && (
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Length</p>
                          <p className="font-semibold text-slate-900">{product.camper_data.length_m} m</p>
                        </div>
                      )}
                      {product.camper_data.height_m && (
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Height</p>
                          <p className="font-semibold text-slate-900">{product.camper_data.height_m} m</p>
                        </div>
                      )}
                      {product.camper_data.seats && (
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Seats</p>
                          <p className="font-semibold text-slate-900">{product.camper_data.seats}</p>
                        </div>
                      )}
                      {product.sleeping?.sleeps && (
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Sleeps</p>
                          <p className="font-semibold text-slate-900">{product.sleeping.sleeps}</p>
                        </div>
                      )}
                      {product.camper_data.storage_total_l && (
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Storage</p>
                          <p className="font-semibold text-slate-900">{product.camper_data.storage_total_l} L</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="interior" className="mt-6">
                <Card className="p-6 border-0 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {product.kitchen?.fridge_l && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Fridge</p>
                        <p className="font-semibold text-slate-900">{product.kitchen.fridge_l} L</p>
                      </div>
                    )}
                    {product.kitchen?.stove_plates && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Stove Plates</p>
                        <p className="font-semibold text-slate-900">{product.kitchen.stove_plates}</p>
                      </div>
                    )}
                    {product.bathroom?.fresh_water_l && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Fresh Water</p>
                        <p className="font-semibold text-slate-900">{product.bathroom.fresh_water_l} L</p>
                      </div>
                    )}
                    {product.bathroom?.toilet_type && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Toilet</p>
                        <p className="font-semibold text-slate-900 capitalize">{product.bathroom.toilet_type}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="energy" className="mt-6">
                <Card className="p-6 border-0 shadow-sm space-y-4">
                  {product.energy && (
                    <div className="grid grid-cols-2 gap-4">
                      {product.energy.camping_battery_wh && (
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Camping Battery</p>
                          <p className="font-semibold text-slate-900">{product.energy.camping_battery_wh} Wh</p>
                        </div>
                      )}
                      {product.energy.solar_panel_max_w && (
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Solar Panel</p>
                          <p className="font-semibold text-slate-900">{product.energy.solar_panel_max_w} W</p>
                        </div>
                      )}
                      {product.energy.usb_c_plugs_livingroom && (
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">USB-C Ports</p>
                          <p className="font-semibold text-slate-900">{product.energy.usb_c_plugs_livingroom}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <Card className="p-6 border-0 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {product.climate?.ac && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">A/C</p>
                        <p className="font-semibold text-slate-900 capitalize">{product.climate.ac}</p>
                      </div>
                    )}
                    {product.smart_connected?.apple_carplay_android_auto && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">CarPlay/Auto</p>
                        <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.apple_carplay_android_auto}</p>
                      </div>
                    )}
                    {product.smart_connected?.rear_camera && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Rear Camera</p>
                        <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.rear_camera}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <Link key={p.id} to={createPageUrl('ProductDetail') + `?id=${p.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-0">
                    <div className="aspect-square bg-slate-100 p-4 flex items-center justify-center">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="max-h-full object-contain" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center">
                          <span className="text-2xl font-bold text-slate-400">{p.brand?.[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-slate-500">{p.base_vehicle?.brand} {p.base_vehicle?.model}</p>
                      <p className="font-medium text-slate-900 truncate">{p.model_name}</p>
                      {p.rent_from_price && (
                        <p className="font-bold text-emerald-600 mt-1">€{p.rent_from_price}/day</p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}