import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
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
    sortBy: 'featured'
  });
  const [compareList, setCompareList] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const navigate = useNavigate();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.released === true);

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

    /*result = result.filter((p) => {
      const buyPrice = p.buy_from_price || 0;
      return buyPrice >= filters.priceRange[0] && buyPrice <= filters.priceRange[1];
    });*/

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
        onPolaroidClick={(productId) => navigate(createPageUrl("ProductDetail") + `?id=${productId}`)}
      />

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 py-8">
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          maxPrice={maxPrice} />


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