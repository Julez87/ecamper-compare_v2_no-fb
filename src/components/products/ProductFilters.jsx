import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, SlidersHorizontal, Flame, Leaf, Users, ChevronDown, Zap, Snowflake, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import FeedbackTrigger from '@/components/feedback/FeedbackTrigger';
import FeedbackModal from '@/components/feedback/FeedbackModal';

const SIZE_CATEGORIES = [
  { value: "All", label: "All Sizes" },
  { value: "Compact", label: "Size S" },
  { value: "Standard", label: "Size M" },
  { value: "Large", label: "Size L" },
  { value: "XL", label: "Size XL" }
];
const BRANDS = ["All", "VW", "Mercedes", "Fiat", "Peugeot", "Citroën", "Ford", "Renault", "Other"];

const SORT_LABELS = {
  featured: "Featured",
  "price-buy-low": "Buy: Low→High",
  "price-buy-high": "Buy: High→Low",
  "price-rent-low": "Rent: Low→High",
  "price-rent-high": "Rent: High→Low",
  range: "Longest Range"
};
const SIZE_LABELS = { All: "All", Compact: "S", Standard: "M", Large: "L", XL: "XL" };

// ── Helpers ──
function YesCheck({ id, label, value, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={value === 'yes'} onCheckedChange={c => onChange(c ? 'yes' : undefined)} />
      <label htmlFor={id} className="text-sm text-slate-600 cursor-pointer">{label}</label>
    </div>
  );
}
function EnumSel({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm text-slate-600 mb-1.5 block">{label}</label>
      <Select value={value || 'all'} onValueChange={v => onChange(v === 'all' ? undefined : v)}>
        <SelectTrigger className="bg-white"><SelectValue placeholder="All" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
function MinNum({ label, unit, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm text-slate-600 mb-1.5 block">{label}{unit ? ` (${unit})` : ''}</label>
      <Input type="number" placeholder={placeholder || "Min"} value={value || ''} onChange={e => onChange(e.target.value || undefined)} className="bg-white" />
    </div>
  );
}
function MinSlide({ label, unit, value, onChange, max, step = 1 }) {
  return (
    <div>
      <label className="text-sm text-slate-600 mb-3 block">{label}: {value || 0}{unit ? ` ${unit}` : ''}</label>
      <Slider value={[value || 0]} onValueChange={v => onChange(v[0] || undefined)} max={max} step={step} className="py-2" />
    </div>
  );
}
function SectionHead({ children }) {
  return (
    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-slate-900 hover:text-emerald-600 transition-colors group">
      <span>{children}</span>
      <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-all group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  );
}

export default function ProductFilters({ filters, setFilters, maxBuyPrice = 150000, maxRentPrice = 250, products = [] }) {
  const [openSections, setOpenSections] = useState({});
  const [showMore, setShowMore] = useState({});
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSentiment, setFeedbackSentiment] = useState(null);

  const openFeedback = (sentiment) => {
    setFeedbackSentiment(sentiment);
    setFeedbackOpen(true);
  };

  const toggle = key => setOpenSections(p => ({ ...p, [key]: !p[key] }));
  const toggleMore = key => setShowMore(p => ({ ...p, [key]: !p[key] }));

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const updateAdv = (key, value) => setFilters(prev => ({ ...prev, advanced: { ...prev.advanced, [key]: value } }));
  const adv = filters.advanced || {};

  const availableYears = [...new Set(products.map(p => p.base_vehicle?.model_year).filter(Boolean))].sort((a, b) => b - a);
  const maxRange = Math.max(...products.map(p => p.camper_data?.camper_range_km || 0), 500);
  const maxStorage = Math.max(...products.map(p => p.camper_data?.storage_total_l || 0), 1000);
  const maxFridge = Math.max(...products.map(p => p.kitchen?.fridge_l || 0), 100);
  const maxCampingBattery = Math.max(...products.map(p => p.energy?.camping_battery_wh || 0), 5000);

  const clearFilters = () => {
    setFilters({
      search: '', sizeCategory: 'All', brand: 'All',
      purchasePrice: [0, maxBuyPrice], rentalPrice: [0, maxRentPrice],
      sortBy: 'featured', gasFree: false, ecoMaterials: false,
      familyFriendly: false, offGrid: false, winterReady: false,
      heightUnder2m: false, advanced: {}
    });
  };

  const hasActiveFilters = filters.search || filters.sizeCategory !== 'All' || filters.brand !== 'All' ||
    (filters.purchasePrice && (filters.purchasePrice[0] > 0 || filters.purchasePrice[1] < maxBuyPrice)) ||
    (filters.rentalPrice && (filters.rentalPrice[0] > 0 || filters.rentalPrice[1] < maxRentPrice)) ||
    filters.gasFree || filters.ecoMaterials || filters.familyFriendly || filters.offGrid || filters.winterReady || filters.heightUnder2m ||
    Object.values(adv).some(v => v !== undefined);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Basic */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Size Category</label>
        <Select value={filters.sizeCategory} onValueChange={v => updateFilter('sizeCategory', v)}>
          <SelectTrigger className="w-full bg-white border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>{SIZE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Brand</label>
        <Select value={filters.brand} onValueChange={v => updateFilter('brand', v)}>
          <SelectTrigger className="w-full bg-white border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-3 block">
          Purchase Price: €{(filters.purchasePrice?.[0] || 0).toLocaleString()} – €{(filters.purchasePrice?.[1] || maxBuyPrice).toLocaleString()}
        </label>
        <Slider value={filters.purchasePrice || [0, maxBuyPrice]} onValueChange={v => updateFilter('purchasePrice', v)} max={maxBuyPrice} step={2500} className="py-2" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-3 block">
          Rental Price: €{filters.rentalPrice?.[0] || 0} – €{filters.rentalPrice?.[1] || maxRentPrice}/day
        </label>
        <Slider value={filters.rentalPrice || [0, maxRentPrice]} onValueChange={v => updateFilter('rentalPrice', v)} max={maxRentPrice} step={5} className="py-2" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Sort By</label>
        <Select value={filters.sortBy} onValueChange={v => updateFilter('sortBy', v)}>
          <SelectTrigger className="w-full bg-white border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(SORT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Separator className="my-6" />

      {/* ═══ BASE VEHICLE ═══ */}
      <Collapsible open={openSections.vehicle} onOpenChange={() => toggle('vehicle')}>
        <SectionHead>Base Vehicle</SectionHead>
        <CollapsibleContent className="mt-4 space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          {/* TOP: Model Year, Max Consumption, Drive Type, B-License */}
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Model Year</label>
            <div className="flex flex-wrap gap-2">
              {availableYears.map(year => (
                <Badge key={year} variant={adv.model_year === year ? "default" : "outline"}
                  className={`cursor-pointer ${adv.model_year === year ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-slate-100'}`}
                  onClick={() => updateAdv('model_year', adv.model_year === year ? undefined : year)}
                >{year}</Badge>
              ))}
            </div>
          </div>
          <MinNum label="Max. Consumption" unit="kWh/100km" value={adv.max_consumption} onChange={v => updateAdv('max_consumption', v)} placeholder="e.g. 25" />
          <EnumSel label="Drive Type" value={adv.drive} onChange={v => updateAdv('drive', v)}
            options={[{value:"front",label:"Front"},{value:"rear",label:"Rear"},{value:"4x4",label:"4x4"}]} />
          <EnumSel label="B-License (3.5t)" value={adv.b_license} onChange={v => updateAdv('b_license', v)}
            options={[{value:"yes",label:"Yes"},{value:"no",label:"No"}]} />

          {/* MORE */}
          {showMore.vehicle && (
            <>
              <MinNum label="Min. WLTP Range" unit="km" value={adv.min_wltp_range} onChange={v => updateAdv('min_wltp_range', v)} placeholder="e.g. 200" />
              <MinNum label="Min. Battery Size" unit="kWh" value={adv.min_battery} onChange={v => updateAdv('min_battery', v)} placeholder="e.g. 75" />
              <MinNum label="Min. Engine Power" unit="kW" value={adv.min_kw} onChange={v => updateAdv('min_kw', v)} placeholder="e.g. 100" />
              <MinNum label="Min. AC Charge Speed" unit="kW" value={adv.min_ac_charge} onChange={v => updateAdv('min_ac_charge', v)} />
              <MinNum label="Min. DC Charge Speed" unit="kW" value={adv.min_dc_charge} onChange={v => updateAdv('min_dc_charge', v)} />
              <EnumSel label="Charger Types" value={adv.charger_types} onChange={v => updateAdv('charger_types', v)}
                options={[{value:"Type2",label:"Type2"},{value:"CCS",label:"CCS"},{value:"Type2 / CCS",label:"Type2 / CCS"}]} />
              <MinNum label="Max. DC 20-80% Time" unit="min" value={adv.max_dc_20_80} onChange={v => updateAdv('max_dc_20_80', v)} />
              <MinNum label="Min. Max Speed" unit="km/h" value={adv.min_max_speed} onChange={v => updateAdv('min_max_speed', v)} />
              <MinNum label="Max. Turning Circle" unit="m" value={adv.max_turning_circle} onChange={v => updateAdv('max_turning_circle', v)} />
              <MinNum label="Max. Empty Weight" unit="kg" value={adv.max_weight_empty} onChange={v => updateAdv('max_weight_empty', v)} />
              <MinNum label="Min. Additional Weight" unit="kg" value={adv.min_additional_weight} onChange={v => updateAdv('min_additional_weight', v)} />
              <YesCheck id="trailer_hitch" label="Trailer Hitch" value={adv.trailer_hitch} onChange={v => updateAdv('trailer_hitch', v)} />
              <YesCheck id="sliding_doors" label="Sliding Doors" value={adv.sliding_doors} onChange={v => updateAdv('sliding_doors', v)} />
              <YesCheck id="backdoor" label="Backdoor" value={adv.backdoor} onChange={v => updateAdv('backdoor', v)} />
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => toggleMore('vehicle')} className="w-full text-emerald-600 hover:text-emerald-700">
            {showMore.vehicle ? 'Show Less' : 'More'}
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ CAMPER DETAILS ═══ */}
      <Collapsible open={openSections.camper} onOpenChange={() => toggle('camper')}>
        <SectionHead>Camper Details</SectionHead>
        <CollapsibleContent className="mt-4 space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          {/* TOP: Range, Seats, Sleeps, Pop-Up-Roof */}
          <MinSlide label="Min. Range (realistic)" unit="km" value={adv.min_range} onChange={v => updateAdv('min_range', v)} max={maxRange} step={10} />
          <MinSlide label="Min. Seats" unit="" value={adv.min_seats} onChange={v => updateAdv('min_seats', v)} max={8} step={1} />
          <MinSlide label="Min. Sleeps" unit="" value={adv.min_sleeps} onChange={v => updateAdv('min_sleeps', v)} max={6} step={1} />
          <YesCheck id="popup_roof" label="Pop-Up-Roof" value={adv.popup_roof} onChange={v => updateAdv('popup_roof', v)} />

          {/* MORE */}
          {showMore.camper && (
            <>
              <MinNum label="Max. Length" unit="mm" value={adv.max_length} onChange={v => updateAdv('max_length', v)} placeholder="e.g. 6000" />
              <MinNum label="Max. Height" unit="mm" value={adv.max_height} onChange={v => updateAdv('max_height', v)} placeholder="e.g. 2000" />
              <MinNum label="Max. Width" unit="mm" value={adv.max_width} onChange={v => updateAdv('max_width', v)} placeholder="e.g. 2100" />
              <MinSlide label="Min. Total Storage" unit="L" value={adv.min_storage_total} onChange={v => updateAdv('min_storage_total', v)} max={maxStorage} step={50} />
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => toggleMore('camper')} className="w-full text-emerald-600 hover:text-emerald-700">
            {showMore.camper ? 'Show Less' : 'More'}
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ INTERIOR ═══ */}
      <Collapsible open={openSections.interior} onOpenChange={() => toggle('interior')}>
        <SectionHead>Interior</SectionHead>
        <CollapsibleContent className="mt-4 space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          {/* TOP: Awning, Outdoor Cooking, Indoor Cooking */}
          <EnumSel label="Awning" value={adv.awning} onChange={v => updateAdv('awning', v)}
            options={[{value:"yes",label:"Yes"},{value:"keder pre-installed",label:"Keder Pre-installed"},{value:"no",label:"No"}]} />
          <EnumSel label="Outdoor Cooking" value={adv.outdoor_cooking} onChange={v => updateAdv('outdoor_cooking', v)}
            options={[{value:"side",label:"Side"},{value:"rear",label:"Rear"},{value:"no",label:"No"}]} />
          <YesCheck id="indoor_cooking" label="Indoor Cooking" value={adv.indoor_cooking} onChange={v => updateAdv('indoor_cooking', v)} />

          {/* MORE */}
          {showMore.interior && (
            <>
              <Separator />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sleeping</p>
              <EnumSel label="Ventilation" value={adv.ventilation} onChange={v => updateAdv('ventilation', v)}
                options={[{value:"no",label:"No"},{value:"front window",label:"Front Window"},{value:"rear windows",label:"Rear Windows"},{value:"rooftop window",label:"Rooftop Window"}]} />
              <EnumSel label="Mosquito Nets" value={adv.mosquito_nets} onChange={v => updateAdv('mosquito_nets', v)}
                options={[{value:"no",label:"No"},{value:"rooftent",label:"Rooftent"},{value:"side windows",label:"Side Windows"},{value:"entry",label:"Entry"},{value:"all",label:"All"}]} />

              <Separator />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sitting & Lounging</p>
              <EnumSel label="Swivel Front Seats" value={adv.swivel_seats} onChange={v => updateAdv('swivel_seats', v)}
                options={[{value:"no",label:"No"},{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"}]} />
              <YesCheck id="indoor_table" label="Indoor Table" value={adv.indoor_table} onChange={v => updateAdv('indoor_table', v)} />
              <YesCheck id="outdoor_table" label="Outdoor Table" value={adv.outdoor_table} onChange={v => updateAdv('outdoor_table', v)} />
              <EnumSel label="ISO-Fix" value={adv.iso_fix} onChange={v => updateAdv('iso_fix', v)}
                options={[{value:"no",label:"No"},{value:"front",label:"Front"},{value:"rear",label:"Rear"},{value:"front & rear",label:"Front & Rear"}]} />
              <EnumSel label="Tinted Windows" value={adv.tinted_windows} onChange={v => updateAdv('tinted_windows', v)}
                options={[{value:"yes",label:"Yes"},{value:"partially",label:"Partially"},{value:"no",label:"No"}]} />
              <EnumSel label="Curtains" value={adv.curtains} onChange={v => updateAdv('curtains', v)}
                options={[{value:"no",label:"No"},{value:"front cabin",label:"Front Cabin"},{value:"everywhere",label:"Everywhere"}]} />
              <EnumSel label="Indoor Lights" value={adv.indoor_lights} onChange={v => updateAdv('indoor_lights', v)}
                options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"dimmable",label:"Dimmable"}]} />

              <Separator />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cooking</p>
              <EnumSel label="Fridge Type" value={adv.fridge_type} onChange={v => updateAdv('fridge_type', v)}
                options={[{value:"no",label:"No"},{value:"electric",label:"Electric"},{value:"gas",label:"Gas"}]} />
              <MinSlide label="Min. Fridge Size" unit="L" value={adv.min_fridge} onChange={v => updateAdv('min_fridge', v)} max={maxFridge} step={5} />
              <EnumSel label="Stove Type" value={adv.stove_type} onChange={v => updateAdv('stove_type', v)}
                options={[{value:"no",label:"No"},{value:"electric",label:"Electric"},{value:"gas",label:"Gas"}]} />

              <Separator />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Water & Bathroom</p>
              <MinNum label="Min. Fresh Water" unit="L" value={adv.min_fresh_water} onChange={v => updateAdv('min_fresh_water', v)} />
              <YesCheck id="warm_water" label="Warm Water" value={adv.warm_water} onChange={v => updateAdv('warm_water', v)} />
              <EnumSel label="Shower" value={adv.shower} onChange={v => updateAdv('shower', v)}
                options={[{value:"indoor",label:"Indoor"},{value:"outdoor",label:"Outdoor"},{value:"no",label:"No"}]} />
              <YesCheck id="warm_shower" label="Warm Shower" value={adv.warm_shower} onChange={v => updateAdv('warm_shower', v)} />
              <EnumSel label="Toilet Type" value={adv.toilet_type} onChange={v => updateAdv('toilet_type', v)}
                options={[{value:"chemical",label:"Chemical"},{value:"separation",label:"Separation"},{value:"no",label:"No Toilet"}]} />

              <Separator />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Materials</p>
              <div className="flex items-center space-x-2">
                <Checkbox id="eco_materials_adv" checked={filters.ecoMaterials} onCheckedChange={c => updateFilter('ecoMaterials', c)} />
                <label htmlFor="eco_materials_adv" className="text-sm text-slate-600 cursor-pointer">Eco Materials Only</label>
              </div>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => toggleMore('interior')} className="w-full text-emerald-600 hover:text-emerald-700">
            {showMore.interior ? 'Show Less' : 'More'}
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ ENERGY ═══ */}
      <Collapsible open={openSections.energy} onOpenChange={() => toggle('energy')}>
        <SectionHead>Energy</SectionHead>
        <CollapsibleContent className="mt-4 space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          {/* TOP: Solar Panel, Camping Battery, AC Plugs 230V */}
          <YesCheck id="solar_panel" label="Solar Panel" value={adv.solar_panel_available} onChange={v => updateAdv('solar_panel_available', v)} />
          <MinSlide label="Min. Camping Battery" unit="Wh" value={adv.min_camping_battery} onChange={v => updateAdv('min_camping_battery', v)} max={maxCampingBattery} step={100} />
          <MinNum label="Min. AC Plugs (230V Schuko)" value={adv.min_ac_plugs} onChange={v => updateAdv('min_ac_plugs', v)} placeholder="e.g. 1" />

          {/* MORE */}
          {showMore.energy && (
            <>
              <MinNum label="Min. Solar Panel Power" unit="W" value={adv.min_solar_w} onChange={v => updateAdv('min_solar_w', v)} />
              <MinNum label="Min. USB-C Plugs (Cockpit)" value={adv.min_usb_front} onChange={v => updateAdv('min_usb_front', v)} />
              <MinNum label="Min. USB-C Plugs (Living)" value={adv.min_usb_living} onChange={v => updateAdv('min_usb_living', v)} />
              <div className="flex items-center space-x-2">
                <Checkbox id="gas_free_adv" checked={filters.gasFree} onCheckedChange={c => updateFilter('gasFree', c)} />
                <label htmlFor="gas_free_adv" className="text-sm text-slate-600 cursor-pointer">Gas-Free</label>
              </div>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => toggleMore('energy')} className="w-full text-emerald-600 hover:text-emerald-700">
            {showMore.energy ? 'Show Less' : 'More'}
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ COMFORT ═══ */}
      <Collapsible open={openSections.comfort} onOpenChange={() => toggle('comfort')}>
        <SectionHead>Comfort</SectionHead>
        <CollapsibleContent className="mt-4 space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          {/* TOP: Vehicle Heating, Vehicle Cooling, Insulation, CarPlay/Android Auto */}
          <EnumSel label="Vehicle Heating" value={adv.vehicle_heating} onChange={v => updateAdv('vehicle_heating', v)}
            options={[{value:"no",label:"No"},{value:"electric",label:"Electric"},{value:"gas",label:"Gas"}]} />
          <EnumSel label="Vehicle Cooling" value={adv.vehicle_cooling} onChange={v => updateAdv('vehicle_cooling', v)}
            options={[{value:"no",label:"No"},{value:"electric",label:"Electric"}]} />
          <YesCheck id="insulation" label="Insulation" value={adv.insulation} onChange={v => updateAdv('insulation', v)} />
          <EnumSel label="CarPlay / Android Auto" value={adv.carplay} onChange={v => updateAdv('carplay', v)}
            options={[{value:"yes",label:"Yes"},{value:"cable",label:"Cable"},{value:"wireless",label:"Wireless"},{value:"no",label:"No"}]} />

          {/* MORE */}
          {showMore.comfort && (
            <>
              <Separator />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Climate</p>
              <YesCheck id="ac" label="Air Conditioning" value={adv.ac} onChange={v => updateAdv('ac', v)} />
              <YesCheck id="climate_prog" label="Climate Programming" value={adv.vehicle_climate_programming} onChange={v => updateAdv('vehicle_climate_programming', v)} />
              <EnumSel label="Stand Heating" value={adv.stand_heating} onChange={v => updateAdv('stand_heating', v)}
                options={[{value:"no",label:"No"},{value:"electric",label:"Electric"},{value:"gas",label:"Gas"}]} />
              <YesCheck id="living_heating" label="Living Room Heating" value={adv.living_room_heating} onChange={v => updateAdv('living_room_heating', v)} />
              <YesCheck id="seat_heating" label="Seat Heating" value={adv.seat_heating} onChange={v => updateAdv('seat_heating', v)} />
              <YesCheck id="steering_heating" label="Steering Wheel Heating" value={adv.steering_wheel_heating} onChange={v => updateAdv('steering_wheel_heating', v)} />

              <Separator />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Smart & Connected</p>
              <YesCheck id="remote_app" label="Remote App Access" value={adv.remote_app_access} onChange={v => updateAdv('remote_app_access', v)} />
              <EnumSel label="Navigation" value={adv.navigation} onChange={v => updateAdv('navigation', v)}
                options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"optional",label:"Optional"}]} />
              <EnumSel label="Cruise Control" value={adv.cruise_control} onChange={v => updateAdv('cruise_control', v)}
                options={[{value:"yes",label:"Yes"},{value:"ACC",label:"ACC"},{value:"no",label:"No"}]} />
              <YesCheck id="lane_assist" label="Lane Assist" value={adv.lane_assist} onChange={v => updateAdv('lane_assist', v)} />
              <YesCheck id="sign_recognition" label="Sign Recognition" value={adv.sign_recognition} onChange={v => updateAdv('sign_recognition', v)} />
              <YesCheck id="rear_camera" label="Rear Camera" value={adv.rear_camera} onChange={v => updateAdv('rear_camera', v)} />
              <EnumSel label="Parking Sensors" value={adv.parking_sensors} onChange={v => updateAdv('parking_sensors', v)}
                options={[{value:"no",label:"No"},{value:"front",label:"Front"},{value:"rear",label:"Rear"},{value:"front & rear",label:"Front & Rear"}]} />
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => toggleMore('comfort')} className="w-full text-emerald-600 hover:text-emerald-700">
            {showMore.comfort ? 'Show Less' : 'More'}
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {hasActiveFilters && (
        <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-900" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" /> Clear all filters
        </Button>
      )}

      {/* Feedback at bottom of filters panel */}
      <div className="flex justify-center pt-4 border-t border-slate-100">
        <FeedbackTrigger topic="Filters" onOpen={openFeedback} />
      </div>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        sentiment={feedbackSentiment}
        defaultTopic="Filters"
      />
    </div>
  );

  const sizeLabel = SIZE_LABELS[filters.sizeCategory] || "All";
  const brandLabel = filters.brand === "All" ? "All" : filters.brand;
  const sortLabel = SORT_LABELS[filters.sortBy] || "Featured";

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input placeholder="Search Camper" value={filters.search} onChange={e => updateFilter('search', e.target.value)}
            className="pl-12 h-12 text-base bg-slate-50 border-0 focus-visible:ring-violet-500" />
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-3">
          <Select value={filters.sizeCategory} onValueChange={v => updateFilter('sizeCategory', v)}>
            <SelectTrigger className="w-40 bg-white border-slate-200">
              <span className="text-slate-500 mr-1">Size:</span> {sizeLabel}
            </SelectTrigger>
            <SelectContent>{SIZE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>

          <Select value={filters.brand} onValueChange={v => updateFilter('brand', v)}>
            <SelectTrigger className="w-44 bg-white border-slate-200">
              <span className="text-slate-500 mr-1">Brand:</span> {brandLabel}
            </SelectTrigger>
            <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={v => updateFilter('sortBy', v)}>
            <SelectTrigger className="w-52 bg-white border-slate-200">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Sort:</span> {sortLabel}
              </div>
            </SelectTrigger>
            <SelectContent>{Object.entries(SORT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}><X className="w-4 h-4" /></Button>
          )}
        </div>

        {/* Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="border-slate-200 h-12 px-6">
              <SlidersHorizontal className="w-5 h-5 mr-2" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-6 pb-6"><FilterContent /></div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Top Filters */}
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Top Filters</div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Button variant={filters.gasFree ? "default" : "outline"} size="sm" onClick={() => updateFilter('gasFree', !filters.gasFree)}
          className={filters.gasFree ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
          <Flame className="w-4 h-4 mr-1" /> Gas-Free
        </Button>
        <Button variant={filters.ecoMaterials ? "default" : "outline"} size="sm" onClick={() => updateFilter('ecoMaterials', !filters.ecoMaterials)}
          className={filters.ecoMaterials ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
          <Leaf className="w-4 h-4 mr-1" /> Eco Materials
        </Button>
        <Button variant={filters.familyFriendly ? "default" : "outline"} size="sm" onClick={() => updateFilter('familyFriendly', !filters.familyFriendly)}
          className={filters.familyFriendly ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
          <Users className="w-4 h-4 mr-1" /> Family Friendly
        </Button>
        <Button variant={filters.offGrid ? "default" : "outline"} size="sm" onClick={() => updateFilter('offGrid', !filters.offGrid)}
          className={filters.offGrid ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
          <Zap className="w-4 h-4 mr-1" /> Off-Grid
        </Button>
        <Button variant={filters.winterReady ? "default" : "outline"} size="sm" onClick={() => updateFilter('winterReady', !filters.winterReady)}
          className={filters.winterReady ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
          <Snowflake className="w-4 h-4 mr-1" /> Winter Ready
        </Button>
        <Button variant={filters.heightUnder2m ? "default" : "outline"} size="sm" onClick={() => updateFilter('heightUnder2m', !filters.heightUnder2m)}
          className={filters.heightUnder2m ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
          <ArrowDown className="w-4 h-4 mr-1" /> Height &lt;2m
        </Button>
        <div className="ml-auto shrink-0">
          <FeedbackTrigger topic="Browsing Campers" onOpen={openFeedback} />
        </div>
      </div>
    </div>
  );
}