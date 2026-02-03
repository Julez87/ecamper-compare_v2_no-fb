import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const EU_COUNTRIES = [
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' }
];

const TOP_CITIES = {
  'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
  'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
  'ES': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
  'IT': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'],
  'NL': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen'],
  'PL': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice'],
  'BE': ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Aalst'],
  'AT': ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn'],
  'SE': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'],
  'CZ': ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'České Budějovice', 'Hradec Králové', 'Ústí nad Labem', 'Pardubice']
};

export default function RentalCompanyForm({ formData, setFormData }) {
  const [expandedCountries, setExpandedCountries] = useState({});
  const [customCity, setCustomCity] = useState({});

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCountry = (countryCode) => {
    const countries = formData.countries || [];
    const isSelected = countries.includes(countryCode);
    
    if (isSelected) {
      updateField('countries', countries.filter(c => c !== countryCode));
      const locations = { ...(formData.locations || {}) };
      delete locations[countryCode];
      updateField('locations', locations);
    } else {
      updateField('countries', [...countries, countryCode]);
    }
  };

  const toggleCity = (countryCode, city) => {
    const locations = { ...(formData.locations || {}) };
    const cities = locations[countryCode] || [];
    
    if (cities.includes(city)) {
      locations[countryCode] = cities.filter(c => c !== city);
    } else {
      locations[countryCode] = [...cities, city];
    }
    
    updateField('locations', locations);
  };

  const addCustomCity = (countryCode) => {
    const city = customCity[countryCode]?.trim();
    if (!city) return;
    
    const locations = { ...(formData.locations || {}) };
    const cities = locations[countryCode] || [];
    
    if (!cities.includes(city)) {
      locations[countryCode] = [...cities, city];
      updateField('locations', locations);
    }
    
    setCustomCity(prev => ({ ...prev, [countryCode]: '' }));
  };

  const toggleCamper = (camperId) => {
    const campers = formData.available_campers || [];
    const exists = campers.find(c => c.camper_id === camperId);
    
    if (exists) {
      updateField('available_campers', campers.filter(c => c.camper_id !== camperId));
    } else {
      updateField('available_campers', [...campers, { camper_id: camperId, rent_price: 0 }]);
    }
  };

  const updateRentPrice = (camperId, price) => {
    const campers = formData.available_campers || [];
    updateField('available_campers', campers.map(c => 
      c.camper_id === camperId ? { ...c, rent_price: parseFloat(price) || 0 } : c
    ));
  };

  const selectedCountries = formData.countries || [];

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Company Name *</Label>
          <Input 
            value={formData.name || ''} 
            onChange={(e) => updateField('name', e.target.value)} 
            required 
            className="mt-1.5" 
          />
        </div>
        <div className="col-span-2">
          <Label>Logo URL</Label>
          <Input 
            value={formData.logo_url || ''} 
            onChange={(e) => updateField('logo_url', e.target.value)} 
            className="mt-1.5" 
          />
        </div>
        <div className="col-span-2">
          <Label>Website URL</Label>
          <Input 
            value={formData.website_url || ''} 
            onChange={(e) => updateField('website_url', e.target.value)} 
            placeholder="https://example.com"
            className="mt-1.5" 
          />
        </div>
        <div className="col-span-2">
          <Label className="mb-2 block">Brand Color</Label>
          <div className="grid grid-cols-6 gap-3">
            {['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#84CC16', '#14B8A6', '#6366F1', '#A855F7'].map(color => (
              <button
                key={color}
                type="button"
                onClick={() => updateField('color', color)}
                className={`w-12 h-12 rounded-lg transition-all ${formData.color === color ? 'ring-4 ring-slate-900 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Countries */}
      <div>
        <Label className="mb-3 block">Operating Countries</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3 bg-slate-50">
          {EU_COUNTRIES.map(country => (
            <div key={country.code}>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                <Checkbox 
                  checked={selectedCountries.includes(country.code)}
                  onCheckedChange={() => toggleCountry(country.code)}
                />
                <span className="text-xl">{country.flag}</span>
                <span className="text-sm font-medium">{country.code}</span>
                <span className="text-sm text-slate-600">{country.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Locations per Country */}
      {selectedCountries.length > 0 && (
        <div>
          <Label className="mb-3 block">Locations by Country</Label>
          <div className="space-y-2">
            {selectedCountries.sort().map(countryCode => {
              const country = EU_COUNTRIES.find(c => c.code === countryCode);
              const topCities = TOP_CITIES[countryCode] || [];
              const selectedCities = (formData.locations?.[countryCode] || []);
              const isExpanded = expandedCountries[countryCode];
              
              return (
                <div key={countryCode} className="border rounded-lg bg-white">
                  <Collapsible 
                    open={isExpanded}
                    onOpenChange={() => setExpandedCountries(prev => ({ ...prev, [countryCode]: !prev[countryCode] }))}
                  >
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{country?.flag}</span>
                        <span className="font-medium">{country?.name}</span>
                        {selectedCities.length > 0 && (
                          <Badge variant="secondary" className="ml-2">{selectedCities.length} cities</Badge>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="p-3 pt-0 space-y-3">
                        {topCities.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-2">Top 10 Cities</p>
                            <div className="grid grid-cols-2 gap-2">
                              {topCities.map(city => (
                                <label key={city} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded text-sm">
                                  <Checkbox 
                                    checked={selectedCities.includes(city)}
                                    onCheckedChange={() => toggleCity(countryCode, city)}
                                  />
                                  {city}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-2">Add Custom City</p>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="City name"
                              value={customCity[countryCode] || ''}
                              onChange={(e) => setCustomCity(prev => ({ ...prev, [countryCode]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCity(countryCode))}
                            />
                            <Button type="button" size="icon" variant="outline" onClick={() => addCustomCity(countryCode)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {selectedCities.filter(c => !topCities.includes(c)).length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-2">Custom Cities</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedCities.filter(c => !topCities.includes(c)).map(city => (
                                <Badge key={city} variant="secondary">
                                  {city}
                                  <button 
                                    type="button" 
                                    onClick={() => toggleCity(countryCode, city)}
                                    className="ml-1"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Campers */}
      <div>
        <Label className="mb-3 block">Available Campers & Rent Prices</Label>
        <div className="border rounded-lg bg-white divide-y max-h-96 overflow-y-auto">
          {products.map(product => {
            const camperData = (formData.available_campers || []).find(c => c.camper_id === product.id);
            const isSelected = !!camperData;
            
            return (
              <div key={product.id} className="p-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => toggleCamper(product.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {product.image_url && (
                        <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{product.model_name}</p>
                        <p className="text-xs text-slate-500">{product.size_category} • {product.base_vehicle?.brand}</p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3">
                        <Label className="text-xs">Daily Rent Price (€)</Label>
                        <Input 
                          type="number"
                          value={camperData?.rent_price || ''}
                          onChange={(e) => updateRentPrice(product.id, e.target.value)}
                          placeholder="0"
                          className="mt-1 max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}