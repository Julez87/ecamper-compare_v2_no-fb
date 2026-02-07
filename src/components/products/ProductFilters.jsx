import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, SlidersHorizontal, Wind, Leaf, Users, ChevronDown, Zap, Snowflake } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const SIZE_CATEGORIES = [
  { value: "All", label: "All" },
  { value: "Compact", label: "Size S" },
  { value: "Standard", label: "Size M" },
  { value: "Large", label: "Size L" },
  { value: "XL", label: "Size XL" }
];
const BRANDS = ["All", "VW", "Mercedes", "Fiat", "Peugeot", "Citroën", "Ford", "Renault", "Other"];

export default function ProductFilters({ filters, setFilters, maxBuyPrice = 150000, maxRentPrice = 250, products = [] }) {
  const [showMoreVehicle, setShowMoreVehicle] = useState(false);
  const [showMoreCamper, setShowMoreCamper] = useState(false);
  const [showMoreKitchen, setShowMoreKitchen] = useState(false);
  const [showMoreBathroom, setShowMoreBathroom] = useState(false);
  const [showMoreClimate, setShowMoreClimate] = useState(false);
  const [showMoreSmart, setShowMoreSmart] = useState(false);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Extract all available model years from products
  const availableYears = [...new Set(products
    .map(p => p.base_vehicle?.model_year)
    .filter(Boolean)
  )].sort((a, b) => b - a);

  // Get max range from products
  const maxRange = Math.max(...products.map(p => p.camper_data?.camper_range_km || 0), 500);
  const maxStorage = Math.max(...products.map(p => p.camper_data?.storage_total_l || 0), 1000);
  const maxFridge = Math.max(...products.map(p => p.kitchen?.fridge_l || 0), 100);

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
      offGrid: false,
      winterReady: false,
      advanced: {}
    });
  };

  const hasActiveFilters = filters.search || filters.sizeCategory !== 'All' || filters.brand !== 'All' || 
    (filters.purchasePrice && (filters.purchasePrice[0] > 0 || filters.purchasePrice[1] < maxBuyPrice)) || 
    (filters.rentalPrice && (filters.rentalPrice[0] > 0 || filters.rentalPrice[1] < maxRentPrice)) ||
    filters.gasFree || filters.ecoMaterials || filters.familyFriendly || filters.offGrid || filters.winterReady ||
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
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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
          Purchasing Price Range: €{(filters.purchasePrice?.[0] || 0).toLocaleString()} - €{(filters.purchasePrice?.[1] || maxBuyPrice).toLocaleString()}
        </label>
        <Slider
          value={filters.purchasePrice || [0, maxBuyPrice]}
          onValueChange={(v) => updateFilter('purchasePrice', v)}
          max={maxBuyPrice}
          step={2500}
          className="py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-3 block">
          Rental Price Range: €{filters.rentalPrice?.[0] || 0} - €{filters.rentalPrice?.[1] || maxRentPrice}/day
        </label>
        <Slider
          value={filters.rentalPrice || [0, maxRentPrice]}
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
      <Separator className="my-6" />
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-slate-900 hover:text-emerald-600 transition-colors group">
          <span>Advanced Filters</span>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-all group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</div>
          
          {/* Model Year Pills */}
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Model Year</label>
            <div className="flex flex-wrap gap-2">
              {availableYears.slice(0, showMoreVehicle ? availableYears.length : 6).map(year => (
                <Badge
                  key={year}
                  variant={filters.advanced?.model_year === year ? "default" : "outline"}
                  className={`cursor-pointer ${filters.advanced?.model_year === year ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-slate-100'}`}
                  onClick={() => updateFilter('advanced', {
                    ...filters.advanced, 
                    model_year: filters.advanced?.model_year === year ? undefined : year
                  })}
                >
                  {year}
                </Badge>
              ))}
            </div>
          </div>

          {/* Min Range Slider */}
          <div>
            <label className="text-sm text-slate-600 mb-3 block">
              Min. Range (realistic): {filters.advanced?.min_range || 0} km
            </label>
            <Slider
              value={[filters.advanced?.min_range || 0]}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, min_range: v[0]})}
              max={maxRange}
              step={10}
              className="py-2"
            />
          </div>

          {/* Drive Type Dropdown */}
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

          {showMoreVehicle && (
            <>
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
            </>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMoreVehicle(!showMoreVehicle)}
            className="w-full text-emerald-600 hover:text-emerald-700"
          >
            {showMoreVehicle ? 'Show Less' : 'More'}
          </Button>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Camper</div>

          {/* Min Storage Slider */}
          <div>
            <label className="text-sm text-slate-600 mb-3 block">
              Min. Storage: {filters.advanced?.min_storage || 0} L
            </label>
            <Slider
              value={[filters.advanced?.min_storage || 0]}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, min_storage: v[0]})}
              max={maxStorage}
              step={50}
              className="py-2"
            />
          </div>

          {showMoreCamper && (
            <>
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
            </>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMoreCamper(!showMoreCamper)}
            className="w-full text-emerald-600 hover:text-emerald-700"
          >
            {showMoreCamper ? 'Show Less' : 'More'}
          </Button>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Kitchen</div>

          {/* Min Fridge Size Slider */}
          <div>
            <label className="text-sm text-slate-600 mb-3 block">
              Min. Fridge Size: {filters.advanced?.min_fridge || 0} L
            </label>
            <Slider
              value={[filters.advanced?.min_fridge || 0]}
              onValueChange={(v) => updateFilter('advanced', {...filters.advanced, min_fridge: v[0]})}
              max={maxFridge}
              step={5}
              className="py-2"
            />
          </div>

          {showMoreKitchen && (
            <>
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
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMoreKitchen(!showMoreKitchen)}
            className="w-full text-emerald-600 hover:text-emerald-700"
          >
            {showMoreKitchen ? 'Show Less' : 'More'}
          </Button>

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

          {showMoreBathroom && (
            <>
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
            </>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMoreBathroom(!showMoreBathroom)}
            className="w-full text-emerald-600 hover:text-emerald-700"
          >
            {showMoreBathroom ? 'Show Less' : 'More'}
          </Button>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Climate</div>

          {/* Air Conditioning Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ac"
              checked={filters.advanced?.ac === 'yes'}
              onCheckedChange={(checked) => updateFilter('advanced', {...filters.advanced, ac: checked ? 'yes' : undefined})}
            />
            <label htmlFor="ac" className="text-sm text-slate-600 cursor-pointer">
              Air Conditioning
            </label>
          </div>

          {showMoreClimate && (
            <>
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
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMoreClimate(!showMoreClimate)}
            className="w-full text-emerald-600 hover:text-emerald-700"
          >
            {showMoreClimate ? 'Show Less' : 'More'}
          </Button>

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
                <SelectItem value="cable">Cable</SelectItem>
                <SelectItem value="wireless">Wireless</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showMoreSmart && (
            <>
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
            </>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMoreSmart(!showMoreSmart)}
            className="w-full text-emerald-600 hover:text-emerald-700"
          >
            {showMoreSmart ? 'Show Less' : 'More'}
          </Button>
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
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search Camper"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-12 h-12 text-base bg-slate-50 border-0 focus-visible:ring-violet-500"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-3">
          <Select value={filters.sizeCategory} onValueChange={(v) => updateFilter('sizeCategory', v)}>
            <SelectTrigger className="w-36 bg-white border-slate-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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

        {/* Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="border-slate-200 h-12 px-6">
              <SlidersHorizontal className="w-5 h-5 mr-2" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 pb-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Top Filters Title */}
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Top Filters</div>
      
      {/* Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
        <Button 
          variant={filters.offGrid ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter('offGrid', !filters.offGrid)}
          className={filters.offGrid ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          <Zap className="w-4 h-4 mr-1" /> Off-Grid
        </Button>
        <Button 
          variant={filters.winterReady ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter('winterReady', !filters.winterReady)}
          className={filters.winterReady ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          <Snowflake className="w-4 h-4 mr-1" /> Winter Ready
        </Button>
      </div>
    </div>
  );
}