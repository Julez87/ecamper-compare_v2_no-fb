import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, Sparkles, Settings2 } from 'lucide-react';

const SIZE_CATEGORIES = ["Compact", "Standard", "Large", "XL"];

export default function RequestProductModal({ isOpen, onClose }) {
  const [expertMode, setExpertMode] = useState(false);
  const [formData, setFormData] = useState({
    model_name: '',
    size_category: '',
    reason: '',
    product_url: '',
    requester_email: ''
  });
  const [expertData, setExpertData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await base44.entities.ProductRequest.create({
      ...formData,
      status: 'pending',
      expert_mode_data: expertMode ? expertData : null
    });
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ model_name: '', size_category: '', reason: '', product_url: '', requester_email: '' });
      setExpertData({});
      setExpertMode(false);
      onClose();
    }, 2000);
  };

  const updateExpertData = (section, field, value) => {
    setExpertData(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Request Submitted!</h3>
            <p className="text-slate-600">We'll review your camper suggestion soon.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">Request a Camper</DialogTitle>
                    <DialogDescription>Suggest an electric camper to be added</DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={expertMode} onCheckedChange={setExpertMode} />
                  <Label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setExpertMode(!expertMode)}>
                    <Settings2 className="w-4 h-4" /> Expert Mode
                  </Label>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="model_name">Model Name *</Label>
                  <Input
                    id="model_name"
                    placeholder="e.g. Outbase ID Buzz"
                    value={formData.model_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Size Category *</Label>
                  <Select 
                    value={formData.size_category} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, size_category: v }))}
                    required
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="product_url">Product URL (optional)</Label>
                  <Input
                    id="product_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.product_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_url: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="reason">Why should we add this? (optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Tell us why this camper would be valuable..."
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="mt-1.5 resize-none"
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="email">Your Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.requester_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, requester_email: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Expert Mode Sections */}
              {expertMode && (
                <div className="border-t pt-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-emerald-600" />
                    Detailed Specifications
                  </h3>
                  
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
                        <Input placeholder="Brand (e.g. VW)" onChange={(e) => updateExpertData('base_vehicle', 'brand', e.target.value)} />
                        <Input placeholder="Model (e.g. ID.Buzz)" onChange={(e) => updateExpertData('base_vehicle', 'model', e.target.value)} />
                        <Input placeholder="Version" onChange={(e) => updateExpertData('base_vehicle', 'version', e.target.value)} />
                        <Input type="number" placeholder="Model Year" onChange={(e) => updateExpertData('base_vehicle', 'model_year', e.target.value)} />
                        <Input type="number" placeholder="WLTP Range (km)" onChange={(e) => updateExpertData('base_vehicle', 'wltp_range_km', e.target.value)} />
                        <Input type="number" placeholder="kW" onChange={(e) => updateExpertData('base_vehicle', 'kw', e.target.value)} />
                        <Input type="number" placeholder="Battery Size (kWh)" onChange={(e) => updateExpertData('base_vehicle', 'battery_size_kwh', e.target.value)} />
                        <Input type="number" placeholder="Consumption (kWh/100km)" onChange={(e) => updateExpertData('base_vehicle', 'consumption_kwh_100km', e.target.value)} />
                        <Select onValueChange={(v) => updateExpertData('base_vehicle', 'drive', v)}>
                          <SelectTrigger><SelectValue placeholder="Drive" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="front">Front</SelectItem>
                            <SelectItem value="rear">Rear</SelectItem>
                            <SelectItem value="4x4">4x4</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(v) => updateExpertData('base_vehicle', 'b_license_approved', v)}>
                          <SelectTrigger><SelectValue placeholder="B-License (3.5t)" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    <TabsContent value="camper" className="space-y-3 mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Input type="number" placeholder="Camper Range (km)" onChange={(e) => updateExpertData('camper_data', 'camper_range_km', e.target.value)} />
                        <Input type="number" placeholder="Length (m)" onChange={(e) => updateExpertData('camper_data', 'length_m', e.target.value)} />
                        <Input type="number" placeholder="Height (m)" onChange={(e) => updateExpertData('camper_data', 'height_m', e.target.value)} />
                        <Input type="number" placeholder="Width (m)" onChange={(e) => updateExpertData('camper_data', 'width_m', e.target.value)} />
                        <Input type="number" placeholder="Seats" onChange={(e) => updateExpertData('camper_data', 'seats', e.target.value)} />
                        <Input type="number" placeholder="Sleeps" onChange={(e) => updateExpertData('sleeping', 'sleeps', e.target.value)} />
                        <Input placeholder="Bed Size Bottom (cm)" onChange={(e) => updateExpertData('sleeping', 'bed_size_bottom_cm', e.target.value)} />
                        <Input placeholder="Bed Size Rooftop (cm)" onChange={(e) => updateExpertData('sleeping', 'bed_size_rooftop_cm', e.target.value)} />
                      </div>
                    </TabsContent>

                    <TabsContent value="interior" className="space-y-3 mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Select onValueChange={(v) => updateExpertData('sit_lounge', 'indoor_table', v)}>
                          <SelectTrigger><SelectValue placeholder="Indoor Table" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(v) => updateExpertData('sit_lounge', 'swivel_front_seats', v)}>
                          <SelectTrigger><SelectValue placeholder="Swivel Front Seats" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="1">1 Seat</SelectItem>
                            <SelectItem value="2">2 Seats</SelectItem>
                            <SelectItem value="3">3 Seats</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="number" placeholder="Fridge (l)" onChange={(e) => updateExpertData('kitchen', 'fridge_l', e.target.value)} />
                        <Select onValueChange={(v) => updateExpertData('kitchen', 'stove_type', v)}>
                          <SelectTrigger><SelectValue placeholder="Stove Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="Gas">Gas</SelectItem>
                            <SelectItem value="Electric & Gas">Electric & Gas</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(v) => updateExpertData('bathroom', 'toilet_type', v)}>
                          <SelectTrigger><SelectValue placeholder="Toilet Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chemical">Chemical</SelectItem>
                            <SelectItem value="separation">Separation</SelectItem>
                            <SelectItem value="no">No Toilet</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="number" placeholder="Fresh Water (l)" onChange={(e) => updateExpertData('bathroom', 'fresh_water_l', e.target.value)} />
                      </div>
                    </TabsContent>

                    <TabsContent value="energy" className="space-y-3 mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Input type="number" placeholder="Camping Battery (Wh)" onChange={(e) => updateExpertData('energy', 'camping_battery_wh', e.target.value)} />
                        <Input type="number" placeholder="Solar Panel Max (W)" onChange={(e) => updateExpertData('energy', 'solar_panel_max_w', e.target.value)} />
                        <Input type="number" placeholder="USB-C Plugs Front" onChange={(e) => updateExpertData('energy', 'usb_c_plugs_front', e.target.value)} />
                        <Input type="number" placeholder="USB-C Plugs Living" onChange={(e) => updateExpertData('energy', 'usb_c_plugs_livingroom', e.target.value)} />
                      </div>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-3 mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Select onValueChange={(v) => updateExpertData('climate', 'ac', v)}>
                          <SelectTrigger><SelectValue placeholder="A/C" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(v) => updateExpertData('smart_connected', 'remote_app_access', v)}>
                          <SelectTrigger><SelectValue placeholder="Remote App Access" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(v) => updateExpertData('smart_connected', 'apple_carplay_android_auto', v)}>
                          <SelectTrigger><SelectValue placeholder="CarPlay/Android Auto" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(v) => updateExpertData('extras', 'sliding_doors', v)}>
                          <SelectTrigger><SelectValue placeholder="Sliding Doors" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.model_name || !formData.size_category}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}