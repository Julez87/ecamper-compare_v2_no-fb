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

const LabeledInput = ({ label, value, onChange, type, ...props }) => (
  <div className="relative">
    {value && (
      <>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{label}:</span>
        <span className="absolute right-[2.25em] top-1/2 -translate-y-1/2 text-sm text-slate-900 font-medium pointer-events-none text-right">{value}</span>
      </>
    )}
    <Input 
      type={type}
      value={value} 
      onChange={onChange} 
      className={value ? 'text-transparent text-right' : 'text-right'} 
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
            <Select value={formData.sit_lounge?.indoor_table || ''} onValueChange={(v) => updateNested('sit_lounge', 'indoor_table', v)}>
              <SelectTrigger><SelectValue placeholder="Indoor Table" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.sit_lounge?.outdoor_table || ''} onValueChange={(v) => updateNested('sit_lounge', 'outdoor_table', v)}>
              <SelectTrigger><SelectValue placeholder="Outdoor Table" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.sit_lounge?.swivel_front_seats || ''} onValueChange={(v) => updateNested('sit_lounge', 'swivel_front_seats', v)}>
              <SelectTrigger><SelectValue placeholder="Swivel Front Seats" /></SelectTrigger>
              <SelectContent>{SWIVEL_SEATS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.sit_lounge?.indoor_lights || ''} onValueChange={(v) => updateNested('sit_lounge', 'indoor_lights', v)}>
              <SelectTrigger><SelectValue placeholder="Indoor Lights" /></SelectTrigger>
              <SelectContent>{LIGHTS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.sit_lounge?.curtains || ''} onValueChange={(v) => updateNested('sit_lounge', 'curtains', v)}>
              <SelectTrigger><SelectValue placeholder="Curtains" /></SelectTrigger>
              <SelectContent>{CURTAINS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.sit_lounge?.awning || ''} onValueChange={(v) => updateNested('sit_lounge', 'awning', v)}>
              <SelectTrigger><SelectValue placeholder="Awning" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.sit_lounge?.tinted_windows || ''} onValueChange={(v) => updateNested('sit_lounge', 'tinted_windows', v)}>
              <SelectTrigger><SelectValue placeholder="Tinted Windows" /></SelectTrigger>
              <SelectContent>{TINTED_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.sit_lounge?.iso_fix || ''} onValueChange={(v) => updateNested('sit_lounge', 'iso_fix', v)}>
              <SelectTrigger><SelectValue placeholder="ISO-Fix" /></SelectTrigger>
              <SelectContent>{ISO_FIX_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Fridge (l)" value={formData.kitchen?.fridge_l || ''} onChange={(e) => updateNested('kitchen', 'fridge_l', parseInt(e.target.value))} />
            <Select value={formData.kitchen?.fridge_type || ''} onValueChange={(v) => updateNested('kitchen', 'fridge_type', v)}>
              <SelectTrigger><SelectValue placeholder="Fridge Type" /></SelectTrigger>
              <SelectContent>{FRIDGE_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.kitchen?.stove_type || ''} onValueChange={(v) => updateNested('kitchen', 'stove_type', v)}>
              <SelectTrigger><SelectValue placeholder="Stove Type" /></SelectTrigger>
              <SelectContent>{STOVE_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Stove Plates" value={formData.kitchen?.stove_plates || ''} onChange={(e) => updateNested('kitchen', 'stove_plates', parseInt(e.target.value))} />
            <Input type="number" placeholder="Stove Energy (W)" value={formData.kitchen?.stove_energy_w || ''} onChange={(e) => updateNested('kitchen', 'stove_energy_w', parseInt(e.target.value))} />
            <Select value={formData.kitchen?.indoor_cooking || ''} onValueChange={(v) => updateNested('kitchen', 'indoor_cooking', v)}>
              <SelectTrigger><SelectValue placeholder="Indoor Cooking" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.kitchen?.outdoor_cooking || ''} onValueChange={(v) => updateNested('kitchen', 'outdoor_cooking', v)}>
              <SelectTrigger><SelectValue placeholder="Outdoor Cooking" /></SelectTrigger>
              <SelectContent>{OUTDOOR_COOKING.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.bathroom?.toilet_type || ''} onValueChange={(v) => updateNested('bathroom', 'toilet_type', v)}>
              <SelectTrigger><SelectValue placeholder="Toilet Type" /></SelectTrigger>
              <SelectContent>{TOILET_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Fresh Water (l)" value={formData.bathroom?.fresh_water_l || ''} onChange={(e) => updateNested('bathroom', 'fresh_water_l', parseInt(e.target.value))} />
            <Input type="number" placeholder="Waste Water (l)" value={formData.bathroom?.waste_water_l || ''} onChange={(e) => updateNested('bathroom', 'waste_water_l', parseInt(e.target.value))} />
            <Input type="number" placeholder="Warm Water (l)" value={formData.bathroom?.warm_water_l || ''} onChange={(e) => updateNested('bathroom', 'warm_water_l', parseInt(e.target.value))} />
            <Select value={formData.bathroom?.shower || ''} onValueChange={(v) => updateNested('bathroom', 'shower', v)}>
              <SelectTrigger><SelectValue placeholder="Shower" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.bathroom?.warm_shower || ''} onValueChange={(v) => updateNested('bathroom', 'warm_shower', v)}>
              <SelectTrigger><SelectValue placeholder="Warm Shower" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="energy" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Camping Battery (Wh)" value={formData.energy?.camping_battery_wh || ''} onChange={(e) => updateNested('energy', 'camping_battery_wh', parseInt(e.target.value))} />
            <Input type="number" placeholder="Solar Panel Max (W)" value={formData.energy?.solar_panel_max_w || ''} onChange={(e) => updateNested('energy', 'solar_panel_max_w', parseInt(e.target.value))} />
            <Input type="number" placeholder="Battery Charging Solar (Wh)" value={formData.energy?.battery_charging_solar_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_solar_wh', parseInt(e.target.value))} />
            <Input type="number" placeholder="Battery Charging HV (Wh)" value={formData.energy?.battery_charging_hv_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_hv_wh', parseInt(e.target.value))} />
            <Input type="number" placeholder="Battery Charging Driving (Wh)" value={formData.energy?.battery_charging_driving_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_driving_wh', parseInt(e.target.value))} />
            <Input type="number" placeholder="Battery Charging Landline (Wh)" value={formData.energy?.battery_charging_landline_wh || ''} onChange={(e) => updateNested('energy', 'battery_charging_landline_wh', parseInt(e.target.value))} />
            <Input type="number" placeholder="Max Output AC 12V (W)" value={formData.energy?.max_battery_output_ac_12v_w || ''} onChange={(e) => updateNested('energy', 'max_battery_output_ac_12v_w', parseInt(e.target.value))} />
            <Input type="number" placeholder="Output Plugs AC" value={formData.energy?.battery_output_plugs_ac || ''} onChange={(e) => updateNested('energy', 'battery_output_plugs_ac', parseInt(e.target.value))} />
            <Input type="number" placeholder="Max Output DC 230V" value={formData.energy?.max_battery_output_dc_230v || ''} onChange={(e) => updateNested('energy', 'max_battery_output_dc_230v', parseInt(e.target.value))} />
            <Input type="number" placeholder="Output Plugs DC" value={formData.energy?.battery_output_plugs_dc || ''} onChange={(e) => updateNested('energy', 'battery_output_plugs_dc', parseInt(e.target.value))} />
            <Input type="number" placeholder="USB-C Plugs Front" value={formData.energy?.usb_c_plugs_front || ''} onChange={(e) => updateNested('energy', 'usb_c_plugs_front', parseInt(e.target.value))} />
            <Input type="number" placeholder="USB-C Plugs Living" value={formData.energy?.usb_c_plugs_livingroom || ''} onChange={(e) => updateNested('energy', 'usb_c_plugs_livingroom', parseInt(e.target.value))} />
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Select value={formData.climate?.ac || ''} onValueChange={(v) => updateNested('climate', 'ac', v)}>
              <SelectTrigger><SelectValue placeholder="A/C" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.vehicle_climate_programming || ''} onValueChange={(v) => updateNested('climate', 'vehicle_climate_programming', v)}>
              <SelectTrigger><SelectValue placeholder="Climate Programming" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.vehicle_heating || ''} onValueChange={(v) => updateNested('climate', 'vehicle_heating', v)}>
              <SelectTrigger><SelectValue placeholder="Vehicle Heating" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.vehicle_cooling || ''} onValueChange={(v) => updateNested('climate', 'vehicle_cooling', v)}>
              <SelectTrigger><SelectValue placeholder="Vehicle Cooling" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.stand_heating || ''} onValueChange={(v) => updateNested('climate', 'stand_heating', v)}>
              <SelectTrigger><SelectValue placeholder="Stand Heating" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.living_room_heating || ''} onValueChange={(v) => updateNested('climate', 'living_room_heating', v)}>
              <SelectTrigger><SelectValue placeholder="Living Room Heating" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.insulation || ''} onValueChange={(v) => updateNested('climate', 'insulation', v)}>
              <SelectTrigger><SelectValue placeholder="Insulation" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.seat_heating || ''} onValueChange={(v) => updateNested('climate', 'seat_heating', v)}>
              <SelectTrigger><SelectValue placeholder="Seat Heating" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.steering_wheel_heating || ''} onValueChange={(v) => updateNested('climate', 'steering_wheel_heating', v)}>
              <SelectTrigger><SelectValue placeholder="Steering Wheel Heating" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.front_windows_opening_electric || ''} onValueChange={(v) => updateNested('climate', 'front_windows_opening_electric', v)}>
              <SelectTrigger><SelectValue placeholder="Front Windows (Electric)" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.rear_windows_opening || ''} onValueChange={(v) => updateNested('climate', 'rear_windows_opening', v)}>
              <SelectTrigger><SelectValue placeholder="Rear Windows Opening" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.climate?.back_window_opening || ''} onValueChange={(v) => updateNested('climate', 'back_window_opening', v)}>
              <SelectTrigger><SelectValue placeholder="Back Window Opening" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.smart_connected?.remote_app_access || ''} onValueChange={(v) => updateNested('smart_connected', 'remote_app_access', v)}>
              <SelectTrigger><SelectValue placeholder="Remote App Access" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.smart_connected?.apple_carplay_android_auto || ''} onValueChange={(v) => updateNested('smart_connected', 'apple_carplay_android_auto', v)}>
              <SelectTrigger><SelectValue placeholder="CarPlay/Android Auto" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.smart_connected?.navigation_software || ''} onValueChange={(v) => updateNested('smart_connected', 'navigation_software', v)}>
              <SelectTrigger><SelectValue placeholder="Navigation" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.smart_connected?.acc || ''} onValueChange={(v) => updateNested('smart_connected', 'acc', v)}>
              <SelectTrigger><SelectValue placeholder="ACC" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.smart_connected?.lane_assist || ''} onValueChange={(v) => updateNested('smart_connected', 'lane_assist', v)}>
              <SelectTrigger><SelectValue placeholder="Lane Assist" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.smart_connected?.sign_recognition || ''} onValueChange={(v) => updateNested('smart_connected', 'sign_recognition', v)}>
              <SelectTrigger><SelectValue placeholder="Sign Recognition" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.smart_connected?.rear_camera || ''} onValueChange={(v) => updateNested('smart_connected', 'rear_camera', v)}>
              <SelectTrigger><SelectValue placeholder="Rear Camera" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.extras?.trailer_hitch || ''} onValueChange={(v) => updateNested('extras', 'trailer_hitch', v)}>
              <SelectTrigger><SelectValue placeholder="Trailer Hitch" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.extras?.sliding_doors || ''} onValueChange={(v) => updateNested('extras', 'sliding_doors', v)}>
              <SelectTrigger><SelectValue placeholder="Sliding Doors" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.extras?.backdoor || ''} onValueChange={(v) => updateNested('extras', 'backdoor', v)}>
              <SelectTrigger><SelectValue placeholder="Backdoor" /></SelectTrigger>
              <SelectContent>{YES_NO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Furniture Materials" value={formData.eco_scoring?.furniture_materials || ''} onChange={(e) => updateNested('eco_scoring', 'furniture_materials', e.target.value)} />
            <Input placeholder="Flooring Material" value={formData.eco_scoring?.flooring_material || ''} onChange={(e) => updateNested('eco_scoring', 'flooring_material', e.target.value)} />
            <Input placeholder="Insulation Material" value={formData.eco_scoring?.insulation_material || ''} onChange={(e) => updateNested('eco_scoring', 'insulation_material', e.target.value)} />
            <Input placeholder="Textile Material" value={formData.eco_scoring?.textile_material || ''} onChange={(e) => updateNested('eco_scoring', 'textile_material', e.target.value)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}