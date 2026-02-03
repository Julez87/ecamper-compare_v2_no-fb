import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X, SlidersHorizontal, Wind, Leaf, Users, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SIZE_CATEGORIES = ["All", "Compact", "Standard", "Large", "XL"];
const BRANDS = ["All", "VW", "Mercedes", "Fiat", "Peugeot", "Citroën", "Ford", "Renault", "Other"];

export default function ProductFilters({ filters, setFilters, maxBuyPrice = 150000, maxRentPrice = 250 }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sizeCategory: 'All',
      brand: 'All',
      purchasePrice: [0, maxBuyPrice],
      rentalPrice: [0, maxRentPrice],
      sortBy: 'featured',
      gasFree: false,
      ecoMaterials: false,
      familyFriendly: false,
      advanced: {}
    });
  };

  const hasActiveFilters = filters.search || filters.sizeCategory !== 'All' || filters.brand !== 'All' || 
    filters.purchasePrice[0] > 0 || filters.purchasePrice[1] < maxBuyPrice || 
    filters.rentalPrice[0] > 0 || filters.rentalPrice[1] < maxRentPrice ||
    filters.gasFree || filters.ecoMaterials || filters.familyFriendly ||
    Object.keys(filters.advanced || {}).length > 0;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Size Category</label>
        <Select value={filters.sizeCategory} onValueChange={(v) => updateFilter('sizeCategory', v)}>
          <SelectTrigger className="w-full bg-white border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZE_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Brand</label>
        <Select value={filters.brand} onValueChange={(v) => updateFilter('brand', v)}>
          <SelectTrigger className="w-full bg-white border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BRANDS.map(brand => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-3 block">
          Purchasing Price Range: €{filters.purchasePrice[0].toLocaleString()} - €{filters.purchasePrice[1].toLocaleString()}
        </label>
        <Slider
          value={filters.purchasePrice}
          onValueChange={(v) => updateFilter('purchasePrice', v)}
          max={maxBuyPrice}
          step={2500}
          className="py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-3 block">
          Rental Price Range: €{filters.rentalPrice[0]} - €{filters.rentalPrice[1]}/day
        </label>
        <Slider
          value={filters.rentalPrice}
          onValueChange={(v) => updateFilter('rentalPrice', v)}
          max={maxRentPrice}
          step={5}
          className="py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Sort By</label>
        <Select value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v)}>
          <SelectTrigger className="w-full bg-white border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-buy-low">Buy Price: Low to High</SelectItem>
            <SelectItem value="price-buy-high">Buy Price: High to Low</SelectItem>
            <SelectItem value="price-rent-low">Rent Price: Low to High</SelectItem>
            <SelectItem value="price-rent-high">Rent Price: High to Low</SelectItem>
            <SelectItem value="range">Longest Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            Advanced Filters
            <ChevronDown className="w-4 h-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Model Year</label>
            <Input 
              type="number" 
              placeholder="e.g. 2024"
              value={filters.advanced?.model_year || ''}
              onChange={(e) => updateFilter('advanced', {...filters.advanced, model_year: e.target.value})}
              className="bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Min Range (km)</label>
            <Input 
              type="number" 
              placeholder="e.g. 300"
              value={filters.advanced?.min_range || ''}
              onChange={(e) => updateFilter('advanced', {...filters.advanced, min_range: e.target.value})}
              className="bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Min Battery (kWh)</label>
            <Input 
              type="number" 
              placeholder="e.g. 75"
              value={filters.advanced?.min_battery || ''}
              onChange={(e) => updateFilter('advanced', {...filters.advanced, min_battery: e.target.value})}
              className="bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Drive Type</label>
            <Select 
              value={filters.advanced?.drive || 'all'}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, drive: v === 'all' ? undefined : v})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="front">Front</SelectItem>
                <SelectItem value="rear">Rear</SelectItem>
                <SelectItem value="4x4">4x4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Camper</div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Min Sleeps</label>
            <Input 
              type="number" 
              placeholder="e.g. 2"
              value={filters.advanced?.min_sleeps || ''}
              onChange={(e) => updateFilter('advanced', {...filters.advanced, min_sleeps: e.target.value})}
              className="bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Min Storage (L)</label>
            <Input 
              type="number" 
              placeholder="e.g. 500"
              value={filters.advanced?.min_storage || ''}
              onChange={(e) => updateFilter('advanced', {...filters.advanced, min_storage: e.target.value})}
              className="bg-white"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Kitchen</div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Stove Type</label>
            <Select 
              value={filters.advanced?.stove_type || 'all'}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, stove_type: v === 'all' ? undefined : v})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
                <SelectItem value="Gas">Gas</SelectItem>
                <SelectItem value="Electric & Gas">Electric & Gas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Min Fridge Size (L)</label>
            <Input 
              type="number" 
              placeholder="e.g. 40"
              value={filters.advanced?.min_fridge || ''}
              onChange={(e) => updateFilter('advanced', {...filters.advanced, min_fridge: e.target.value})}
              className="bg-white"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Bathroom</div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Toilet Type</label>
            <Select 
              value={filters.advanced?.toilet_type || 'all'}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, toilet_type: v === 'all' ? undefined : v})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="chemical">Chemical</SelectItem>
                <SelectItem value="separation">Separation</SelectItem>
                <SelectItem value="no">No Toilet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Shower</label>
            <Select 
              value={filters.advanced?.shower || 'all'}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, shower: v === 'all' ? undefined : v})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Climate</div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Air Conditioning</label>
            <Select 
              value={filters.advanced?.ac || 'all'}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, ac: v === 'all' ? undefined : v})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Stand Heating</label>
            <Select 
              value={filters.advanced?.stand_heating || 'all'}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, stand_heating: v === 'all' ? undefined : v})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Smart & Connected</div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Apple CarPlay / Android Auto</label>
            <Select 
              value={filters.advanced?.carplay || 'all'}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, carplay: v === 'all' ? undefined : v})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1.5 block">Rear Camera</label>
            <Select 
              value={filters.advanced?.rear_camera || 'all'}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, rear_camera: v === 'all' ? undefined : v})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          className="w-full text-slate-600 hover:text-slate-900"
          onClick={clearFilters}
        >
          <X className="w-4 h-4 mr-2" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-slate-50 border-0 focus-visible:ring-violet-500"
          />
        </div>

        {/* Quick Filters Pills */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Button 
            variant={filters.gasFree ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('gasFree', !filters.gasFree)}
            className={filters.gasFree ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            <Wind className="w-4 h-4 mr-1" /> Gas-Free
          </Button>
          <Button 
            variant={filters.ecoMaterials ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('ecoMaterials', !filters.ecoMaterials)}
            className={filters.ecoMaterials ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            <Leaf className="w-4 h-4 mr-1" /> Eco Materials
          </Button>
          <Button 
            variant={filters.familyFriendly ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('familyFriendly', !filters.familyFriendly)}
            className={filters.familyFriendly ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            <Users className="w-4 h-4 mr-1" /> Family Friendly
          </Button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-3">
          <Select value={filters.sizeCategory} onValueChange={(v) => updateFilter('sizeCategory', v)}>
            <SelectTrigger className="w-36 bg-white border-slate-200">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.brand} onValueChange={(v) => updateFilter('brand', v)}>
            <SelectTrigger className="w-36 bg-white border-slate-200">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              {BRANDS.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v)}>
            <SelectTrigger className="w-48 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-buy-low">Buy: Low to High</SelectItem>
              <SelectItem value="price-buy-high">Buy: High to Low</SelectItem>
              <SelectItem value="price-rent-low">Rent: Low to High</SelectItem>
              <SelectItem value="price-rent-high">Rent: High to Low</SelectItem>
              <SelectItem value="range">Longest Range</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden border-slate-200">
              <SlidersHorizontal className="w-5 h-5 mr-2" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Quick Filters */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-1">
        <Button 
          variant={filters.gasFree ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter('gasFree', !filters.gasFree)}
          className={filters.gasFree ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          <Wind className="w-4 h-4 mr-1" /> Gas-Free
        </Button>
        <Button 
          variant={filters.ecoMaterials ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter('ecoMaterials', !filters.ecoMaterials)}
          className={filters.ecoMaterials ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          <Leaf className="w-4 h-4 mr-1" /> Eco Materials
        </Button>
        <Button 
          variant={filters.familyFriendly ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter('familyFriendly', !filters.familyFriendly)}
          className={filters.familyFriendly ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          <Users className="w-4 h-4 mr-1" /> Family Friendly
        </Button>
      </div>
    </div>
  );
}