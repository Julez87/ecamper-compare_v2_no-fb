import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from 'lucide-react';

const LabeledInput = ({ label, value, onChange, ...props }) => (
  <div className="relative">
    {value && (
      <>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{label}:</span>
        <span className="absolute right-[2.5em] top-1/2 -translate-y-1/2 text-sm text-slate-900 font-medium pointer-events-none text-right">{value}</span>
      </>
    )}
    <Input 
      value={value} 
      onChange={onChange} 
      className={value ? 'text-transparent text-right pr-[2.5em]' : 'text-right pr-[2.5em]'} 
      {...props} 
    />
  </div>
);

const LabeledSelect = ({ label, value, onValueChange, children, placeholder, validOptions }) => {
  const isInvalid = value && validOptions && !validOptions.includes(value);
  
  return (
    <div className="relative">
      {value && (
        <>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none z-10">{label}:</span>
          <span className="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-slate-900 font-medium pointer-events-none z-10 text-right">{value}</span>
        </>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`${value ? '[&>span]:text-transparent text-right' : 'text-right'} ${isInvalid ? 'bg-red-50' : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {children}
      </Select>
    </div>
  );
};

const SIZE_CATEGORIES = ["Compact", "Standard", "Large", "XL"];
const BRANDS = ["Citroën", "Fiat", "Ford", "Mercedes-Benz", "Peugeot", "Renault", "VW", "Other"];
const YEARS = Array.from({length: 10}, (_, i) => 2020 + i);
const YES_NO = ["yes", "no", "unknown"];
const YES_NO_ONLY = ["yes", "no"];
const DRIVE_OPTIONS = ["front", "rear", "4x4"];
const CHARGER_TYPES = ["Type2", "CCS", "Type2 / CCS", "unknown"];
const VENTILATION_OPTIONS = ["no", "front window", "rear windows", "rooftop window", "unknown"];
const MOSQUITO_NETS_OPTIONS = ["no", "rooftent", "side windows", "entry", "all", "unknown"];
const SWIVEL_SEATS = ["no", "1", "2", "3", "unknown"];
const LIGHTS_OPTIONS = ["yes", "no", "dimmable", "unknown"];
const CURTAINS_OPTIONS = ["no", "front cabin", "everywhere", "unknown"];
const AWNING_OPTIONS = ["yes", "keder pre-installed", "no", "unknown"];
const TINTED_OPTIONS = ["yes", "partially", "no", "unknown"];
const ISO_FIX_OPTIONS = ["front", "rear", "front & rear", "no", "unknown"];
const FRIDGE_TYPES = ["no", "electric", "gas", "unknown"];
const STOVE_TYPES = ["no", "electric", "gas", "unknown"];
const HEATING_OPTIONS = ["no", "electric", "gas", "unknown"];
const OUTDOOR_COOKING = ["side", "rear", "no", "unknown"];
const TOILET_TYPES = ["chemical", "separation", "no", "unknown"];
const WINDOW_OPENING_OPTIONS = ["electric", "manual", "no", "unknown"];
const TRAILER_HITCH_OPTIONS = ["yes", "no", "retractable", "unknown"];
const BACKDOOR_OPTIONS = ["top-hinged", "side-hinged", "unknown"];
const SLIDING_DOORS_OPTIONS = ["1", "2", "none", "unknown"];
const CARPLAY_OPTIONS = ["yes", "no", "cable", "wireless", "unknown"];
const NAVIGATION_OPTIONS = ["yes", "no", "optional", "unknown"];
const VEHICLE_COOLING_OPTIONS = ["no", "electric", "unknown"];
const CRUISE_CONTROL_OPTIONS = ["yes", "ACC", "no", "unknown"];
const PARKING_SENSORS_OPTIONS = ["no", "front", "rear", "front & rear", "unknown"];

const SOLAR_PANEL_OPTIONS = ["yes", "no", "unknown"];
const WARM_WATER_OPTIONS = ["yes", "no", "unknown"];
const SHOWER_OPTIONS = ["indoor", "outdoor", "no", "unknown"];

export default function CamperAdminForm({ formData, setFormData }) {
  const [newFeature, setNewFeature] = useState('');
  const [newRentalCompany, setNewRentalCompany] = useState('');

  const { data: rentalCompanies = [] } = useQuery({
    queryKey: ['rentalCompanies'],
    queryFn: () => base44.entities.RentalCompany.list()
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value }
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        top_features: [...(prev.top_features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      top_features: prev.top_features.filter((_, i) => i !== index)
    }));
  };

  const addRentalCompany = () => {
    if (newRentalCompany && !formData.rental_companies?.includes(newRentalCompany)) {
      setFormData(prev => ({
        ...prev,
        rental_companies: [...(prev.rental_companies || []), newRentalCompany]
      }));
      setNewRentalCompany('');
    }
  };

  const removeRentalCompany = (company) => {
    setFormData(prev => ({
      ...prev,
      rental_companies: prev.rental_companies.filter(c => c !== company)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Model Name *</Label>
          <Input value={formData.model_name || ''} onChange={(e) => updateField('model_name', e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label>Size Category *</Label>
          <Select value={formData.size_category || ''} onValueChange={(v) => updateField('size_category', v)} required>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>{SIZE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Buy Price from (€)</Label>
          <Input type="number" value={formData.buy_from_price || ''} onChange={(e) => updateField('buy_from_price', e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label>Rent Price from (€/day) - automatic / optional</Label>
          <Input type="number" value={formData.rent_from_price || ''} onChange={(e) => updateField('rent_from_price', e.target.value)} placeholder="Auto-calculated from rental companies" className="mt-1.5" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={formData.is_featured || false} onCheckedChange={(v) => updateField('is_featured', v)} />
          <Label>Featured</Label>
        </div>
        <div className="col-span-2">
          <Label>Image URL</Label>
          <Input value={formData.image_url || ''} onChange={(e) => updateField('image_url', e.target.value)} className="mt-1.5" />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea value={formData.description || ''} onChange={(e) => updateField('description', e.target.value)} className="mt-1.5" rows={2} />
        </div>
      </div>

      {/* Top Features */}
      <div>
        <Label>Top Features (max 5)</Label>
        <div className="flex gap-2 mt-1.5">
          <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="e.g. Longest Range" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
          <Button type="button" variant="outline" onClick={addFeature}><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.top_features?.map((feature, i) => (
            <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700">
              {feature} <button type="button" onClick={() => removeFeature(i)}><X className="w-3 h-3 ml-1" /></button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Rental Companies */}
      <div>
        <Label>Rental Companies</Label>
        <div className="flex gap-2 mt-1.5">
          <Select value={newRentalCompany} onValueChange={setNewRentalCompany}>
            <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
            <SelectContent>
              {rentalCompanies.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={addRentalCompany}><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.rental_companies?.map((company, i) => (
            <Badge key={i} variant="secondary">
              {company} <button type="button" onClick={() => removeRentalCompany(company)}><X className="w-3 h-3 ml-1" /></button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="baseVehicle" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="baseVehicle">Base Vehicle</TabsTrigger>
          <TabsTrigger value="camperDetails">Camper</TabsTrigger>
          <TabsTrigger value="interiorDetails">Interior</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="features">Comfort</TabsTrigger>
        </TabsList>

        <TabsContent value="baseVehicle" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <LabeledSelect label="Brand" value={formData.base_vehicle?.brand || ''} onValueChange={(v) => updateNested('base_vehicle', 'brand', v)} placeholder="Brand" validOptions={BRANDS}>
              <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Model" placeholder="Model" value={formData.base_vehicle?.model || ''} onChange={(e) => updateNested('base_vehicle', 'model', e.target.value)} />
            <LabeledInput label="Version" placeholder="Version" value={formData.base_vehicle?.version || ''} onChange={(e) => updateNested('base_vehicle', 'version', e.target.value)} />
            <LabeledSelect label="Year" value={formData.base_vehicle?.model_year?.toString() || ''} onValueChange={(v) => updateNested('base_vehicle', 'model_year', parseInt(v))} placeholder="Model Year" validOptions={YEARS.map(y => y.toString())}>
              <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="WLTP Range (in km)" type="number" placeholder="WLTP Range (in km)" value={formData.base_vehicle?.wltp_range_km || ''} onChange={(e) => updateNested('base_vehicle', 'wltp_range_km', parseInt(e.target.value))} />
            <LabeledInput label="Engine (in kW)" type="number" placeholder="Engine (in kW)" value={formData.base_vehicle?.kw || ''} onChange={(e) => updateNested('base_vehicle', 'kw', parseInt(e.target.value))} />
            <LabeledInput label="Battery Size (in kWh)" type="number" placeholder="Battery Size (in kWh)" value={formData.base_vehicle?.battery_size_kwh || ''} onChange={(e) => updateNested('base_vehicle', 'battery_size_kwh', parseInt(e.target.value))} />
            <LabeledInput label="Consumption (in kWh/100km)" type="number" step="0.1" placeholder="Consumption (in kWh/100km)" value={formData.base_vehicle?.consumption_kwh_100km || ''} onChange={(e) => updateNested('base_vehicle', 'consumption_kwh_100km', parseFloat(e.target.value))} />
            <LabeledInput label="AC Slow-Charge (max. kW)" type="number" step="0.1" placeholder="AC Slow-Charge (max. kW)" value={formData.base_vehicle?.charging_speed_ac_kw || ''} onChange={(e) => updateNested('base_vehicle', 'charging_speed_ac_kw', parseFloat(e.target.value))} />
            <LabeledInput label="DC Fast-Charge (max. kW)" type="number" step="0.1" placeholder="DC Fast-Charge (max. kW)" value={formData.base_vehicle?.charging_speed_dc_kw || ''} onChange={(e) => updateNested('base_vehicle', 'charging_speed_dc_kw', parseFloat(e.target.value))} />
            <LabeledSelect label="Charger Types" value={formData.base_vehicle?.charger_types || ''} onValueChange={(v) => updateNested('base_vehicle', 'charger_types', v)} placeholder="Charger Types" validOptions={CHARGER_TYPES}>
              <SelectContent>{CHARGER_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="DC Fast-Charging 20-80% (in min)" type="number" placeholder="DC Fast-Charging 20-80% (min)" value={formData.base_vehicle?.dc_fast_charging_20_80_min || ''} onChange={(e) => updateNested('base_vehicle', 'dc_fast_charging_20_80_min', parseInt(e.target.value))} />
            <LabeledInput label="DC Fast-Charging 10-80% (in min)" type="number" placeholder="DC Fast-Charging 10-80% (min)" value={formData.base_vehicle?.dc_fast_charging_10_80_min || ''} onChange={(e) => updateNested('base_vehicle', 'dc_fast_charging_10_80_min', parseInt(e.target.value))} />
            <LabeledInput label="DC Fast-Charging 10-90% (in min)" type="number" placeholder="DC Fast-Charging 10-90% (min)" value={formData.base_vehicle?.dc_fast_charging_10_90_min || ''} onChange={(e) => updateNested('base_vehicle', 'dc_fast_charging_10_90_min', parseInt(e.target.value))} />
            <LabeledInput label="Max. Speed (in km/h)" type="number" placeholder="Max. Speed (km/h)" value={formData.base_vehicle?.max_speed_kmh || ''} onChange={(e) => updateNested('base_vehicle', 'max_speed_kmh', parseInt(e.target.value))} />
            <LabeledInput label="Turning circle (in m)" type="number" step="0.1" placeholder="Turning circle (m)" value={formData.base_vehicle?.turning_circle_m || ''} onChange={(e) => updateNested('base_vehicle', 'turning_circle_m', parseFloat(e.target.value))} />
            <LabeledInput label="AC Slow-Charging (in min)" type="number" placeholder="AC Slow-Charging (min)" value={formData.base_vehicle?.ac_slow_charging_min || ''} onChange={(e) => updateNested('base_vehicle', 'ac_slow_charging_min', parseInt(e.target.value))} />
            <LabeledSelect label="Drive" value={formData.base_vehicle?.drive || ''} onValueChange={(v) => updateNested('base_vehicle', 'drive', v)} placeholder="Drive" validOptions={DRIVE_OPTIONS}>
              <SelectContent>{DRIVE_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Weight Empty (in kg)" type="number" placeholder="Weight Empty (in kg)" value={formData.base_vehicle?.weight_empty_kg || ''} onChange={(e) => updateNested('base_vehicle', 'weight_empty_kg', parseInt(e.target.value))} />
            <LabeledInput label="Max. Additional Weight (in kg)" type="number" placeholder="Max. Additional Weight (in kg)" value={formData.base_vehicle?.max_additional_weight_kg || ''} onChange={(e) => updateNested('base_vehicle', 'max_additional_weight_kg', parseInt(e.target.value))} />
            <LabeledSelect label="B-License" value={formData.base_vehicle?.b_license_approved || ''} onValueChange={(v) => updateNested('base_vehicle', 'b_license_approved', v)} placeholder="B-License (3.5t)" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Trailer Hitch" value={formData.extras?.trailer_hitch || ''} onValueChange={(v) => updateNested('extras', 'trailer_hitch', v)} placeholder="Trailer Hitch" validOptions={TRAILER_HITCH_OPTIONS}>
              <SelectContent>{TRAILER_HITCH_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Towing capacity (in kg)" type="number" placeholder="Towing capacity (kg)" value={formData.base_vehicle?.towing_capacity_kg || ''} onChange={(e) => updateNested('base_vehicle', 'towing_capacity_kg', parseInt(e.target.value))} />
            <LabeledSelect label="Sliding Doors" value={formData.extras?.sliding_doors || ''} onValueChange={(v) => updateNested('extras', 'sliding_doors', v)} placeholder="Sliding Doors" validOptions={SLIDING_DOORS_OPTIONS}>
              <SelectContent>{SLIDING_DOORS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Backdoor" value={formData.extras?.backdoor || ''} onValueChange={(v) => updateNested('extras', 'backdoor', v)} placeholder="Backdoor" validOptions={BACKDOOR_OPTIONS}>
              <SelectContent>{BACKDOOR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>
        </TabsContent>

        <TabsContent value="camperDetails" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Range (realistic) (in km)" type="number" placeholder="Range (realistic) (km)" value={formData.camper_data?.camper_range_km || ''} onChange={(e) => updateNested('camper_data', 'camper_range_km', parseInt(e.target.value))} />
            <LabeledInput label="Length (in mm)" type="number" placeholder="Length (mm)" value={formData.camper_data?.length_mm || ''} onChange={(e) => updateNested('camper_data', 'length_mm', parseInt(e.target.value))} />
            <LabeledInput label="Height (in mm)" type="number" placeholder="Height (mm)" value={formData.camper_data?.height_mm || ''} onChange={(e) => updateNested('camper_data', 'height_mm', parseInt(e.target.value))} />
            <LabeledInput label="Max. width (in mm)" type="number" placeholder="Max. width (mm)" value={formData.camper_data?.width_mm || ''} onChange={(e) => updateNested('camper_data', 'width_mm', parseInt(e.target.value))} />
            <LabeledInput label="Seats (persons)" type="number" placeholder="Seats" value={formData.camper_data?.seats || ''} onChange={(e) => updateNested('camper_data', 'seats', parseInt(e.target.value))} />
            <LabeledInput label="Storage Total (in l)" type="number" placeholder="Storage Total (l)" value={formData.camper_data?.storage_total_l || ''} onChange={(e) => updateNested('camper_data', 'storage_total_l', parseInt(e.target.value))} />
            <LabeledInput label="Storage Shelves (in l)" type="number" placeholder="Storage Shelves (l)" value={formData.camper_data?.storage_shelves_l || ''} onChange={(e) => updateNested('camper_data', 'storage_shelves_l', parseInt(e.target.value))} />
            <LabeledInput label="Storage Trunk (in l)" type="number" placeholder="Storage Trunk (l)" value={formData.camper_data?.storage_trunk_l || ''} onChange={(e) => updateNested('camper_data', 'storage_trunk_l', parseInt(e.target.value))} />
            <LabeledInput label="Storage Other (in l)" type="number" placeholder="Storage Other (l)" value={formData.camper_data?.storage_other_l || ''} onChange={(e) => updateNested('camper_data', 'storage_other_l', parseInt(e.target.value))} />
            <LabeledSelect label="Pop-Up-Roof" value={formData.camper_data?.popup_roof || ''} onValueChange={(v) => updateNested('camper_data', 'popup_roof', v)} placeholder="Pop-Up-Roof" validOptions={YES_NO_ONLY}>
              <SelectContent>{YES_NO_ONLY.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>
        </TabsContent>

        <TabsContent value="interiorDetails" className="space-y-3 mt-4">
          <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Sleeping</h3>
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Sleeps (persons)" type="number" placeholder="Sleeps (persons)" value={formData.sleeping?.sleeps || ''} onChange={(e) => updateNested('sleeping', 'sleeps', parseInt(e.target.value))} />
            <LabeledInput label="Bed Bottom (w x l)" placeholder="Bed Bottom (w x l)" value={formData.sleeping?.bed_size_bottom_cm || ''} onChange={(e) => updateNested('sleeping', 'bed_size_bottom_cm', e.target.value)} />
            <LabeledInput label="Bed Rooftop (w x l)" placeholder="Bed Rooftop (w x l)" value={formData.sleeping?.bed_size_rooftop_cm || ''} onChange={(e) => updateNested('sleeping', 'bed_size_rooftop_cm', e.target.value)} />
            <LabeledSelect label="Ventilation" value={formData.sleeping?.ventilation || ''} onValueChange={(v) => updateNested('sleeping', 'ventilation', v)} placeholder="Ventilation" validOptions={VENTILATION_OPTIONS}>
              <SelectContent>{VENTILATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Mosquito Nets" value={formData.sleeping?.rooftop_mosquito_nets || ''} onValueChange={(v) => updateNested('sleeping', 'rooftop_mosquito_nets', v)} placeholder="Mosquito Nets" validOptions={MOSQUITO_NETS_OPTIONS}>
              <SelectContent>{MOSQUITO_NETS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>

          <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide pt-4">Sitting & Lounging</h3>
          <div className="grid grid-cols-2 gap-3">
            <LabeledSelect label="Swivel Seats" value={formData.sit_lounge?.swivel_front_seats || ''} onValueChange={(v) => updateNested('sit_lounge', 'swivel_front_seats', v)} placeholder="Swivel Seats" validOptions={SWIVEL_SEATS}>
              <SelectContent>{SWIVEL_SEATS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Indoor Table" value={formData.sit_lounge?.indoor_table || ''} onValueChange={(v) => updateNested('sit_lounge', 'indoor_table', v)} placeholder="Indoor Table" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Outdoor Table" value={formData.sit_lounge?.outdoor_table || ''} onValueChange={(v) => updateNested('sit_lounge', 'outdoor_table', v)} placeholder="Outdoor Table" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="ISO-Fix" value={formData.sit_lounge?.iso_fix || ''} onValueChange={(v) => updateNested('sit_lounge', 'iso_fix', v)} placeholder="ISO-Fix" validOptions={ISO_FIX_OPTIONS}>
              <SelectContent>{ISO_FIX_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Tinted Windows" value={formData.sit_lounge?.tinted_windows || ''} onValueChange={(v) => updateNested('sit_lounge', 'tinted_windows', v)} placeholder="Tinted Windows" validOptions={TINTED_OPTIONS}>
              <SelectContent>{TINTED_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Curtains" value={formData.sit_lounge?.curtains || ''} onValueChange={(v) => updateNested('sit_lounge', 'curtains', v)} placeholder="Curtains" validOptions={CURTAINS_OPTIONS}>
              <SelectContent>{CURTAINS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Awning" value={formData.sit_lounge?.awning || ''} onValueChange={(v) => updateNested('sit_lounge', 'awning', v)} placeholder="Awning" validOptions={AWNING_OPTIONS}>
              <SelectContent>{AWNING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Indoor Lights" value={formData.sit_lounge?.indoor_lights || ''} onValueChange={(v) => updateNested('sit_lounge', 'indoor_lights', v)} placeholder="Indoor Lights" validOptions={LIGHTS_OPTIONS}>
              <SelectContent>{LIGHTS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>

          <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide pt-4">Cooking</h3>
          <div className="grid grid-cols-2 gap-3">
            <LabeledSelect label="Fridge Type" value={formData.kitchen?.fridge_type || ''} onValueChange={(v) => updateNested('kitchen', 'fridge_type', v)} placeholder="Fridge Type" validOptions={FRIDGE_TYPES}>
              <SelectContent>{FRIDGE_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Fridge (in l)" type="number" placeholder="Fridge (in l)" value={formData.kitchen?.fridge_l || ''} onChange={(e) => updateNested('kitchen', 'fridge_l', parseInt(e.target.value))} />
            <LabeledSelect label="Stove Type" value={formData.kitchen?.stove_type || ''} onValueChange={(v) => updateNested('kitchen', 'stove_type', v)} placeholder="Stove Type" validOptions={STOVE_TYPES}>
              <SelectContent>{STOVE_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Stove Plates" type="number" placeholder="Stove Plates" value={formData.kitchen?.stove_plates || ''} onChange={(e) => updateNested('kitchen', 'stove_plates', parseInt(e.target.value))} />
            <LabeledInput label="Stove Energy (in W)" type="number" placeholder="Stove Energy (W)" value={formData.kitchen?.stove_energy_w || ''} onChange={(e) => updateNested('kitchen', 'stove_energy_w', parseInt(e.target.value))} />
            <LabeledSelect label="Indoor Cooking" value={formData.kitchen?.indoor_cooking || ''} onValueChange={(v) => updateNested('kitchen', 'indoor_cooking', v)} placeholder="Indoor Cooking" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Outdoor Cooking" value={formData.kitchen?.outdoor_cooking || ''} onValueChange={(v) => updateNested('kitchen', 'outdoor_cooking', v)} placeholder="Outdoor Cooking" validOptions={OUTDOOR_COOKING}>
              <SelectContent>{OUTDOOR_COOKING.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>

          <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide pt-4">Water</h3>
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Fresh Water (in l)" type="number" placeholder="Fresh Water (in l)" value={formData.bathroom?.fresh_water_l || ''} onChange={(e) => updateNested('bathroom', 'fresh_water_l', parseInt(e.target.value))} />
            <LabeledInput label="Waste Water (in l)" type="number" placeholder="Waste Water (in l)" value={formData.bathroom?.waste_water_l || ''} onChange={(e) => updateNested('bathroom', 'waste_water_l', parseInt(e.target.value))} />
            <LabeledInput label="Warm Water (in l)" type="number" placeholder="Warm Water (in l)" value={formData.bathroom?.warm_water_l || ''} onChange={(e) => updateNested('bathroom', 'warm_water_l', parseInt(e.target.value))} />
            <LabeledSelect label="Warm Water" value={formData.bathroom?.warm_water_available || ''} onValueChange={(v) => updateNested('bathroom', 'warm_water_available', v)} placeholder="Warm Water" validOptions={WARM_WATER_OPTIONS}>
              <SelectContent>{WARM_WATER_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Shower" value={formData.bathroom?.shower || ''} onValueChange={(v) => updateNested('bathroom', 'shower', v)} placeholder="Shower" validOptions={SHOWER_OPTIONS}>
              <SelectContent>{SHOWER_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Warm Shower" value={formData.bathroom?.warm_shower || ''} onValueChange={(v) => updateNested('bathroom', 'warm_shower', v)} placeholder="Warm Shower" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Toilet Type" value={formData.bathroom?.toilet_type || ''} onValueChange={(v) => updateNested('bathroom', 'toilet_type', v)} placeholder="Toilet Type" validOptions={TOILET_TYPES}>
              <SelectContent>{TOILET_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>

          <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide pt-4">Materials</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <LabeledInput label="Furniture Materials" placeholder="Furniture Materials" value={formData.eco_scoring?.furniture_materials || ''} onChange={(e) => updateNested('eco_scoring', 'furniture_materials', e.target.value)} />
              <div className="flex items-center gap-2 mt-1.5">
                <Switch checked={formData.eco_scoring?.furniture_materials_eco || false} onCheckedChange={(v) => updateNested('eco_scoring', 'furniture_materials_eco', v)} />
                <Label className="text-xs text-slate-600">Eco Material</Label>
              </div>
            </div>
            <div>
              <LabeledInput label="Flooring Materials" placeholder="Flooring Materials" value={formData.eco_scoring?.flooring_material || ''} onChange={(e) => updateNested('eco_scoring', 'flooring_material', e.target.value)} />
              <div className="flex items-center gap-2 mt-1.5">
                <Switch checked={formData.eco_scoring?.flooring_material_eco || false} onCheckedChange={(v) => updateNested('eco_scoring', 'flooring_material_eco', v)} />
                <Label className="text-xs text-slate-600">Eco Material</Label>
              </div>
            </div>
            <div>
              <LabeledInput label="Insulation Materials" placeholder="Insulation Materials" value={formData.eco_scoring?.insulation_material || ''} onChange={(e) => updateNested('eco_scoring', 'insulation_material', e.target.value)} />
              <div className="flex items-center gap-2 mt-1.5">
                <Switch checked={formData.eco_scoring?.insulation_material_eco || false} onCheckedChange={(v) => updateNested('eco_scoring', 'insulation_material_eco', v)} />
                <Label className="text-xs text-slate-600">Eco Material</Label>
              </div>
            </div>
            <div>
              <LabeledInput label="Textile Materials" placeholder="Textile Materials" value={formData.eco_scoring?.textile_material || ''} onChange={(e) => updateNested('eco_scoring', 'textile_material', e.target.value)} />
              <div className="flex items-center gap-2 mt-1.5">
                <Switch checked={formData.eco_scoring?.textile_material_eco || false} onCheckedChange={(v) => updateNested('eco_scoring', 'textile_material_eco', v)} />
                <Label className="text-xs text-slate-600">Eco Material</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="energy" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Camping Battery (in Wh)" type="number" placeholder="Camping Battery (Wh)" value={formData.energy?.camping_battery_wh || ''} onChange={(e) => updateNested('energy', 'camping_battery_wh', parseInt(e.target.value))} />
            <LabeledSelect label="Solar Panel" value={formData.energy?.solar_panel_available || ''} onValueChange={(v) => updateNested('energy', 'solar_panel_available', v)} placeholder="Solar Panel" validOptions={SOLAR_PANEL_OPTIONS}>
              <SelectContent>{SOLAR_PANEL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Solar Panel (max. W)" type="number" placeholder="Solar Panel (max. W)" value={formData.energy?.solar_panel_max_w || ''} onChange={(e) => updateNested('energy', 'solar_panel_max_w', parseInt(e.target.value))} />
            <LabeledInput label="Charge via Solar (in Wh)" type="number" placeholder="Charge via Solar (in Wh)" value={formData.energy?.battery_charging_solar_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_solar_wh', parseInt(e.target.value))} />
            <LabeledInput label="Charge via Vehicle Battery (in Wh)" type="number" placeholder="Charge via Vehicle Battery (in Wh)" value={formData.energy?.battery_charging_hv_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_hv_wh', parseInt(e.target.value))} />
            <LabeledInput label="Charge while driving (in W)" type="number" placeholder="Charge while driving (in W)" value={formData.energy?.battery_charging_driving_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_driving_wh', parseInt(e.target.value))} />
            <LabeledInput label="Charge via Landline (in Wh)" type="number" placeholder="Charge via Landline (in Wh)" value={formData.energy?.battery_charging_landline_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_landline_wh', parseInt(e.target.value))} />
            <LabeledInput label="Max. Output AC 12V (in W)" type="number" placeholder="Max. Output AC 12V (W)" value={formData.energy?.max_battery_output_ac_12v_w || ''} onChange={(e) => updateNested('energy', 'max_battery_output_ac_12v_w', parseInt(e.target.value))} />
            <LabeledInput label="AC Plugs (230V Schuko)" type="number" placeholder="AC Plugs (230V Schuko)" value={formData.energy?.battery_output_plugs_ac || ''} onChange={(e) => updateNested('energy', 'battery_output_plugs_ac', parseInt(e.target.value))} />
            <LabeledInput label="Max. Output DC 230V (in W)" type="number" placeholder="Max. Output DC 230V (in W)" value={formData.energy?.max_battery_output_dc_230v_w || ''} onChange={(e) => updateNested('energy', 'max_battery_output_dc_230v_w', parseInt(e.target.value))} />
            <LabeledInput label="DC Plugs (12V)" type="number" placeholder="DC Plugs (12V)" value={formData.energy?.battery_output_plugs_dc || ''} onChange={(e) => updateNested('energy', 'battery_output_plugs_dc', parseInt(e.target.value))} />
            <LabeledInput label="USB(-C) plugs Cockpit" type="number" placeholder="USB(-C) plugs Cockpit" value={formData.energy?.usb_c_plugs_front || ''} onChange={(e) => updateNested('energy', 'usb_c_plugs_front', parseInt(e.target.value))} />
            <LabeledInput label="USB(-C) plugs Living" type="number" placeholder="USB(-C) plugs Living" value={formData.energy?.usb_c_plugs_livingroom || ''} onChange={(e) => updateNested('energy', 'usb_c_plugs_livingroom', parseInt(e.target.value))} />
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-3 mt-4">
          <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Climate</h3>
          <div className="grid grid-cols-2 gap-3">
            <LabeledSelect label="Air Conditioning" value={formData.climate?.ac || ''} onValueChange={(v) => updateNested('climate', 'ac', v)} placeholder="Air Conditioning" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Climate Programming" value={formData.climate?.vehicle_climate_programming || ''} onValueChange={(v) => updateNested('climate', 'vehicle_climate_programming', v)} placeholder="Climate Programming" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Vehicle Heating" value={formData.climate?.vehicle_heating || ''} onValueChange={(v) => updateNested('climate', 'vehicle_heating', v)} placeholder="Vehicle Heating" validOptions={HEATING_OPTIONS}>
              <SelectContent>{HEATING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Vehicle Cooling" value={formData.climate?.vehicle_cooling || ''} onValueChange={(v) => updateNested('climate', 'vehicle_cooling', v)} placeholder="Vehicle Cooling" validOptions={VEHICLE_COOLING_OPTIONS}>
              <SelectContent>{VEHICLE_COOLING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Stand Heating" value={formData.climate?.stand_heating || ''} onValueChange={(v) => updateNested('climate', 'stand_heating', v)} placeholder="Stand Heating" validOptions={HEATING_OPTIONS}>
              <SelectContent>{HEATING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Living Room Heating" value={formData.climate?.living_room_heating || ''} onValueChange={(v) => updateNested('climate', 'living_room_heating', v)} placeholder="Living Room Heating" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Insulation" value={formData.climate?.insulation || ''} onValueChange={(v) => updateNested('climate', 'insulation', v)} placeholder="Insulation" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Seat Heating" value={formData.climate?.seat_heating || ''} onValueChange={(v) => updateNested('climate', 'seat_heating', v)} placeholder="Seat Heating" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Steering Wheel Heating" value={formData.climate?.steering_wheel_heating || ''} onValueChange={(v) => updateNested('climate', 'steering_wheel_heating', v)} placeholder="Steering Wheel Heating" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Front Windows Opening" value={formData.climate?.front_windows_opening_electric || ''} onValueChange={(v) => updateNested('climate', 'front_windows_opening_electric', v)} placeholder="Front Windows Opening" validOptions={WINDOW_OPENING_OPTIONS}>
              <SelectContent>{WINDOW_OPENING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Rear Windows Opening" value={formData.climate?.rear_windows_opening || ''} onValueChange={(v) => updateNested('climate', 'rear_windows_opening', v)} placeholder="Rear Windows Opening" validOptions={WINDOW_OPENING_OPTIONS}>
              <SelectContent>{WINDOW_OPENING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Back Window Opening" value={formData.climate?.back_window_opening || ''} onValueChange={(v) => updateNested('climate', 'back_window_opening', v)} placeholder="Back Window Opening" validOptions={WINDOW_OPENING_OPTIONS}>
              <SelectContent>{WINDOW_OPENING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>

          </div>

          <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide pt-4">Smart & Connected</h3>
          <div className="grid grid-cols-2 gap-3">
            <LabeledSelect label="Remote App Access" value={formData.smart_connected?.remote_app_access || ''} onValueChange={(v) => updateNested('smart_connected', 'remote_app_access', v)} placeholder="Remote App Access" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="CarPlay / Android Auto" value={formData.smart_connected?.apple_carplay_android_auto || ''} onValueChange={(v) => updateNested('smart_connected', 'apple_carplay_android_auto', v)} placeholder="CarPlay / Android Auto" validOptions={CARPLAY_OPTIONS}>
              <SelectContent>{CARPLAY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Navigation" value={formData.smart_connected?.navigation_software || ''} onValueChange={(v) => updateNested('smart_connected', 'navigation_software', v)} placeholder="Navigation" validOptions={NAVIGATION_OPTIONS}>
              <SelectContent>{NAVIGATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Cruise Control" value={formData.smart_connected?.cruise_control || ''} onValueChange={(v) => updateNested('smart_connected', 'cruise_control', v)} placeholder="Cruise Control" validOptions={CRUISE_CONTROL_OPTIONS}>
              <SelectContent>{CRUISE_CONTROL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Parking Sensors" value={formData.smart_connected?.parking_sensors || ''} onValueChange={(v) => updateNested('smart_connected', 'parking_sensors', v)} placeholder="Parking Sensors" validOptions={PARKING_SENSORS_OPTIONS}>
              <SelectContent>{PARKING_SENSORS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Lane Assist" value={formData.smart_connected?.lane_assist || ''} onValueChange={(v) => updateNested('smart_connected', 'lane_assist', v)} placeholder="Lane Assist" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Sign Recognition" value={formData.smart_connected?.sign_recognition || ''} onValueChange={(v) => updateNested('smart_connected', 'sign_recognition', v)} placeholder="Sign Recognition" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Rear Camera" value={formData.smart_connected?.rear_camera || ''} onValueChange={(v) => updateNested('smart_connected', 'rear_camera', v)} placeholder="Rear Camera" validOptions={YES_NO}>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}