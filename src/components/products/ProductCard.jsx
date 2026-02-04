import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Check, Award, Wind, Leaf, Users, Zap, Snowflake } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function ProductCard({ product, onCompare, isInCompare, onClick }) {
  const { data: allCompanies = [] } = useQuery({
    queryKey: ['rentalCompanies'],
    queryFn: () => base44.entities.RentalCompany.list()
  });

  const productCompanies = allCompanies.filter(company => 
    company.available_campers?.some(c => c.camper_id === product.id)
  );

  // Check which smart filters apply
  const smartFilters = [];
  
  if (product.kitchen?.stove_type === 'electric' && product.climate?.stand_heating === 'electric') {
    smartFilters.push({ icon: Wind, label: 'Gas-Free' });
  }
  if (product.eco_scoring?.furniture_materials_eco || product.eco_scoring?.flooring_material_eco || 
      product.eco_scoring?.insulation_material_eco || product.eco_scoring?.textile_material_eco) {
    smartFilters.push({ icon: Leaf, label: 'Eco Materials' });
  }
  if ((product.sleeping?.sleeps || 0) >= 4 && product.sit_lounge?.iso_fix && product.sit_lounge.iso_fix !== 'no') {
    smartFilters.push({ icon: Users, label: 'Family Friendly' });
  }
  if ((product.energy?.solar_panel_max_w || 0) >= 100 && (product.energy?.camping_battery_wh || 0) >= 1) {
    smartFilters.push({ icon: Zap, label: 'Off-Grid' });
  }
  if (product.climate?.insulation === 'yes') {
    smartFilters.push({ icon: Snowflake, label: 'Winter Ready' });
  }

  const sizeLabel = product.size_category ? `Size ${product.size_category.charAt(0)}` : 'Camper Van';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
        onClick={onClick}
      >
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[calc(100%-1.5rem)]">
          {smartFilters.map((filter, i) => {
            const Icon = filter.icon;
            return (
              <Badge key={i} className="bg-emerald-600 text-white text-xs font-medium px-2 py-0.5 flex items-center gap-1">
                <Icon className="w-3 h-3" /> {filter.label}
              </Badge>
            );
          })}
        </div>

        {product.is_featured && (
          <div className="absolute bottom-3 right-3 z-10">
            <Badge className="bg-violet-600 text-white text-xs font-medium px-2 py-0.5">
              Featured
            </Badge>
          </div>
        )}

        <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden relative">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.model_name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200">
              <span className="text-4xl font-bold text-slate-400">🚐</span>
            </div>
          )}
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-slate-900 text-white text-xs font-medium px-2 py-0.5">
              Category: {sizeLabel}
            </Badge>
          </div>
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">
            {product.base_vehicle?.brand || 'Electric Camper'}
          </p>
          <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-3 line-clamp-2">
            {product.model_name}
          </h3>
          
          {/* Top Features Pills */}
          {product.top_features?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.top_features.slice(0, 5).map((feature, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                  <Award className="w-3 h-3" /> {feature}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="space-y-2 mb-4 mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500">Buy from</span>
              <span className="text-xl font-bold text-slate-900">
                €{product.buy_from_price?.toLocaleString() || '—'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500">Rent from</span>
              <span className="text-lg font-semibold text-emerald-600">
                €{product.rent_from_price?.toLocaleString() || '—'}/day
              </span>
            </div>
          </div>
          
          {/* Rental Companies */}
          {productCompanies.length > 0 && (
            <div className="space-y-2 mb-4 pt-3 border-t">
              <p className="text-xs text-slate-500 font-medium">Available at:</p>
              <div className="flex flex-wrap gap-2">
                {productCompanies.map((company) => {
                  const companyData = company.available_campers?.find(c => c.camper_id === product.id);
                  return (
                    <button
                      key={company.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (company.website_url) window.open(company.website_url, '_blank');
                      }}
                      className="text-xs text-white px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105 hover:shadow-md"
                      style={{ backgroundColor: company.color || '#3B82F6' }}
                      title={companyData?.rent_price ? `€${companyData.rent_price}/day` : company.name}
                    >
                      {company.name}
                      {companyData?.rent_price && (
                        <span className="ml-1 opacity-90">€{companyData.rent_price}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <Button
            size="sm"
            variant={isInCompare ? "default" : "outline"}
            className={`w-full rounded-full transition-all duration-200 ${
              isInCompare 
                ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                : 'border-slate-200 hover:border-violet-600 hover:text-violet-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onCompare(product);
            }}
          >
            {isInCompare ? (
              <><Check className="w-4 h-4 mr-1" /> Added</>
            ) : (
              <><Plus className="w-4 h-4 mr-1" /> Compare</>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}