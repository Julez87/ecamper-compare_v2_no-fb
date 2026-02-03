import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, Sparkles } from 'lucide-react';

const CATEGORIES = ["Smartphones", "Laptops", "Tablets", "Headphones", "Cameras", "Smartwatches", "TVs", "Gaming Consoles"];
const BRANDS = ["Apple", "Samsung", "Google", "Sony", "Microsoft", "Dell", "HP", "Lenovo", "Asus", "LG", "Bose", "Canon", "Nikon", "Nintendo", "Other"];

export default function RequestProductModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    brand: '',
    reason: '',
    product_url: '',
    requester_email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await base44.entities.ProductRequest.create({
      ...formData,
      status: 'pending'
    });
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({
        product_name: '',
        category: '',
        brand: '',
        reason: '',
        product_url: '',
        requester_email: ''
      });
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        {isSuccess ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Request Submitted!</h3>
            <p className="text-slate-600">We'll review your product suggestion soon.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Request a Product</DialogTitle>
                  <DialogDescription>
                    Suggest a product to be added to our database
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    placeholder="e.g. iPhone 15 Pro Max"
                    value={formData.product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                    required
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Brand *</Label>
                  <Select 
                    value={formData.brand} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, brand: v }))}
                    required
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANDS.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
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
                    placeholder="Tell us why this product would be valuable..."
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="mt-1.5 resize-none"
                    rows={3}
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
                  <p className="text-xs text-slate-500 mt-1">We'll notify you when the product is added</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.product_name || !formData.category || !formData.brand}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
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