import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X, SlidersHorizontal, Wind, Leaf, Users } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SIZE_CATEGORIES = ["All", "Compact", "Standard", "Large", "XL"];
const BRANDS = ["All", "VW", "Mercedes", "Fiat", "Peugeot", "Citroën", "Ford", "Renault", "Other"];

export default function ProductFilters({ filters, setFilters, maxPrice = 5000 }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sizeCategory: 'All',
      brand: 'All',
      priceRange: [0, maxPrice],
      sortBy: 'featured',
      gasFree: false,
      ecoMaterials: false,
      familyFriendly: false
    });
  };

  const hasActiveFilters = filters.search || filters.sizeCategory !== 'All' || filters.brand !== 'All' || 
    filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice || filters.gasFree || filters.ecoMaterials || filters.familyFriendly;

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
          Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </label>
        <Slider
          value={filters.priceRange}
          onValueChange={(v) => updateFilter('priceRange', v)}
          max={maxPrice}
          step={50}
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