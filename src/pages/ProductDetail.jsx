import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Scale, Share2, Car, Home, Battery,
  Utensils, Smartphone, Zap, Sofa, Sparkles } from
'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.search);
  const productId = urlParams.get('id');

  useEffect(() => {
    if (productId) {
      queryClient.invalidateQueries(['product', productId]);
    }
  }, [productId, queryClient]);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.size_category, productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ size_category: product.size_category });
      return products.filter((p) => p.id !== productId).slice(0, 4);
    },
    enabled: !!product?.size_category
  });

  const { data: allCompanies = [] } = useQuery({
    queryKey: ['rentalCompanies'],
    queryFn: () => base44.entities.RentalCompany.list()
  });

  // Get rental companies offering this product
  const rentalCompanies = allCompanies.filter((company) =>
    (company.available_campers || []).some((c) => c.camper_id === product?.id)
  );

  // Calculate minimum rent price from rental companies
  const rentPrice = (() => {
    if (!product) return null;
    const prices = allCompanies
      .flatMap((company) => company.available_campers || [])
      .filter((c) => c.camper_id === product.id)
      .map((c) => c.rent_price)
      .filter((p) => p != null);
    return prices.length > 0 ? Math.min(...prices) : null;
  })();

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
      </div>);

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
      </div>);

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

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}>

            <div className="bg-gradient-to-br from-white to-slate-100 rounded-3xl p-8 md:p-12 aspect-square flex items-center justify-center sticky top-8">
              {product.image_url ?
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-full max-w-full object-contain" /> :


              <div className="w-48 h-48 bg-slate-200 rounded-3xl flex items-center justify-center">
                  <span className="text-6xl font-bold text-slate-400">{product.brand?.[0]}</span>
                </div>
              }
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-slate-900 text-white">{product.size_category}</Badge>
                {product.is_featured &&
                <Badge className="bg-violet-600 text-white">Featured</Badge>
                }
              </div>
              <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">
                {product.base_vehicle?.brand} {product.base_vehicle?.model}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">{product.model_name}</h1>
            </div>

            <div className="flex flex-wrap gap-3">
              {product.top_features?.map((feature, i) =>
              <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700">{feature}</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {product.buy_from_price &&
              <div>
                  <p className="text-sm text-slate-500">Buy Price from</p>
                  <p className="text-2xl font-bold text-slate-900">€{product.buy_from_price?.toLocaleString()}</p>
                </div>
              }
              {rentPrice &&
              <div>
                  <p className="text-sm text-slate-500">Rent Price from</p>
                  <p className="text-2xl font-bold text-emerald-600">€{rentPrice}/day</p>
                </div>
              }
            </div>

            {product.description &&
            <p className="text-slate-600 text-lg leading-relaxed">{product.description}</p>
            }

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
            {rentalCompanies.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Available at:</p>
                <div className="flex flex-wrap gap-2">
                  {rentalCompanies.map((company) => {
                    const camperData = company.available_campers?.find((c) => c.camper_id === product.id);
                    return (
                      <a
                        key={company.id}
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white hover:shadow-md transition-all group"
                        style={{ borderColor: company.color + '40' }}
                      >
                        {company.logo_url && (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                          {company.name}
                        </span>
                        {camperData?.rent_price && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: company.color + '20', color: company.color }}
                          >
                            €{camperData.rent_price}/day
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Tabs - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>

          <Tabs defaultValue="baseVehicle" className="w-full">
              <TabsList className="bg-slate-100 p-1 grid grid-cols-5">
                <TabsTrigger value="baseVehicle"><Car className="w-4 h-4 mr-1" /> Base Vehicle</TabsTrigger>
                <TabsTrigger value="camperDetails"><Home className="w-4 h-4 mr-1" /> Camper</TabsTrigger>
                <TabsTrigger value="interiorDetails"><Sofa className="w-4 h-4 mr-1" /> Interior</TabsTrigger>
                <TabsTrigger value="energy"><Battery className="w-4 h-4 mr-1" /> Energy</TabsTrigger>
                <TabsTrigger value="features"><Sparkles className="w-4 h-4 mr-1" /> Comfort</TabsTrigger>
              </TabsList>

              <TabsContent value="baseVehicle" className="mt-6">
                <Card className="p-6 border-0 shadow-sm space-y-4">
                  {product.base_vehicle &&
                <>
                      <div className="grid grid-cols-2 gap-4">
                        {product.base_vehicle.brand &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Brand</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.brand}</p>
                          </div>
                    }
                        {product.base_vehicle.model &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Model</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.model}</p>
                          </div>
                    }
                        {product.base_vehicle.version &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Version</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.version}</p>
                          </div>
                    }
                        {product.base_vehicle.model_year &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Model Year</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.model_year}</p>
                          </div>
                    }
                        {product.base_vehicle.wltp_range_km &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">WLTP Range</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.wltp_range_km} km</p>
                          </div>
                    }
                        {product.base_vehicle.battery_size_kwh &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Battery Size</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.battery_size_kwh} kWh</p>
                          </div>
                    }
                        {product.base_vehicle.kw &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Engine Power</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.kw} kW</p>
                          </div>
                    }
                        {product.base_vehicle.consumption_kwh_100km &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Consumption</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.consumption_kwh_100km} kWh/100km</p>
                          </div>
                    }
                        {product.base_vehicle.charging_speed_ac_kw &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">AC Slow-Charge (max. kW)</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.charging_speed_ac_kw} kW</p>
                          </div>
                    }
                        {product.base_vehicle.charging_speed_dc_kw &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">DC Fast-Charge (max. kW)</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.charging_speed_dc_kw} kW</p>
                          </div>
                    }
                        {product.base_vehicle.charger_types &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Charger Types</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.charger_types}</p>
                          </div>
                    }
                        {product.base_vehicle.dc_fast_charging_20_80_min &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">DC Fast-Charging 20-80%</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.dc_fast_charging_20_80_min} min</p>
                          </div>
                    }
                        {product.base_vehicle.dc_fast_charging_10_80_min &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">DC Fast-Charging 10-80%</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.dc_fast_charging_10_80_min} min</p>
                          </div>
                    }
                        {product.base_vehicle.dc_fast_charging_10_90_min &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">DC Fast-Charging 10-90%</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.dc_fast_charging_10_90_min} min</p>
                          </div>
                    }
                        {product.base_vehicle.max_speed_kmh &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Max. Speed</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.max_speed_kmh} km/h</p>
                          </div>
                    }
                        {product.base_vehicle.turning_circle_m &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Turning circle</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.turning_circle_m} m</p>
                          </div>
                    }
                        {product.base_vehicle.ac_slow_charging_min &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">AC Slow-Charging</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.ac_slow_charging_min} min</p>
                          </div>
                    }
                        {product.base_vehicle.drive &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Drive</p>
                            <p className="font-semibold text-slate-900 capitalize">{product.base_vehicle.drive}</p>
                          </div>
                    }
                        {product.base_vehicle.weight_empty_kg &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Empty Weight</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.weight_empty_kg} kg</p>
                          </div>
                    }
                        {product.base_vehicle.max_additional_weight_kg &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Max Additional Weight</p>
                            <p className="font-semibold text-slate-900">{product.base_vehicle.max_additional_weight_kg} kg</p>
                          </div>
                    }
                        {product.base_vehicle.b_license_approved &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">B-License (3.5t)</p>
                            <p className="font-semibold text-slate-900 capitalize">{product.base_vehicle.b_license_approved}</p>
                          </div>
                    }
                        {product.extras?.sliding_doors &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Sliding Doors</p>
                            <p className="font-semibold text-slate-900 capitalize">{product.extras.sliding_doors}</p>
                          </div>
                    }
                        {product.extras?.backdoor &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Backdoor</p>
                            <p className="font-semibold text-slate-900 capitalize">{product.extras.backdoor}</p>
                          </div>
                    }
                        {product.extras?.trailer_hitch &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Trailer Hitch</p>
                            <p className="font-semibold text-slate-900 capitalize">{product.extras.trailer_hitch}</p>
                          </div>
                    }
                      </div>
                    </>
                }
                </Card>
              </TabsContent>

              <TabsContent value="camperDetails" className="mt-6">
                <Card className="p-6 border-0 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {product.camper_data?.camper_range_km &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Range (realistic)</p>
                        <p className="font-semibold text-slate-900">{product.camper_data.camper_range_km} km</p>
                      </div>
                  }
                    {product.camper_data?.length_mm &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Length</p>
                        <p className="font-semibold text-slate-900">{product.camper_data.length_mm} mm</p>
                      </div>
                  }
                    {product.camper_data?.height_mm &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Height</p>
                        <p className="font-semibold text-slate-900">{product.camper_data.height_mm} mm</p>
                      </div>
                  }
                    {product.camper_data?.width_mm &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Max. width</p>
                        <p className="font-semibold text-slate-900">{product.camper_data.width_mm} mm</p>
                      </div>
                  }
                    {product.camper_data?.seats &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Seats</p>
                        <p className="font-semibold text-slate-900">{product.camper_data.seats} persons</p>
                      </div>
                  }
                    {product.camper_data?.storage_total_l &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Total Storage</p>
                        <p className="font-semibold text-slate-900">{product.camper_data.storage_total_l} L</p>
                      </div>
                  }
                    {product.camper_data?.storage_shelves_l &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Shelf Storage</p>
                        <p className="font-semibold text-slate-900">{product.camper_data.storage_shelves_l} L</p>
                      </div>
                  }
                    {product.camper_data?.storage_trunk_l &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Trunk Storage</p>
                        <p className="font-semibold text-slate-900">{product.camper_data.storage_trunk_l} L</p>
                      </div>
                  }
                    {product.camper_data?.storage_other_l &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Other Storage</p>
                        <p className="font-semibold text-slate-900">{product.camper_data.storage_other_l} L</p>
                      </div>
                  }
                    {product.camper_data?.popup_roof &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Pop-Up-Roof</p>
                        <p className="font-semibold text-slate-900 capitalize">{product.camper_data.popup_roof}</p>
                      </div>
                  }
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="interiorDetails" className="mt-6">
                <Card className="p-6 border-0 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Sleeping</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.sleeping?.sleeps &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Sleeps</p>
                          <p className="font-semibold text-slate-900">{product.sleeping.sleeps} persons</p>
                        </div>
                    }
                      {product.sleeping?.bed_size_bottom_cm &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Bed Bottom (w x l)</p>
                          <p className="font-semibold text-slate-900">{product.sleeping.bed_size_bottom_cm}</p>
                        </div>
                    }
                      {product.sleeping?.bed_size_rooftop_cm &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Bed Rooftop (w x l)</p>
                          <p className="font-semibold text-slate-900">{product.sleeping.bed_size_rooftop_cm}</p>
                        </div>
                    }
                      {product.sleeping?.ventilation &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Ventilation</p>
                          <p className="font-semibold text-slate-900">{product.sleeping.ventilation}</p>
                        </div>
                    }
                      {product.sleeping?.rooftop_mosquito_nets &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Mosquito Nets</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.sleeping.rooftop_mosquito_nets}</p>
                        </div>
                    }
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Sitting & Lounging</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.sit_lounge?.swivel_front_seats &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Swivel Seats</p>
                          <p className="font-semibold text-slate-900">{product.sit_lounge.swivel_front_seats}</p>
                        </div>
                    }
                      {product.sit_lounge?.indoor_table &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Indoor Table</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.sit_lounge.indoor_table}</p>
                        </div>
                    }
                      {product.sit_lounge?.outdoor_table &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Outdoor Table</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.sit_lounge.outdoor_table}</p>
                        </div>
                    }
                      {product.sit_lounge?.iso_fix &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">ISO-Fix</p>
                          <p className="font-semibold text-slate-900">{product.sit_lounge.iso_fix}</p>
                        </div>
                    }
                      {product.sit_lounge?.tinted_windows &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Tinted Windows</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.sit_lounge.tinted_windows}</p>
                        </div>
                    }
                      {product.sit_lounge?.curtains &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Curtains</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.sit_lounge.curtains}</p>
                        </div>
                    }
                      {product.sit_lounge?.awning &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Awning</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.sit_lounge.awning}</p>
                        </div>
                    }
                      {product.sit_lounge?.indoor_lights &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Indoor Lights</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.sit_lounge.indoor_lights}</p>
                        </div>
                    }
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Cooking</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.kitchen?.fridge_type &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Fridge Type</p>
                          <p className="font-semibold text-slate-900 capitalize">
                            {product.kitchen.fridge_type}
                            {product.kitchen.fridge_type === 'electric' && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.kitchen?.fridge_l &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Fridge</p>
                          <p className="font-semibold text-slate-900">{product.kitchen.fridge_l} L</p>
                        </div>
                    }
                      {product.kitchen?.stove_type &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Stove Type</p>
                          <p className="font-semibold text-slate-900 capitalize">
                            {product.kitchen.stove_type}
                            {product.kitchen.stove_type === 'electric' && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.kitchen?.stove_plates &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Stove Plates</p>
                          <p className="font-semibold text-slate-900">{product.kitchen.stove_plates}</p>
                        </div>
                    }
                      {product.kitchen?.stove_energy_w &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Stove Energy</p>
                          <p className="font-semibold text-slate-900">{product.kitchen.stove_energy_w} W</p>
                        </div>
                    }
                      {product.kitchen?.indoor_cooking &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Indoor Cooking</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.kitchen.indoor_cooking}</p>
                        </div>
                    }
                      {product.kitchen?.outdoor_cooking &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Outdoor Cooking</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.kitchen.outdoor_cooking}</p>
                        </div>
                    }
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Water</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.bathroom?.fresh_water_l &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Fresh Water</p>
                          <p className="font-semibold text-slate-900">{product.bathroom.fresh_water_l} L</p>
                        </div>
                    }
                      {product.bathroom?.waste_water_l &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Waste Water</p>
                          <p className="font-semibold text-slate-900">{product.bathroom.waste_water_l} L</p>
                        </div>
                    }
                      {product.bathroom?.warm_water_l &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Warm Water</p>
                          <p className="font-semibold text-slate-900">{product.bathroom.warm_water_l} L</p>
                        </div>
                    }
                      {product.bathroom?.warm_water_available &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Warm water</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.bathroom.warm_water_available}</p>
                        </div>
                    }
                      {product.bathroom?.shower &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Shower</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.bathroom.shower}</p>
                        </div>
                    }
                      {product.bathroom?.warm_shower &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Warm Shower</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.bathroom.warm_shower}</p>
                        </div>
                    }
                      {product.bathroom?.toilet_type &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Toilet</p>
                          <p className="font-semibold text-slate-900 capitalize">
                            {product.bathroom.toilet_type}
                            {product.bathroom.toilet_type === 'separation' && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Materials</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.eco_scoring?.furniture_materials &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Furniture Materials</p>
                          <p className="font-semibold text-slate-900">
                            {product.eco_scoring.furniture_materials}
                            {product.eco_scoring.furniture_materials_eco && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.eco_scoring?.flooring_material &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Flooring Materials</p>
                          <p className="font-semibold text-slate-900">
                            {product.eco_scoring.flooring_material}
                            {product.eco_scoring.flooring_material_eco && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.eco_scoring?.insulation_material &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Insulation Materials</p>
                          <p className="font-semibold text-slate-900">
                            {product.eco_scoring.insulation_material}
                            {product.eco_scoring.insulation_material_eco && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.eco_scoring?.textile_material &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Textile Materials</p>
                          <p className="font-semibold text-slate-900">
                            {product.eco_scoring.textile_material}
                            {product.eco_scoring.textile_material_eco && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="energy" className="mt-6">
                <Card className="p-6 border-0 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    {product.energy?.camping_battery_wh &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Camping Battery</p>
                        <p className="font-semibold text-slate-900">{product.energy.camping_battery_wh} Wh</p>
                      </div>
                  }
                    {product.energy?.solar_panel_available &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Solar Panel</p>
                        <p className="font-semibold text-slate-900 capitalize">
                          {product.energy.solar_panel_available}
                          {product.energy.solar_panel_available === 'yes' && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                        </p>
                      </div>
                  }
                    {product.energy?.solar_panel_max_w &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Solar Panel (max. W)</p>
                        <p className="font-semibold text-slate-900">{product.energy.solar_panel_max_w} W</p>
                      </div>
                  }
                    {product.energy?.battery_charging_solar_wh &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Charging via Solar</p>
                        <p className="font-semibold text-slate-900">{product.energy.battery_charging_solar_wh} Wh</p>
                      </div>
                  }
                    {product.energy?.battery_charging_hv_wh &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Charging via HV</p>
                        <p className="font-semibold text-slate-900">{product.energy.battery_charging_hv_wh} Wh</p>
                      </div>
                  }
                    {product.energy?.battery_charging_driving_wh &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Charge while driving</p>
                        <p className="font-semibold text-slate-900">{product.energy.battery_charging_driving_wh} W</p>
                      </div>
                  }
                    {product.energy?.battery_charging_landline_wh &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Charging via Landline</p>
                        <p className="font-semibold text-slate-900">{product.energy.battery_charging_landline_wh} Wh</p>
                      </div>
                  }
                    {product.energy?.max_battery_output_ac_12v_w &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Max. Output AC 12V</p>
                        <p className="font-semibold text-slate-900">{product.energy.max_battery_output_ac_12v_w} W</p>
                      </div>
                  }
                    {product.energy?.battery_output_plugs_ac &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">AC Plugs (230V Schuko)</p>
                        <p className="font-semibold text-slate-900">{product.energy.battery_output_plugs_ac}</p>
                      </div>
                  }
                    {product.energy?.max_battery_output_dc_230v_w &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">Max. Output DC 230V</p>
                        <p className="font-semibold text-slate-900">{product.energy.max_battery_output_dc_230v_w} W</p>
                      </div>
                  }
                    {product.energy?.battery_output_plugs_dc &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">DC Plugs (12V)</p>
                        <p className="font-semibold text-slate-900">{product.energy.battery_output_plugs_dc}</p>
                      </div>
                  }
                    {product.energy?.usb_c_plugs_front &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">USB(-C) plugs Cockpit</p>
                        <p className="font-semibold text-slate-900">{product.energy.usb_c_plugs_front}</p>
                      </div>
                  }
                    {product.energy?.usb_c_plugs_livingroom &&
                  <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase">USB(-C) plugs Living</p>
                        <p className="font-semibold text-slate-900">{product.energy.usb_c_plugs_livingroom}</p>
                      </div>
                  }
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <Card className="p-6 border-0 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Climate</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.climate?.ac &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Air Conditioning</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.climate.ac}</p>
                        </div>
                    }
                      {product.climate?.vehicle_climate_programming &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Climate Programming</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.climate.vehicle_climate_programming}</p>
                        </div>
                    }
                      {product.climate?.vehicle_heating &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Vehicle Heating</p>
                          <p className="font-semibold text-slate-900 capitalize">
                            {product.climate.vehicle_heating}
                            {product.climate.vehicle_heating === 'electric' && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.climate?.vehicle_cooling &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Vehicle Cooling</p>
                          <p className="font-semibold text-slate-900 capitalize">
                            {product.climate.vehicle_cooling}
                            {product.climate.vehicle_cooling === 'electric' && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.climate?.stand_heating &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Stand Heating</p>
                          <p className="font-semibold text-slate-900 capitalize">
                            {product.climate.stand_heating}
                            {product.climate.stand_heating === 'electric' && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.climate?.living_room_heating &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Living Room Heating</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.climate.living_room_heating}</p>
                        </div>
                    }
                      {product.climate?.insulation &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Insulation</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.climate.insulation}</p>
                        </div>
                    }
                      {product.climate?.seat_heating &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Seat Heating</p>
                          <p className="font-semibold text-slate-900 capitalize">
                            {product.climate.seat_heating}
                            {product.climate.seat_heating === 'yes' && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.climate?.steering_wheel_heating &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Steering Wheel Heating</p>
                          <p className="font-semibold text-slate-900 capitalize">
                            {product.climate.steering_wheel_heating}
                            {product.climate.steering_wheel_heating === 'yes' && <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Eco</Badge>}
                          </p>
                        </div>
                    }
                      {product.climate?.front_windows_opening_electric &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Front Windows Opening</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.climate.front_windows_opening_electric}</p>
                        </div>
                    }
                      {product.climate?.rear_windows_opening &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Rear Windows Opening</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.climate.rear_windows_opening}</p>
                        </div>
                    }
                      {product.climate?.back_window_opening &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                         <p className="text-xs text-slate-500 uppercase">Back Window Opening</p>
                         <p className="font-semibold text-slate-900 capitalize">{product.climate.back_window_opening}</p>
                       </div>
                    }

                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Smart & Connected</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.smart_connected?.remote_app_access &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Remote App</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.remote_app_access}</p>
                        </div>
                    }
                      {product.smart_connected?.apple_carplay_android_auto &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">CarPlay / Android Auto</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.apple_carplay_android_auto}</p>
                        </div>
                    }
                      {product.smart_connected?.navigation_software &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Navigation</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.navigation_software}</p>
                        </div>
                    }
                      {product.smart_connected?.cruise_control &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Cruise Control</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.cruise_control}</p>
                        </div>
                    }
                      {product.smart_connected?.parking_sensors &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Parking Sensors</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.parking_sensors}</p>
                        </div>
                    }
                      {product.smart_connected?.lane_assist &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Lane Assist</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.lane_assist}</p>
                        </div>
                    }
                      {product.smart_connected?.sign_recognition &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Sign Recognition</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.sign_recognition}</p>
                        </div>
                    }
                      {product.smart_connected?.rear_camera &&
                    <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 uppercase">Rear Camera</p>
                          <p className="font-semibold text-slate-900 capitalize">{product.smart_connected.rear_camera}</p>
                        </div>
                    }
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 &&
        <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) =>
            <Link key={p.id} to={createPageUrl('ProductDetail') + `?id=${p.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-0">
                    <div className="aspect-square bg-slate-100 p-4 flex items-center justify-center">
                      {p.image_url ?
                  <img src={p.image_url} alt={p.model_name} className="max-h-full object-contain" /> :

                  <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center">
                          <span className="text-2xl font-bold text-slate-400">{p.brand?.[0]}</span>
                        </div>
                  }
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-slate-500">{p.base_vehicle?.brand} {p.base_vehicle?.model}</p>
                      <p className="font-medium text-slate-900 truncate">{p.model_name}</p>
                      {(p.rent_from_price || allCompanies.flatMap((c) => c.available_campers || []).filter((ac) => ac.camper_id === p.id).map((ac) => ac.rent_price).filter((pr) => pr != null)[0]) &&
                  <p className="font-bold text-emerald-600 mt-1">
                          €{p.rent_from_price || Math.min(...allCompanies.flatMap((c) => c.available_campers || []).filter((ac) => ac.camper_id === p.id).map((ac) => ac.rent_price).filter((pr) => pr != null))}/day
                        </p>
                  }
                    </div>
                  </Card>
                </Link>
            )}
            </div>
          </div>
        }
      </div>
    </div>);

}