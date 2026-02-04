import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import CompareBar from '@/components/products/CompareBar';
import RequestProductModal from '@/components/products/RequestProductModal';
import { motion } from 'framer-motion';

export default function Home() {
  const [filters, setFilters] = useState({
    search: '',
    sizeCategory: 'All',
    brand: 'All',
    purchasePrice: [0, 150000],
    rentalPrice: [0, 250],
    sortBy: 'featured',
    gasFree: false,
    ecoMaterials: false,
    familyFriendly: false,
    offGrid: false,
    winterReady: false,
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

    // Purchase price filter
    if (filters.purchasePrice) {
      result = result.filter((p) => {
        const buyPrice = p.buy_from_price || 0;
        return buyPrice >= filters.purchasePrice[0] && buyPrice <= filters.purchasePrice[1];
      });
    }

    // Rental price filter
    if (filters.rentalPrice) {
      result = result.filter((p) => {
        const rentPrice = p.rent_from_price || 0;
        return rentPrice >= filters.rentalPrice[0] && rentPrice <= filters.rentalPrice[1];
      });
    }

    // Quick filters
    if (filters.gasFree) {
      result = result.filter((p) => 
        p.kitchen?.stove_type === 'electric' && 
        p.climate?.stand_heating === 'electric'
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
      result = result.filter((p) => 
        (p.sleeping?.sleeps || 0) >= 4 && 
        p.sit_lounge?.iso_fix && 
        p.sit_lounge.iso_fix !== 'no'
      );
    }

    if (filters.offGrid) {
      result = result.filter((p) => 
        (p.energy?.solar_panel_max_w || 0) >= 100 && 
        (p.energy?.camping_battery_wh || 0) >= 1
      );
    }

    if (filters.winterReady) {
      result = result.filter((p) => p.climate?.insulation === 'yes');
    }

    // Advanced filters
    if (filters.advanced?.model_year) {
      result = result.filter((p) => p.base_vehicle?.model_year >= parseInt(filters.advanced.model_year));
    }
    if (filters.advanced?.min_range) {
      result = result.filter((p) => (p.camper_data?.camper_range_km || 0) >= parseInt(filters.advanced.min_range));
    }
    if (filters.advanced?.min_battery) {
      result = result.filter((p) => (p.base_vehicle?.battery_size_kwh || 0) >= parseInt(filters.advanced.min_battery));
    }
    if (filters.advanced?.drive) {
      result = result.filter((p) => p.base_vehicle?.drive === filters.advanced.drive);
    }
    if (filters.advanced?.min_sleeps) {
      result = result.filter((p) => (p.sleeping?.sleeps || 0) >= parseInt(filters.advanced.min_sleeps));
    }
    if (filters.advanced?.min_storage) {
      result = result.filter((p) => (p.camper_data?.storage_total_l || 0) >= parseInt(filters.advanced.min_storage));
    }
    if (filters.advanced?.stove_type) {
      result = result.filter((p) => p.kitchen?.stove_type?.toLowerCase().includes(filters.advanced.stove_type.toLowerCase()));
    }
    if (filters.advanced?.min_fridge) {
      result = result.filter((p) => (p.kitchen?.fridge_l || 0) >= parseInt(filters.advanced.min_fridge));
    }
    if (filters.advanced?.toilet_type) {
      result = result.filter((p) => p.bathroom?.toilet_type === filters.advanced.toilet_type);
    }
    if (filters.advanced?.shower) {
      result = result.filter((p) => p.bathroom?.shower === filters.advanced.shower);
    }
    if (filters.advanced?.ac) {
      result = result.filter((p) => p.climate?.ac === filters.advanced.ac);
    }
    if (filters.advanced?.stand_heating) {
      result = result.filter((p) => p.climate?.stand_heating === filters.advanced.stand_heating);
    }
    if (filters.advanced?.carplay) {
      result = result.filter((p) => p.smart_connected?.apple_carplay_android_auto === filters.advanced.carplay);
    }
    if (filters.advanced?.rear_camera) {
      result = result.filter((p) => p.smart_connected?.rear_camera === filters.advanced.rear_camera);
    }

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
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto">

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-200">Compare Before You Buy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"> Electric Camper</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
              Compare specs, prices, and features across electric camper vans. Make informed decisions with our comprehensive comparison tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>

                Browse Campers <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline" className="bg-background text-slate-700 px-8 text-sm font-medium rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground h-10 border-white/30 hover:bg-white/10"

                onClick={() => setIsRequestModalOpen(true)}>

                <PlusCircle className="w-5 h-5 mr-2" /> Request a Camper
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 py-8">
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          maxBuyPrice={maxPrice}
          maxRentPrice={250} />


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
              {filteredProducts.map((product) =>
                <ProductCard
                  key={product.id}
                  product={product}
                  onCompare={handleCompare}
                  isInCompare={compareList.some((p) => p.id === product.id)}
                  onClick={() => window.location.href = createPageUrl('ProductDetail') + `?id=${product.id}`}
                />
            )}
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