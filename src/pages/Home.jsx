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
import HeroPolaroidReveal from '@/components/HeroPolaroidReveal';

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

    // Search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter((p) =>
        p.model_name?.toLowerCase().includes(search) ||
        p.base_vehicle?.brand?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    // Size
    if (filters.sizeCategory !== 'All') {
      result = result.filter((p) => p.size_category === filters.sizeCategory);
    }

    // Brand
    if (filters.brand !== 'All') {
      result = result.filter((p) => p.base_vehicle?.brand === filters.brand);
    }

    // Purchase price
    if (filters.purchasePrice) {
      result = result.filter((p) => {
        const price = p.buy_from_price || 0;
        return price >= filters.purchasePrice[0] && price <= filters.purchasePrice[1];
      });
    }

    // Rental price
    if (filters.rentalPrice) {
      result = result.filter((p) => {
        const price = p.rent_from_price || 0;
        if (price === 0) return true;
        return price >= filters.rentalPrice[0] && price <= filters.rentalPrice[1];
      });
    }

    // Quick filters
    if (filters.gasFree) {
      result = result.filter((p) =>
        p.kitchen?.stove_type !== 'gas' &&
        p.climate?.stand_heating !== 'gas' &&
        p.climate?.vehicle_heating !== 'gas'
      );
    }
    if (filters.ecoMaterials) {
      result = result.filter((p) =>
        p.eco_scoring?.furniture_materials_eco ||
        p.eco_scoring?.flooring_material_eco ||
        p.eco_scoring?.insulation_material_eco ||
        p.eco_scoring?.textile_material_eco
      );
    }
    if (filters.familyFriendly) {
      result = result.filter((p) => (p.sleeping?.sleeps || 0) >= 4 || p.sit_lounge?.iso_fix !== 'no');
    }
    if (filters.offGrid) {
      result = result.filter((p) => p.energy?.solar_panel_available === 'yes' && (p.energy?.camping_battery_wh || 0) >= 1000);
    }
    if (filters.winterReady) {
      result = result.filter((p) =>
        (p.climate?.stand_heating && p.climate.stand_heating !== 'no') ||
        (p.climate?.living_room_heating === 'yes') ||
        (p.climate?.insulation === 'yes')
      );
    }
    if (filters.heightUnder2m) {
      result = result.filter((p) => p.camper_data?.height_mm && p.camper_data.height_mm < 2000);
    }

    // Advanced filters
    const adv = filters.advanced || {};
    if (adv.model_year) result = result.filter((p) => p.base_vehicle?.model_year === adv.model_year);
    if (adv.drive) result = result.filter((p) => p.base_vehicle?.drive === adv.drive);
    if (adv.trailer_hitch === 'yes') result = result.filter((p) => p.extras?.trailer_hitch === 'yes' || p.extras?.trailer_hitch === 'retractable');
    if (adv.min_range) result = result.filter((p) => (p.camper_data?.camper_range_km || 0) >= adv.min_range);
    if (adv.min_storage_total) result = result.filter((p) => (p.camper_data?.storage_total_l || 0) >= adv.min_storage_total);
    if (adv.popup_roof === 'yes') result = result.filter((p) => p.camper_data?.popup_roof === 'yes');
    if (adv.min_battery) result = result.filter((p) => (p.base_vehicle?.battery_size_kwh || 0) >= Number(adv.min_battery));
    if (adv.min_sleeps) result = result.filter((p) => (p.sleeping?.sleeps || 0) >= adv.min_sleeps);
    if (adv.min_fridge) result = result.filter((p) => (p.kitchen?.fridge_l || 0) >= adv.min_fridge);
    if (adv.stove_type) result = result.filter((p) => p.kitchen?.stove_type === adv.stove_type);
    if (adv.toilet_type) result = result.filter((p) => p.bathroom?.toilet_type === adv.toilet_type);
    if (adv.warm_shower === 'yes') result = result.filter((p) => p.bathroom?.warm_shower === 'yes');
    if (adv.solar_panel_available === 'yes') result = result.filter((p) => p.energy?.solar_panel_available === 'yes');
    if (adv.ac === 'yes') result = result.filter((p) => p.climate?.ac === 'yes');
    if (adv.carplay) result = result.filter((p) => p.smart_connected?.apple_carplay_android_auto === adv.carplay);
    if (adv.remote_app_access === 'yes') result = result.filter((p) => p.smart_connected?.remote_app_access === 'yes');
    if (adv.parking_sensors) result = result.filter((p) => p.smart_connected?.parking_sensors && p.smart_connected.parking_sensors !== 'no');
    if (adv.stand_heating) result = result.filter((p) => p.climate?.stand_heating === adv.stand_heating);

    // Sort
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

  const maxPrice = Math.max(...products.map((p) => p.buy_from_price || 0), 150000);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <HeroPolaroidReveal
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