import React, { useState } from 'react';
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

const LabeledSelect = ({ label, value, onValueChange, children, placeholder }) => (
  <div className="relative">
    {value && (
      <>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none z-10">{label}:</span>
        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-slate-900 font-medium pointer-events-none z-10 text-right">{value}</span>
      </>
    )}
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={value ? '[&>span]:text-transparent text-right' : 'text-right'}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      {children}
    </Select>
  </div>
);

const SIZE_CATEGORIES = ["Compact", "Standard", "Large", "XL"];
const BRANDS = ["VW", "Mercedes", "Fiat", "Peugeot", "Citroën", "Ford", "Renault", "Other"];
const YEARS = Array.from({length: 10}, (_, i) => 2020 + i);
const YES_NO = ["yes", "no", "unknown"];
const DRIVE_OPTIONS = ["front", "rear", "4x4"];
const CHARGER_TYPES = ["Type2", "CCS", "Type2 / CCS"];
const VENTILATION_OPTIONS = ["Front Windows", "Rear Windows", "Rooftop", "Front & Rear Windows", "All"];
const SWIVEL_SEATS = ["no", "1", "2", "3"];
const LIGHTS_OPTIONS = ["yes", "no", "dimmable"];
const CURTAINS_OPTIONS = ["yes", "no", "partially"];
const TINTED_OPTIONS = ["yes", "no", "partially"];
const ISO_FIX_OPTIONS = ["front", "rear", "front & rear", "no"];
const FRIDGE_TYPES = ["Electric", "Gas", "Electric & Gas"];
const STOVE_TYPES = ["Electric", "Gas", "Electric & Gas"];
const OUTDOOR_COOKING = ["side", "rear", "no"];
const TOILET_TYPES = ["chemical", "separation", "no"];
const RENTAL_COMPANIES = ["Roadsurfer", "Indie Campers", "Campanda", "McRent", "Outbase", "Tonke", "Ventje"];

export default function CamperAdminForm({ formData, setFormData }) {
  const [newFeature, setNewFeature] = useState('');
  const [newRentalCompany, setNewRentalCompany] = useState('');

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
          <Label>Buy Price (€)</Label>
          <Input type="number" value={formData.buy_from_price || ''} onChange={(e) => updateField('buy_from_price', e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label>Rent Price (€/day)</Label>
          <Input type="number" value={formData.rent_from_price || ''} onChange={(e) => updateField('rent_from_price', e.target.value)} className="mt-1.5" />
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
            <SelectContent>{RENTAL_COMPANIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
      <Tabs defaultValue="vehicle" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="camper">Camper</TabsTrigger>
          <TabsTrigger value="interior">Interior</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicle" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <LabeledSelect label="Brand" value={formData.base_vehicle?.brand || ''} onValueChange={(v) => updateNested('base_vehicle', 'brand', v)} placeholder="Brand">
              <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Model" placeholder="Model" value={formData.base_vehicle?.model || ''} onChange={(e) => updateNested('base_vehicle', 'model', e.target.value)} />
            <LabeledInput label="Version" placeholder="Version" value={formData.base_vehicle?.version || ''} onChange={(e) => updateNested('base_vehicle', 'version', e.target.value)} />
            <LabeledSelect label="Year" value={formData.base_vehicle?.model_year?.toString() || ''} onValueChange={(v) => updateNested('base_vehicle', 'model_year', parseInt(v))} placeholder="Model Year">
              <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="WLTP Range" type="number" placeholder="WLTP Range (km)" value={formData.base_vehicle?.wltp_range_km || ''} onChange={(e) => updateNested('base_vehicle', 'wltp_range_km', parseInt(e.target.value))} />
            <LabeledInput label="kW" type="number" placeholder="kW" value={formData.base_vehicle?.kw || ''} onChange={(e) => updateNested('base_vehicle', 'kw', parseInt(e.target.value))} />
            <LabeledInput label="Battery" type="number" placeholder="Battery Size (kWh)" value={formData.base_vehicle?.battery_size_kwh || ''} onChange={(e) => updateNested('base_vehicle', 'battery_size_kwh', parseInt(e.target.value))} />
            <LabeledInput label="Consumption" type="number" step="0.1" placeholder="Consumption kWh/100km" value={formData.base_vehicle?.consumption_kwh_100km || ''} onChange={(e) => updateNested('base_vehicle', 'consumption_kwh_100km', parseFloat(e.target.value))} />
            <LabeledInput label="AC Charge" type="number" placeholder="AC Charging (kW)" value={formData.base_vehicle?.charging_speed_ac_kw || ''} onChange={(e) => updateNested('base_vehicle', 'charging_speed_ac_kw', parseInt(e.target.value))} />
            <LabeledInput label="DC Charge" type="number" placeholder="DC Charging (kW)" value={formData.base_vehicle?.charging_speed_dc_kw || ''} onChange={(e) => updateNested('base_vehicle', 'charging_speed_dc_kw', parseInt(e.target.value))} />
            <LabeledSelect label="Charger" value={formData.base_vehicle?.charger_types || ''} onValueChange={(v) => updateNested('base_vehicle', 'charger_types', v)} placeholder="Charger Types">
              <SelectContent>{CHARGER_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="20-80%" type="number" placeholder="Charging 20-80% (min)" value={formData.base_vehicle?.charging_20_80_min || ''} onChange={(e) => updateNested('base_vehicle', 'charging_20_80_min', parseInt(e.target.value))} />
            <LabeledInput label="10-80%" type="number" placeholder="Charging 10-80% (min)" value={formData.base_vehicle?.charging_10_80_min || ''} onChange={(e) => updateNested('base_vehicle', 'charging_10_80_min', parseInt(e.target.value))} />
            <LabeledInput label="10-90%" type="number" placeholder="Charging 10-90% (min)" value={formData.base_vehicle?.charging_10_90_min || ''} onChange={(e) => updateNested('base_vehicle', 'charging_10_90_min', parseInt(e.target.value))} />
            <LabeledSelect label="Drive" value={formData.base_vehicle?.drive || ''} onValueChange={(v) => updateNested('base_vehicle', 'drive', v)} placeholder="Drive">
              <SelectContent>{DRIVE_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Weight" type="number" placeholder="Weight Empty (kg)" value={formData.base_vehicle?.weight_empty_kg || ''} onChange={(e) => updateNested('base_vehicle', 'weight_empty_kg', parseInt(e.target.value))} />
            <LabeledInput label="Max Weight" type="number" placeholder="Max Additional Weight (kg)" value={formData.base_vehicle?.max_additional_weight_kg || ''} onChange={(e) => updateNested('base_vehicle', 'max_additional_weight_kg', parseInt(e.target.value))} />
            <LabeledSelect label="B-License" value={formData.base_vehicle?.b_license_approved || ''} onValueChange={(v) => updateNested('base_vehicle', 'b_license_approved', v)} placeholder="B-License (3.5t)">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>
        </TabsContent>

        <TabsContent value="camper" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Range" type="number" placeholder="Camper Range (km)" value={formData.camper_data?.camper_range_km || ''} onChange={(e) => updateNested('camper_data', 'camper_range_km', parseInt(e.target.value))} />
            <LabeledInput label="Length" type="number" step="0.01" placeholder="Length (m)" value={formData.camper_data?.length_m || ''} onChange={(e) => updateNested('camper_data', 'length_m', parseFloat(e.target.value))} />
            <LabeledInput label="Height" type="number" step="0.01" placeholder="Height (m)" value={formData.camper_data?.height_m || ''} onChange={(e) => updateNested('camper_data', 'height_m', parseFloat(e.target.value))} />
            <LabeledInput label="Width" type="number" step="0.01" placeholder="Width (m)" value={formData.camper_data?.width_m || ''} onChange={(e) => updateNested('camper_data', 'width_m', parseFloat(e.target.value))} />
            <LabeledInput label="Seats" type="number" placeholder="Seats" value={formData.camper_data?.seats || ''} onChange={(e) => updateNested('camper_data', 'seats', parseInt(e.target.value))} />
            <LabeledInput label="Storage Total" type="number" placeholder="Storage Total (l)" value={formData.camper_data?.storage_total_l || ''} onChange={(e) => updateNested('camper_data', 'storage_total_l', parseInt(e.target.value))} />
            <LabeledInput label="Storage Shelves" type="number" placeholder="Storage Shelves (l)" value={formData.camper_data?.storage_shelves_l || ''} onChange={(e) => updateNested('camper_data', 'storage_shelves_l', parseInt(e.target.value))} />
            <LabeledInput label="Storage Other" type="number" placeholder="Storage Other (l)" value={formData.camper_data?.storage_other_l || ''} onChange={(e) => updateNested('camper_data', 'storage_other_l', parseInt(e.target.value))} />
            <LabeledInput label="Storage Trunk" type="number" placeholder="Storage Trunk (l)" value={formData.camper_data?.storage_trunk_l || ''} onChange={(e) => updateNested('camper_data', 'storage_trunk_l', parseInt(e.target.value))} />
            <LabeledInput label="Sleeps" type="number" placeholder="Sleeps" value={formData.sleeping?.sleeps || ''} onChange={(e) => updateNested('sleeping', 'sleeps', parseInt(e.target.value))} />
            <LabeledInput label="Bed Bottom" placeholder="Bed Size Bottom (cm)" value={formData.sleeping?.bed_size_bottom_cm || ''} onChange={(e) => updateNested('sleeping', 'bed_size_bottom_cm', e.target.value)} />
            <LabeledInput label="Bed Rooftop" placeholder="Bed Size Rooftop (cm)" value={formData.sleeping?.bed_size_rooftop_cm || ''} onChange={(e) => updateNested('sleeping', 'bed_size_rooftop_cm', e.target.value)} />
            <LabeledSelect label="Mosquito Nets" value={formData.sleeping?.rooftop_mosquito_nets || ''} onValueChange={(v) => updateNested('sleeping', 'rooftop_mosquito_nets', v)} placeholder="Rooftop Mosquito Nets">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Ventilation" value={formData.sleeping?.ventilation || ''} onValueChange={(v) => updateNested('sleeping', 'ventilation', v)} placeholder="Ventilation">
              <SelectContent>{VENTILATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>
        </TabsContent>

        <TabsContent value="interior" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <LabeledSelect label="Indoor Table" value={formData.sit_lounge?.indoor_table || ''} onValueChange={(v) => updateNested('sit_lounge', 'indoor_table', v)} placeholder="Indoor Table">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Outdoor Table" value={formData.sit_lounge?.outdoor_table || ''} onValueChange={(v) => updateNested('sit_lounge', 'outdoor_table', v)} placeholder="Outdoor Table">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Swivel Seats" value={formData.sit_lounge?.swivel_front_seats || ''} onValueChange={(v) => updateNested('sit_lounge', 'swivel_front_seats', v)} placeholder="Swivel Front Seats">
              <SelectContent>{SWIVEL_SEATS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Indoor Lights" value={formData.sit_lounge?.indoor_lights || ''} onValueChange={(v) => updateNested('sit_lounge', 'indoor_lights', v)} placeholder="Indoor Lights">
              <SelectContent>{LIGHTS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Curtains" value={formData.sit_lounge?.curtains || ''} onValueChange={(v) => updateNested('sit_lounge', 'curtains', v)} placeholder="Curtains">
              <SelectContent>{CURTAINS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Awning" value={formData.sit_lounge?.awning || ''} onValueChange={(v) => updateNested('sit_lounge', 'awning', v)} placeholder="Awning">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Tinted Windows" value={formData.sit_lounge?.tinted_windows || ''} onValueChange={(v) => updateNested('sit_lounge', 'tinted_windows', v)} placeholder="Tinted Windows">
              <SelectContent>{TINTED_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="ISO-Fix" value={formData.sit_lounge?.iso_fix || ''} onValueChange={(v) => updateNested('sit_lounge', 'iso_fix', v)} placeholder="ISO-Fix">
              <SelectContent>{ISO_FIX_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Fridge" type="number" placeholder="Fridge (l)" value={formData.kitchen?.fridge_l || ''} onChange={(e) => updateNested('kitchen', 'fridge_l', parseInt(e.target.value))} />
            <LabeledSelect label="Fridge Type" value={formData.kitchen?.fridge_type || ''} onValueChange={(v) => updateNested('kitchen', 'fridge_type', v)} placeholder="Fridge Type">
              <SelectContent>{FRIDGE_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Stove Type" value={formData.kitchen?.stove_type || ''} onValueChange={(v) => updateNested('kitchen', 'stove_type', v)} placeholder="Stove Type">
              <SelectContent>{STOVE_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Stove Plates" type="number" placeholder="Stove Plates" value={formData.kitchen?.stove_plates || ''} onChange={(e) => updateNested('kitchen', 'stove_plates', parseInt(e.target.value))} />
            <LabeledInput label="Stove Energy" type="number" placeholder="Stove Energy (W)" value={formData.kitchen?.stove_energy_w || ''} onChange={(e) => updateNested('kitchen', 'stove_energy_w', parseInt(e.target.value))} />
            <LabeledSelect label="Indoor Cooking" value={formData.kitchen?.indoor_cooking || ''} onValueChange={(v) => updateNested('kitchen', 'indoor_cooking', v)} placeholder="Indoor Cooking">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Outdoor Cooking" value={formData.kitchen?.outdoor_cooking || ''} onValueChange={(v) => updateNested('kitchen', 'outdoor_cooking', v)} placeholder="Outdoor Cooking">
              <SelectContent>{OUTDOOR_COOKING.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Toilet Type" value={formData.bathroom?.toilet_type || ''} onValueChange={(v) => updateNested('bathroom', 'toilet_type', v)} placeholder="Toilet Type">
              <SelectContent>{TOILET_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Fresh Water" type="number" placeholder="Fresh Water (l)" value={formData.bathroom?.fresh_water_l || ''} onChange={(e) => updateNested('bathroom', 'fresh_water_l', parseInt(e.target.value))} />
            <LabeledInput label="Waste Water" type="number" placeholder="Waste Water (l)" value={formData.bathroom?.waste_water_l || ''} onChange={(e) => updateNested('bathroom', 'waste_water_l', parseInt(e.target.value))} />
            <LabeledInput label="Warm Water" type="number" placeholder="Warm Water (l)" value={formData.bathroom?.warm_water_l || ''} onChange={(e) => updateNested('bathroom', 'warm_water_l', parseInt(e.target.value))} />
            <LabeledSelect label="Shower" value={formData.bathroom?.shower || ''} onValueChange={(v) => updateNested('bathroom', 'shower', v)} placeholder="Shower">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Warm Shower" value={formData.bathroom?.warm_shower || ''} onValueChange={(v) => updateNested('bathroom', 'warm_shower', v)} placeholder="Warm Shower">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
          </div>
        </TabsContent>

        <TabsContent value="energy" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Camping Battery" type="number" placeholder="Camping Battery (Wh)" value={formData.energy?.camping_battery_wh || ''} onChange={(e) => updateNested('energy', 'camping_battery_wh', parseInt(e.target.value))} />
            <LabeledInput label="Solar Panel Max" type="number" placeholder="Solar Panel Max (W)" value={formData.energy?.solar_panel_max_w || ''} onChange={(e) => updateNested('energy', 'solar_panel_max_w', parseInt(e.target.value))} />
            <LabeledInput label="Charge Solar" type="number" placeholder="Battery Charging Solar (Wh)" value={formData.energy?.battery_charging_solar_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_solar_wh', parseInt(e.target.value))} />
            <LabeledInput label="Charge HV" type="number" placeholder="Battery Charging HV (Wh)" value={formData.energy?.battery_charging_hv_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_hv_wh', parseInt(e.target.value))} />
            <LabeledInput label="Charge Driving" type="number" placeholder="Battery Charging Driving (Wh)" value={formData.energy?.battery_charging_driving_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_driving_wh', parseInt(e.target.value))} />
            <LabeledInput label="Charge Landline" type="number" placeholder="Battery Charging Landline (Wh)" value={formData.energy?.battery_charging_landline_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_landline_wh', parseInt(e.target.value))} />
            <LabeledInput label="Max Output AC" type="number" placeholder="Max Output AC 12V (W)" value={formData.energy?.max_battery_output_ac_12v_w || ''} onChange={(e) => updateNested('energy', 'max_battery_output_ac_12v_w', parseInt(e.target.value))} />
            <LabeledInput label="Plugs AC" type="number" placeholder="Output Plugs AC" value={formData.energy?.battery_output_plugs_ac || ''} onChange={(e) => updateNested('energy', 'battery_output_plugs_ac', parseInt(e.target.value))} />
            <LabeledInput label="Max Output DC" type="number" placeholder="Max Output DC 230V" value={formData.energy?.max_battery_output_dc_230v || ''} onChange={(e) => updateNested('energy', 'max_battery_output_dc_230v', parseInt(e.target.value))} />
            <LabeledInput label="Plugs DC" type="number" placeholder="Output Plugs DC" value={formData.energy?.battery_output_plugs_dc || ''} onChange={(e) => updateNested('energy', 'battery_output_plugs_dc', parseInt(e.target.value))} />
            <LabeledInput label="USB-C Front" type="number" placeholder="USB-C Plugs Front" value={formData.energy?.usb_c_plugs_front || ''} onChange={(e) => updateNested('energy', 'usb_c_plugs_front', parseInt(e.target.value))} />
            <LabeledInput label="USB-C Living" type="number" placeholder="USB-C Plugs Living" value={formData.energy?.usb_c_plugs_livingroom || ''} onChange={(e) => updateNested('energy', 'usb_c_plugs_livingroom', parseInt(e.target.value))} />
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <LabeledSelect label="A/C" value={formData.climate?.ac || ''} onValueChange={(v) => updateNested('climate', 'ac', v)} placeholder="A/C">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Climate Program" value={formData.climate?.vehicle_climate_programming || ''} onValueChange={(v) => updateNested('climate', 'vehicle_climate_programming', v)} placeholder="Climate Programming">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Vehicle Heating" value={formData.climate?.vehicle_heating || ''} onValueChange={(v) => updateNested('climate', 'vehicle_heating', v)} placeholder="Vehicle Heating">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Vehicle Cooling" value={formData.climate?.vehicle_cooling || ''} onValueChange={(v) => updateNested('climate', 'vehicle_cooling', v)} placeholder="Vehicle Cooling">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Stand Heating" value={formData.climate?.stand_heating || ''} onValueChange={(v) => updateNested('climate', 'stand_heating', v)} placeholder="Stand Heating">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Living Heating" value={formData.climate?.living_room_heating || ''} onValueChange={(v) => updateNested('climate', 'living_room_heating', v)} placeholder="Living Room Heating">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Insulation" value={formData.climate?.insulation || ''} onValueChange={(v) => updateNested('climate', 'insulation', v)} placeholder="Insulation">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Seat Heating" value={formData.climate?.seat_heating || ''} onValueChange={(v) => updateNested('climate', 'seat_heating', v)} placeholder="Seat Heating">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Wheel Heating" value={formData.climate?.steering_wheel_heating || ''} onValueChange={(v) => updateNested('climate', 'steering_wheel_heating', v)} placeholder="Steering Wheel Heating">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Front Windows" value={formData.climate?.front_windows_opening_electric || ''} onValueChange={(v) => updateNested('climate', 'front_windows_opening_electric', v)} placeholder="Front Windows (Electric)">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Rear Windows" value={formData.climate?.rear_windows_opening || ''} onValueChange={(v) => updateNested('climate', 'rear_windows_opening', v)} placeholder="Rear Windows Opening">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Back Window" value={formData.climate?.back_window_opening || ''} onValueChange={(v) => updateNested('climate', 'back_window_opening', v)} placeholder="Back Window Opening">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Remote App" value={formData.smart_connected?.remote_app_access || ''} onValueChange={(v) => updateNested('smart_connected', 'remote_app_access', v)} placeholder="Remote App Access">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="CarPlay/Auto" value={formData.smart_connected?.apple_carplay_android_auto || ''} onValueChange={(v) => updateNested('smart_connected', 'apple_carplay_android_auto', v)} placeholder="CarPlay/Android Auto">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Navigation" value={formData.smart_connected?.navigation_software || ''} onValueChange={(v) => updateNested('smart_connected', 'navigation_software', v)} placeholder="Navigation">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="ACC" value={formData.smart_connected?.acc || ''} onValueChange={(v) => updateNested('smart_connected', 'acc', v)} placeholder="ACC">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Lane Assist" value={formData.smart_connected?.lane_assist || ''} onValueChange={(v) => updateNested('smart_connected', 'lane_assist', v)} placeholder="Lane Assist">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Sign Recognition" value={formData.smart_connected?.sign_recognition || ''} onValueChange={(v) => updateNested('smart_connected', 'sign_recognition', v)} placeholder="Sign Recognition">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Rear Camera" value={formData.smart_connected?.rear_camera || ''} onValueChange={(v) => updateNested('smart_connected', 'rear_camera', v)} placeholder="Rear Camera">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Trailer Hitch" value={formData.extras?.trailer_hitch || ''} onValueChange={(v) => updateNested('extras', 'trailer_hitch', v)} placeholder="Trailer Hitch">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Sliding Doors" value={formData.extras?.sliding_doors || ''} onValueChange={(v) => updateNested('extras', 'sliding_doors', v)} placeholder="Sliding Doors">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledSelect label="Backdoor" value={formData.extras?.backdoor || ''} onValueChange={(v) => updateNested('extras', 'backdoor', v)} placeholder="Backdoor">
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </LabeledSelect>
            <LabeledInput label="Furniture" placeholder="Furniture Materials" value={formData.eco_scoring?.furniture_materials || ''} onChange={(e) => updateNested('eco_scoring', 'furniture_materials', e.target.value)} />
            <LabeledInput label="Flooring" placeholder="Flooring Material" value={formData.eco_scoring?.flooring_material || ''} onChange={(e) => updateNested('eco_scoring', 'flooring_material', e.target.value)} />
            <LabeledInput label="Insulation Mat" placeholder="Insulation Material" value={formData.eco_scoring?.insulation_material || ''} onChange={(e) => updateNested('eco_scoring', 'insulation_material', e.target.value)} />
            <LabeledInput label="Textile" placeholder="Textile Material" value={formData.eco_scoring?.textile_material || ''} onChange={(e) => updateNested('eco_scoring', 'textile_material', e.target.value)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}