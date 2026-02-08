import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import CompareBar from '@/components/products/CompareBar';
import RequestProductModal from '@/components/products/RequestProductModal';
import HeroPolaroidRevealStyled from '@/components/HeroPolaroidReveal';

export default function Home() {
  const [filters, setFilters] = useState({
    search: '',
    sizeCategory: 'All',
    brand: 'All',
    sortBy: 'featured',
    purchasePrice: [0, 150000],
    rentalPrice: [0, 250],
    gasFree: false,
    ecoMaterials: false,
    familyFriendly: false,
    offGrid: false,
    winterReady: false,
    heightUnder2m: false,
    advanced: {}
  });
  const [compareList, setCompareList] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const adv = filters.advanced || {};

    // Search
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(p => p.model_name?.toLowerCase().includes(s) || p.base_vehicle?.brand?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
    }
    if (filters.sizeCategory !== 'All') result = result.filter(p => p.size_category === filters.sizeCategory);
    if (filters.brand !== 'All') result = result.filter(p => p.base_vehicle?.brand === filters.brand);

    // Price ranges
    if (filters.purchasePrice) {
      result = result.filter(p => { const pr = p.buy_from_price || 0; return pr >= filters.purchasePrice[0] && pr <= filters.purchasePrice[1]; });
    }
    if (filters.rentalPrice) {
      result = result.filter(p => { const pr = p.rent_from_price || 0; return pr === 0 || (pr >= filters.rentalPrice[0] && pr <= filters.rentalPrice[1]); });
    }

    // Quick filters
    if (filters.gasFree) result = result.filter(p => p.kitchen?.stove_type !== 'gas' && p.kitchen?.fridge_type !== 'gas' && p.climate?.stand_heating !== 'gas' && p.climate?.vehicle_heating !== 'gas');
    if (filters.ecoMaterials) result = result.filter(p => p.eco_scoring?.furniture_materials_eco || p.eco_scoring?.flooring_material_eco || p.eco_scoring?.insulation_material_eco || p.eco_scoring?.textile_material_eco);
    if (filters.familyFriendly) result = result.filter(p => (p.sleeping?.sleeps || 0) >= 4);
    if (filters.offGrid) result = result.filter(p => (p.energy?.solar_panel_max_w || 0) >= 100 && (p.energy?.camping_battery_wh || 0) >= 1);
    if (filters.winterReady) result = result.filter(p => p.climate?.insulation === 'yes');
    if (filters.heightUnder2m) result = result.filter(p => p.camper_data?.height_mm && p.camper_data.height_mm < 2000);

    // Advanced: Base Vehicle
    if (adv.model_year) result = result.filter(p => p.base_vehicle?.model_year === adv.model_year);
    if (adv.max_consumption) result = result.filter(p => p.base_vehicle?.consumption_kwh_100km && p.base_vehicle.consumption_kwh_100km <= Number(adv.max_consumption));
    if (adv.drive) result = result.filter(p => p.base_vehicle?.drive === adv.drive);
    if (adv.b_license) result = result.filter(p => p.base_vehicle?.b_license_approved === adv.b_license);
    if (adv.min_wltp_range) result = result.filter(p => (p.base_vehicle?.wltp_range_km || 0) >= Number(adv.min_wltp_range));
    if (adv.min_battery) result = result.filter(p => (p.base_vehicle?.battery_size_kwh || 0) >= Number(adv.min_battery));
    if (adv.min_kw) result = result.filter(p => (p.base_vehicle?.kw || 0) >= Number(adv.min_kw));
    if (adv.min_ac_charge) result = result.filter(p => (p.base_vehicle?.charging_speed_ac_kw || 0) >= Number(adv.min_ac_charge));
    if (adv.min_dc_charge) result = result.filter(p => (p.base_vehicle?.charging_speed_dc_kw || 0) >= Number(adv.min_dc_charge));
    if (adv.charger_types) result = result.filter(p => p.base_vehicle?.charger_types === adv.charger_types);
    if (adv.max_dc_20_80) result = result.filter(p => p.base_vehicle?.dc_fast_charging_20_80_min && p.base_vehicle.dc_fast_charging_20_80_min <= Number(adv.max_dc_20_80));
    if (adv.min_max_speed) result = result.filter(p => (p.base_vehicle?.max_speed_kmh || 0) >= Number(adv.min_max_speed));
    if (adv.max_turning_circle) result = result.filter(p => p.base_vehicle?.turning_circle_m && p.base_vehicle.turning_circle_m <= Number(adv.max_turning_circle));
    if (adv.max_weight_empty) result = result.filter(p => p.base_vehicle?.weight_empty_kg && p.base_vehicle.weight_empty_kg <= Number(adv.max_weight_empty));
    if (adv.min_additional_weight) result = result.filter(p => (p.base_vehicle?.max_additional_weight_kg || 0) >= Number(adv.min_additional_weight));
    if (adv.trailer_hitch === 'yes') result = result.filter(p => p.extras?.trailer_hitch === 'yes' || p.extras?.trailer_hitch === 'retractable');
    if (adv.sliding_doors === 'yes') result = result.filter(p => p.extras?.sliding_doors === 'yes');
    if (adv.backdoor === 'yes') result = result.filter(p => p.extras?.backdoor === 'yes');

    // Advanced: Camper
    if (adv.min_range) result = result.filter(p => (p.camper_data?.camper_range_km || 0) >= adv.min_range);
    if (adv.min_seats) result = result.filter(p => (p.camper_data?.seats || 0) >= adv.min_seats);
    if (adv.min_sleeps) result = result.filter(p => (p.sleeping?.sleeps || 0) >= adv.min_sleeps);
    if (adv.popup_roof === 'yes') result = result.filter(p => p.camper_data?.popup_roof === 'yes');
    if (adv.max_length) result = result.filter(p => p.camper_data?.length_mm && p.camper_data.length_mm <= Number(adv.max_length));
    if (adv.max_height) result = result.filter(p => p.camper_data?.height_mm && p.camper_data.height_mm <= Number(adv.max_height));
    if (adv.max_width) result = result.filter(p => p.camper_data?.width_mm && p.camper_data.width_mm <= Number(adv.max_width));
    if (adv.min_storage_total) result = result.filter(p => (p.camper_data?.storage_total_l || 0) >= adv.min_storage_total);

    // Advanced: Interior
    if (adv.awning) result = result.filter(p => p.sit_lounge?.awning === adv.awning);
    if (adv.outdoor_cooking) result = result.filter(p => p.kitchen?.outdoor_cooking === adv.outdoor_cooking);
    if (adv.indoor_cooking === 'yes') result = result.filter(p => p.kitchen?.indoor_cooking === 'yes');
    if (adv.ventilation) result = result.filter(p => p.sleeping?.ventilation === adv.ventilation);
    if (adv.mosquito_nets) result = result.filter(p => p.sleeping?.rooftop_mosquito_nets === adv.mosquito_nets);
    if (adv.swivel_seats) result = result.filter(p => p.sit_lounge?.swivel_front_seats === adv.swivel_seats);
    if (adv.indoor_table === 'yes') result = result.filter(p => p.sit_lounge?.indoor_table === 'yes');
    if (adv.outdoor_table === 'yes') result = result.filter(p => p.sit_lounge?.outdoor_table === 'yes');
    if (adv.iso_fix) result = result.filter(p => p.sit_lounge?.iso_fix === adv.iso_fix);
    if (adv.tinted_windows) result = result.filter(p => p.sit_lounge?.tinted_windows === adv.tinted_windows);
    if (adv.curtains) result = result.filter(p => p.sit_lounge?.curtains === adv.curtains);
    if (adv.indoor_lights) result = result.filter(p => p.sit_lounge?.indoor_lights === adv.indoor_lights);
    if (adv.fridge_type) result = result.filter(p => p.kitchen?.fridge_type === adv.fridge_type);
    if (adv.min_fridge) result = result.filter(p => (p.kitchen?.fridge_l || 0) >= adv.min_fridge);
    if (adv.stove_type) result = result.filter(p => p.kitchen?.stove_type === adv.stove_type);
    if (adv.min_fresh_water) result = result.filter(p => (p.bathroom?.fresh_water_l || 0) >= Number(adv.min_fresh_water));
    if (adv.warm_water === 'yes') result = result.filter(p => p.bathroom?.warm_water_available === 'yes');
    if (adv.shower) result = result.filter(p => p.bathroom?.shower === adv.shower);
    if (adv.warm_shower === 'yes') result = result.filter(p => p.bathroom?.warm_shower === 'yes');
    if (adv.toilet_type) result = result.filter(p => p.bathroom?.toilet_type === adv.toilet_type);

    // Advanced: Energy
    if (adv.solar_panel_available === 'yes') result = result.filter(p => p.energy?.solar_panel_available === 'yes');
    if (adv.min_camping_battery) result = result.filter(p => (p.energy?.camping_battery_wh || 0) >= adv.min_camping_battery);
    if (adv.min_ac_plugs) result = result.filter(p => (p.energy?.battery_output_plugs_ac || 0) >= Number(adv.min_ac_plugs));
    if (adv.min_solar_w) result = result.filter(p => (p.energy?.solar_panel_max_w || 0) >= Number(adv.min_solar_w));
    if (adv.min_usb_front) result = result.filter(p => (p.energy?.usb_c_plugs_front || 0) >= Number(adv.min_usb_front));
    if (adv.min_usb_living) result = result.filter(p => (p.energy?.usb_c_plugs_livingroom || 0) >= Number(adv.min_usb_living));

    // Advanced: Comfort - Climate
    if (adv.vehicle_heating) result = result.filter(p => p.climate?.vehicle_heating === adv.vehicle_heating);
    if (adv.vehicle_cooling) result = result.filter(p => p.climate?.vehicle_cooling === adv.vehicle_cooling);
    if (adv.insulation === 'yes') result = result.filter(p => p.climate?.insulation === 'yes');
    if (adv.carplay) result = result.filter(p => p.smart_connected?.apple_carplay_android_auto === adv.carplay);
    if (adv.ac === 'yes') result = result.filter(p => p.climate?.ac === 'yes');
    if (adv.vehicle_climate_programming === 'yes') result = result.filter(p => p.climate?.vehicle_climate_programming === 'yes');
    if (adv.stand_heating) result = result.filter(p => p.climate?.stand_heating === adv.stand_heating);
    if (adv.living_room_heating === 'yes') result = result.filter(p => p.climate?.living_room_heating === 'yes');
    if (adv.seat_heating === 'yes') result = result.filter(p => p.climate?.seat_heating === 'yes');
    if (adv.steering_wheel_heating === 'yes') result = result.filter(p => p.climate?.steering_wheel_heating === 'yes');
    if (adv.remote_app_access === 'yes') result = result.filter(p => p.smart_connected?.remote_app_access === 'yes');
    if (adv.navigation) result = result.filter(p => p.smart_connected?.navigation_software === adv.navigation);
    if (adv.cruise_control) result = result.filter(p => p.smart_connected?.cruise_control === adv.cruise_control);
    if (adv.lane_assist === 'yes') result = result.filter(p => p.smart_connected?.lane_assist === 'yes');
    if (adv.sign_recognition === 'yes') result = result.filter(p => p.smart_connected?.sign_recognition === 'yes');
    if (adv.rear_camera === 'yes') result = result.filter(p => p.smart_connected?.rear_camera === 'yes');
    if (adv.parking_sensors) result = result.filter(p => p.smart_connected?.parking_sensors === adv.parking_sensors);

    // Sort
    switch (filters.sortBy) {
      case 'price-buy-low': result.sort((a, b) => (a.buy_from_price || 0) - (b.buy_from_price || 0)); break;
      case 'price-buy-high': result.sort((a, b) => (b.buy_from_price || 0) - (a.buy_from_price || 0)); break;
      case 'price-rent-low': result.sort((a, b) => (a.rent_from_price || 0) - (b.rent_from_price || 0)); break;
      case 'price-rent-high': result.sort((a, b) => (b.rent_from_price || 0) - (a.rent_from_price || 0)); break;
      case 'range': result.sort((a, b) => (b.camper_data?.camper_range_km || 0) - (a.camper_data?.camper_range_km || 0)); break;
      case 'featured': default: result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [products, filters]);

  const handleCompare = (product) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, product];
    });
  };

  const maxPrice = Math.max(...products.map((p) => p.buy_from_price || 0), 150000);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <HeroPolaroidRevealStyled
        onBrowseClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
        onRequestClick={() => setIsRequestModalOpen(true)}
      />

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 py-8">
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          maxBuyPrice={maxPrice}
          products={products} />


        <div className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600">
              <span className="font-semibold text-slate-900">{filteredProducts.length}</span> campers found
            </p>
          </div>

          {isLoading ?
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) =>
            <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-9 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
            )}
            </div> :
          filteredProducts.length === 0 ?
          <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚐</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No campers found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
              <Button
              variant="outline"
              onClick={() => setIsRequestModalOpen(true)}>

                <PlusCircle className="w-4 h-4 mr-2" /> Request a Camper
              </Button>
            </div> :
            
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCompare={handleCompare}
                  isInCompare={compareList.some((p) => p.id === product.id)}
                  onClick={() => window.location.href = createPageUrl("ProductDetail") + `?id=${product.id}`}
                />
              ))}
            </div>
          }
        </div>
      </div>

      {/* Compare Bar */}
      <div className={compareList.length > 0 ? 'pb-24' : ''}>
        <CompareBar
          compareList={compareList}
          onRemove={(id) => setCompareList((prev) => prev.filter((p) => p.id !== id))}
          onClear={() => setCompareList([])} />

      </div>

      {/* Request Modal */}
      <RequestProductModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)} />

    </div>);

}