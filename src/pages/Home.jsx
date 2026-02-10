import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  const maxBuyPrice = Math.max(...products.map((p) => p.buy_from_price || 0), 150000);
  const maxRentPrice = Math.max(...products.map((p) => p.rent_from_price || 0), 250);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.released);
    const adv = filters.advanced || {};

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter((p) =>
        p.model_name?.toLowerCase().includes(search) ||
        p.base_vehicle?.brand?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }
    if (filters.sizeCategory !== 'All') {
      result = result.filter((p) => p.size_category === filters.sizeCategory);
    }
    if (filters.brand !== 'All') {
      result = result.filter((p) => p.base_vehicle?.brand === filters.brand);
    }
    if (filters.purchasePrice) {
      result = result.filter((p) => {
        const price = p.buy_from_price || 0;
        return price >= filters.purchasePrice[0] && price <= filters.purchasePrice[1];
      });
    }
    if (filters.rentalPrice) {
      result = result.filter((p) => {
        const price = p.rent_from_price || 0;
        return price >= filters.rentalPrice[0] && price <= filters.rentalPrice[1];
      });
    }
    if (filters.gasFree) {
      result = result.filter((p) =>
        p.kitchen?.stove_type?.toLowerCase() !== 'gas' &&
        p.kitchen?.fridge_type?.toLowerCase() !== 'gas' &&
        p.climate?.stand_heating?.toLowerCase() !== 'gas' &&
        p.climate?.vehicle_heating?.toLowerCase() !== 'gas'
      );
    }
    if (filters.ecoMaterials) {
      result = result.filter((p) =>
        p.eco_scoring?.furniture_materials_eco || p.eco_scoring?.flooring_material_eco ||
        p.eco_scoring?.insulation_material_eco || p.eco_scoring?.textile_material_eco
      );
    }
    if (filters.familyFriendly) {
      result = result.filter((p) => (p.sleeping?.sleeps || 0) >= 4);
    }
    if (filters.offGrid) {
      result = result.filter((p) => (p.energy?.solar_panel_max_w || 0) >= 100 && (p.energy?.camping_battery_wh || 0) >= 1);
    }
    if (filters.winterReady) {
      result = result.filter((p) => p.climate?.insulation === 'yes');
    }
    if (filters.heightUnder2m) {
      result = result.filter((p) => (p.camper_data?.height_mm || 0) < 2000);
    }

    // Advanced filters
    result = result.filter((p) => {
      if (adv.model_year && p.base_vehicle?.model_year !== adv.model_year) return false;
      if (adv.max_consumption && (p.base_vehicle?.consumption_kwh_100km || Infinity) > adv.max_consumption) return false;
      if (adv.drive && p.base_vehicle?.drive !== adv.drive) return false;
      if (adv.b_license && p.base_vehicle?.b_license_approved !== adv.b_license) return false;
      if (adv.min_wltp_range && (p.base_vehicle?.wltp_range_km || 0) < adv.min_wltp_range) return false;
      if (adv.min_battery && (p.base_vehicle?.battery_size_kwh || 0) < adv.min_battery) return false;
      if (adv.min_kw && (p.base_vehicle?.kw || 0) < adv.min_kw) return false;
      if (adv.min_ac_charge && (p.base_vehicle?.charging_speed_ac_kw || 0) < adv.min_ac_charge) return false;
      if (adv.min_dc_charge && (p.base_vehicle?.charging_speed_dc_kw || 0) < adv.min_dc_charge) return false;
      if (adv.charger_types && p.base_vehicle?.charger_types !== adv.charger_types) return false;
      if (adv.max_dc_20_80 && (p.base_vehicle?.dc_fast_charging_20_80_min || Infinity) > adv.max_dc_20_80) return false;
      if (adv.min_max_speed && (p.base_vehicle?.max_speed_kmh || 0) < adv.min_max_speed) return false;
      if (adv.max_turning_circle && (p.base_vehicle?.turning_circle_m || Infinity) > adv.max_turning_circle) return false;
      if (adv.max_weight_empty && (p.base_vehicle?.weight_empty_kg || Infinity) > adv.max_weight_empty) return false;
      if (adv.min_additional_weight && (p.base_vehicle?.max_additional_weight_kg || 0) < adv.min_additional_weight) return false;
      if (adv.trailer_hitch === 'yes' && p.extras?.trailer_hitch !== 'yes' && p.extras?.trailer_hitch !== 'retractable') return false;
      if (adv.sliding_doors === 'yes' && (p.extras?.sliding_doors === 'none' || !p.extras?.sliding_doors)) return false;
      if (adv.backdoor === 'yes' && (p.extras?.backdoor === 'no' || !p.extras?.backdoor)) return false;
      if (adv.min_range && (p.camper_data?.camper_range_km || 0) < adv.min_range) return false;
      if (adv.min_seats && (p.camper_data?.seats || 0) < adv.min_seats) return false;
      if (adv.min_sleeps && (p.sleeping?.sleeps || 0) < adv.min_sleeps) return false;
      if (adv.popup_roof === 'yes' && p.camper_data?.popup_roof !== 'yes') return false;
      if (adv.max_length && (p.camper_data?.length_mm || Infinity) > adv.max_length) return false;
      if (adv.max_height && (p.camper_data?.height_mm || Infinity) > adv.max_height) return false;
      if (adv.max_width && (p.camper_data?.width_mm || Infinity) > adv.max_width) return false;
      if (adv.min_storage_total && (p.camper_data?.storage_total_l || 0) < adv.min_storage_total) return false;
      if (adv.awning && p.sit_lounge?.awning !== adv.awning) return false;
      if (adv.outdoor_cooking && p.kitchen?.outdoor_cooking !== adv.outdoor_cooking) return false;
      if (adv.indoor_cooking === 'yes' && p.kitchen?.indoor_cooking !== 'yes') return false;
      if (adv.ventilation && p.sleeping?.ventilation !== adv.ventilation) return false;
      if (adv.mosquito_nets && p.sleeping?.rooftop_mosquito_nets !== adv.mosquito_nets) return false;
      if (adv.swivel_seats && p.sit_lounge?.swivel_front_seats !== adv.swivel_seats) return false;
      if (adv.indoor_table === 'yes' && p.sit_lounge?.indoor_table !== 'yes') return false;
      if (adv.outdoor_table === 'yes' && p.sit_lounge?.outdoor_table !== 'yes') return false;
      if (adv.iso_fix && p.sit_lounge?.iso_fix !== adv.iso_fix) return false;
      if (adv.tinted_windows && p.sit_lounge?.tinted_windows !== adv.tinted_windows) return false;
      if (adv.curtains && p.sit_lounge?.curtains !== adv.curtains) return false;
      if (adv.indoor_lights && p.sit_lounge?.indoor_lights !== adv.indoor_lights) return false;
      if (adv.fridge_type && p.kitchen?.fridge_type !== adv.fridge_type) return false;
      if (adv.min_fridge && (p.kitchen?.fridge_l || 0) < adv.min_fridge) return false;
      if (adv.stove_type && p.kitchen?.stove_type !== adv.stove_type) return false;
      if (adv.min_fresh_water && (p.bathroom?.fresh_water_l || 0) < adv.min_fresh_water) return false;
      if (adv.warm_water === 'yes' && p.bathroom?.warm_water_available !== 'yes') return false;
      if (adv.shower && p.bathroom?.shower !== adv.shower) return false;
      if (adv.warm_shower === 'yes' && p.bathroom?.warm_shower !== 'yes') return false;
      if (adv.toilet_type && p.bathroom?.toilet_type !== adv.toilet_type) return false;
      if (adv.solar_panel_available === 'yes' && p.energy?.solar_panel_available !== 'yes') return false;
      if (adv.min_camping_battery && (p.energy?.camping_battery_wh || 0) < adv.min_camping_battery) return false;
      if (adv.min_ac_plugs && (p.energy?.battery_output_plugs_ac || 0) < adv.min_ac_plugs) return false;
      if (adv.min_solar_w && (p.energy?.solar_panel_max_w || 0) < adv.min_solar_w) return false;
      if (adv.min_usb_front && (p.energy?.usb_c_plugs_front || 0) < adv.min_usb_front) return false;
      if (adv.min_usb_living && (p.energy?.usb_c_plugs_livingroom || 0) < adv.min_usb_living) return false;
      if (adv.vehicle_heating && p.climate?.vehicle_heating !== adv.vehicle_heating) return false;
      if (adv.vehicle_cooling && p.climate?.vehicle_cooling !== adv.vehicle_cooling) return false;
      if (adv.insulation === 'yes' && p.climate?.insulation !== 'yes') return false;
      if (adv.carplay && p.smart_connected?.apple_carplay_android_auto !== adv.carplay) return false;
      if (adv.ac === 'yes' && p.climate?.ac !== 'yes') return false;
      if (adv.vehicle_climate_programming === 'yes' && p.climate?.vehicle_climate_programming !== 'yes') return false;
      if (adv.stand_heating && p.climate?.stand_heating !== adv.stand_heating) return false;
      if (adv.living_room_heating === 'yes' && p.climate?.living_room_heating !== 'yes') return false;
      if (adv.seat_heating === 'yes' && p.climate?.seat_heating !== 'yes') return false;
      if (adv.steering_wheel_heating === 'yes' && p.climate?.steering_wheel_heating !== 'yes') return false;
      if (adv.remote_app_access === 'yes' && p.smart_connected?.remote_app_access !== 'yes') return false;
      if (adv.navigation && p.smart_connected?.navigation_software !== adv.navigation) return false;
      if (adv.cruise_control && p.smart_connected?.cruise_control !== adv.cruise_control) return false;
      if (adv.lane_assist === 'yes' && p.smart_connected?.lane_assist !== 'yes') return false;
      if (adv.sign_recognition === 'yes' && p.smart_connected?.sign_recognition !== 'yes') return false;
      if (adv.rear_camera === 'yes' && p.smart_connected?.rear_camera !== 'yes') return false;
      if (adv.parking_sensors && p.smart_connected?.parking_sensors !== adv.parking_sensors) return false;
      return true;
    });

    switch (filters.sortBy) {
      case 'price-buy-low':
        result.sort((a, b) => (a.buy_from_price || 0) - (b.buy_from_price || 0));
        break;
      case 'price-buy-high':
        result.sort((a, b) => (b.buy_from_price || 0) - (a.buy_from_price || 0));
        break;
      case 'price-rent-low':
        result.sort((a, b) => (a.rent_from_price || 0) - (b.rent_from_price || 0));
        break;
      case 'price-rent-high':
        result.sort((a, b) => (b.rent_from_price || 0) - (a.rent_from_price || 0));
        break;
      case 'range':
        result.sort((a, b) => (b.camper_data?.camper_range_km || 0) - (a.camper_data?.camper_range_km || 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Polaroid Hero Section */}
      <HeroPolaroidRevealStyled
        onBrowseClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
        onRequestClick={() => setIsRequestModalOpen(true)}
        onPolaroidClick={(id) => navigate(createPageUrl("ProductDetail") + `?id=${id}`)}
      />

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 py-8">
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          maxBuyPrice={maxBuyPrice}
          maxRentPrice={maxRentPrice}
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
                  onClick={() => navigate(createPageUrl("ProductDetail") + `?id=${product.id}`)}
                />
              ))}
            </div>
          }
        </div>
      </div>

      {/* Request Camper Section */}
      <div className="bg-gradient-to-br from-violet-50 to-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Are you missing any Electric (BEV) Camper model that is available to rent or to buy in Europe right now or coming to the market this year?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Thank you for let us know and everyone can compare it with all the other Campers!
          </p>
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
            onClick={() => setIsRequestModalOpen(true)}>
            <PlusCircle className="w-5 h-5 mr-2" /> Request a Camper
          </Button>
        </div>
      </div>

      {/* Request Camper Section */}
      <div className="bg-gradient-to-br from-violet-50 to-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Are you missing any Electric (BEV) Camper model that is available to rent or to buy in Europe right now or coming to the market this year?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Thank you for let us know and everyone can compare it with all the other Campers!
          </p>
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
            onClick={() => setIsRequestModalOpen(true)}>
            <PlusCircle className="w-5 h-5 mr-2" /> Request a Camper
          </Button>
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