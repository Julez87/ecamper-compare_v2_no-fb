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
  ArrowLeft, Star, Check, X, Scale, Share2, ExternalLink,
  Cpu, HardDrive, Battery, Monitor, Wifi, Weight
} from 'lucide-react';
import { motion } from 'framer-motion';

const specIcons = {
  processor: Cpu,
  storage: HardDrive,
  battery_life: Battery,
  display_size: Monitor,
  connectivity: Wifi,
  weight: Weight,
  ram: HardDrive
};

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
    queryKey: ['relatedProducts', product?.category],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ category: product.category });
      return products.filter(p => p.id !== productId).slice(0, 4);
    },
    enabled: !!product?.category
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
                <Badge className="bg-slate-900 text-white">{product.category}</Badge>
                {product.is_featured && (
                  <Badge className="bg-violet-600 text-white">Featured</Badge>
                )}
              </div>
              <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">{product.brand}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-900">{product.rating}</span>
                </div>
              )}
              {product.release_year && (
                <span className="text-slate-500">Released {product.release_year}</span>
              )}
            </div>

            <div className="text-4xl font-bold text-slate-900">
              ${product.price?.toLocaleString()}
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

            {/* Tabs */}
            <Tabs defaultValue="specs" className="mt-8">
              <TabsList className="bg-slate-100 p-1 rounded-full">
                <TabsTrigger value="specs" className="rounded-full px-6">Specifications</TabsTrigger>
                <TabsTrigger value="pros-cons" className="rounded-full px-6">Pros & Cons</TabsTrigger>
              </TabsList>

              <TabsContent value="specs" className="mt-6">
                <Card className="p-6 border-0 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    {product.specs && Object.entries(product.specs).map(([key, value]) => {
                      if (!value || value === 'N/A') return null;
                      const Icon = specIcons[key] || Monitor;
                      return (
                        <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Icon className="w-5 h-5 text-violet-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="font-semibold text-slate-900">{value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="pros-cons" className="mt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {product.pros?.length > 0 && (
                    <Card className="p-6 border-0 shadow-sm">
                      <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5" /> Pros
                      </h3>
                      <ul className="space-y-2">
                        {product.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700">
                            <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  {product.cons?.length > 0 && (
                    <Card className="p-6 border-0 shadow-sm">
                      <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                        <X className="w-5 h-5" /> Cons
                      </h3>
                      <ul className="space-y-2">
                        {product.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700">
                            <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
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
                      <p className="text-xs text-slate-500">{p.brand}</p>
                      <p className="font-medium text-slate-900 truncate">{p.name}</p>
                      <p className="font-bold text-slate-900 mt-1">${p.price?.toLocaleString()}</p>
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