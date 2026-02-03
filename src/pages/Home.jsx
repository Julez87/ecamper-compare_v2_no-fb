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
    category: 'All',
    brand: 'All',
    priceRange: [0, 5000],
    sortBy: 'featured'
  });
  const [compareList, setCompareList] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(search) || 
        p.brand?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    if (filters.category !== 'All') {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.brand !== 'All') {
      result = result.filter(p => p.brand === filters.brand);
    }

    result = result.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [products, filters]);

  const handleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, product];
    });
  };

  const maxPrice = Math.max(...products.map(p => p.price || 0), 5000);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-200">Compare Before You Buy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400"> Tech</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
              Compare specs, prices, and features across hundreds of products. Make informed decisions with our comprehensive comparison tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Products <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 rounded-full px-8"
                onClick={() => setIsRequestModalOpen(true)}
              >
                <PlusCircle className="w-5 h-5 mr-2" /> Request a Product
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
          maxPrice={maxPrice}
        />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600">
              <span className="font-semibold text-slate-900">{filteredProducts.length}</span> products found
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
              <Button 
                variant="outline"
                onClick={() => setIsRequestModalOpen(true)}
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Request a Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
                  <ProductCard
                    product={product}
                    onCompare={handleCompare}
                    isInCompare={compareList.some(p => p.id === product.id)}
                    onClick={() => {}}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compare Bar */}
      <div className={compareList.length > 0 ? 'pb-24' : ''}>
        <CompareBar
          compareList={compareList}
          onRemove={(id) => setCompareList(prev => prev.filter(p => p.id !== id))}
          onClear={() => setCompareList([])}
        />
      </div>

      {/* Request Modal */}
      <RequestProductModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />
    </div>
  );
}