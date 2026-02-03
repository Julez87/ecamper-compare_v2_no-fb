import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, Pencil, Trash2, Check, X, Package, 
  MessageSquare, Loader2, ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ["Smartphones", "Laptops", "Tablets", "Headphones", "Cameras", "Smartwatches", "TVs", "Gaming Consoles"];
const BRANDS = ["Apple", "Samsung", "Google", "Sony", "Microsoft", "Dell", "HP", "Lenovo", "Asus", "LG", "Bose", "Canon", "Nikon", "Nintendo", "Other"];
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const SPEC_OPTIONS = {
  display_size: ["5.5\"", "6.1\"", "6.5\"", "6.7\"", "6.9\"", "10.9\"", "11\"", "12.9\"", "13\"", "14\"", "15\"", "16\"", "24\"", "27\"", "32\"", "43\"", "55\"", "65\"", "75\"", "85\"", "N/A"],
  storage: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "N/A"],
  ram: ["4GB", "6GB", "8GB", "12GB", "16GB", "32GB", "64GB", "N/A"],
  battery_life: ["Up to 6 hours", "Up to 8 hours", "Up to 10 hours", "Up to 12 hours", "Up to 15 hours", "Up to 20 hours", "Up to 24 hours", "N/A"],
  processor: ["Apple A15", "Apple A16", "Apple A17 Pro", "Apple M1", "Apple M2", "Apple M3", "Apple M4", "Snapdragon 8 Gen 1", "Snapdragon 8 Gen 2", "Snapdragon 8 Gen 3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Custom", "N/A"],
  connectivity: ["WiFi only", "WiFi + Cellular", "WiFi + 5G", "Bluetooth", "WiFi + Bluetooth", "Wired", "N/A"],
  weight: ["Under 100g", "100-200g", "200-300g", "300-500g", "500g-1kg", "1-2kg", "2-3kg", "Over 3kg", "N/A"]
};

export default function Admin() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', category: '', brand: '', price: '', image_url: '',
    description: '', release_year: '', rating: '', is_featured: false,
    specs: { display_size: '', storage: '', ram: '', battery_life: '', processor: '', connectivity: '', weight: '' },
    pros: [], cons: []
  });
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: () => base44.entities.ProductRequest.list(),
  });

  const createProduct = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeProductModal();
    }
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeProductModal();
    }
  });

  const deleteProduct = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const updateRequest = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] })
  });

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        category: product.category || '',
        brand: product.brand || '',
        price: product.price || '',
        image_url: product.image_url || '',
        description: product.description || '',
        release_year: product.release_year || '',
        rating: product.rating || '',
        is_featured: product.is_featured || false,
        specs: product.specs || {},
        pros: product.pros || [],
        cons: product.cons || []
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '', category: '', brand: '', price: '', image_url: '',
        description: '', release_year: '', rating: '', is_featured: false,
        specs: {}, pros: [], cons: []
      });
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setNewPro('');
    setNewCon('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...productForm,
      price: parseFloat(productForm.price) || 0,
      release_year: parseInt(productForm.release_year) || null,
      rating: parseFloat(productForm.rating) || null
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data });
    } else {
      createProduct.mutate(data);
    }
  };

  const addPro = () => {
    if (newPro.trim()) {
      setProductForm(prev => ({ ...prev, pros: [...prev.pros, newPro.trim()] }));
      setNewPro('');
    }
  };

  const addCon = () => {
    if (newCon.trim()) {
      setProductForm(prev => ({ ...prev, cons: [...prev.cons, newCon.trim()] }));
      setNewCon('');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage products and review requests</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white shadow-sm p-1 rounded-xl">
            <TabsTrigger value="products" className="rounded-lg px-6 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" /> Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg px-6 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" /> Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-violet-600">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="border-0 shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-slate-900">All Products</h2>
                <Button onClick={() => openProductModal()} className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : products.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No products yet</TableCell></TableRow>
                  ) : products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-10 h-10 object-contain rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-sm font-bold text-slate-400">
                              {product.brand?.[0]}
                            </div>
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>${product.price?.toLocaleString()}</TableCell>
                      <TableCell>{product.is_featured ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-slate-300" />}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openProductModal(product)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct.mutate(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="border-0 shadow-sm">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-slate-900">Product Requests</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No requests yet</TableCell></TableRow>
                  ) : requests.map(request => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{request.product_name}</span>
                          {request.product_url && (
                            <a href={request.product_url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex">
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          )}
                          {request.reason && (
                            <p className="text-xs text-slate-500 mt-1 max-w-xs truncate">{request.reason}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{request.category}</TableCell>
                      <TableCell>{request.brand}</TableCell>
                      <TableCell>{request.requester_email || '—'}</TableCell>
                      <TableCell>{request.created_date ? format(new Date(request.created_date), 'MMM d, yyyy') : '—'}</TableCell>
                      <TableCell>
                        <Badge className={
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => updateRequest.mutate({ id: request.id, data: { status: 'approved' } })}>
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => updateRequest.mutate({ id: request.id, data: { status: 'rejected' } })}>
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={closeProductModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product Name *</Label>
                <Input value={productForm.name} onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))} required className="mt-1.5" />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={productForm.category} onValueChange={(v) => setProductForm(p => ({ ...p, category: v }))} required>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Brand *</Label>
                <Select value={productForm.brand} onValueChange={(v) => setProductForm(p => ({ ...p, brand: v }))} required>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price ($) *</Label>
                <Input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))} required className="mt-1.5" />
              </div>
              <div>
                <Label>Release Year</Label>
                <Select value={productForm.release_year?.toString()} onValueChange={(v) => setProductForm(p => ({ ...p, release_year: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rating (1-5)</Label>
                <Input type="number" step="0.1" min="1" max="5" value={productForm.rating} onChange={(e) => setProductForm(p => ({ ...p, rating: e.target.value }))} className="mt-1.5" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={productForm.is_featured} onCheckedChange={(v) => setProductForm(p => ({ ...p, is_featured: v }))} />
                <Label>Featured Product</Label>
              </div>
              <div className="col-span-2">
                <Label>Image URL</Label>
                <Input value={productForm.image_url} onChange={(e) => setProductForm(p => ({ ...p, image_url: e.target.value }))} className="mt-1.5" />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={productForm.description} onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))} className="mt-1.5" rows={3} />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Specifications</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                {Object.entries(SPEC_OPTIONS).map(([key, options]) => (
                  <div key={key}>
                    <Label className="text-xs text-slate-500">{key.replace(/_/g, ' ')}</Label>
                    <Select value={productForm.specs?.[key] || ''} onValueChange={(v) => setProductForm(p => ({ ...p, specs: { ...p.specs, [key]: v } }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pros</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input value={newPro} onChange={(e) => setNewPro(e.target.value)} placeholder="Add a pro..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())} />
                  <Button type="button" variant="outline" onClick={addPro}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {productForm.pros?.map((pro, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-50 text-green-700">
                      {pro} <button type="button" onClick={() => setProductForm(p => ({ ...p, pros: p.pros.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3 ml-1" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Cons</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input value={newCon} onChange={(e) => setNewCon(e.target.value)} placeholder="Add a con..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())} />
                  <Button type="button" variant="outline" onClick={addCon}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {productForm.cons?.map((con, i) => (
                    <Badge key={i} variant="secondary" className="bg-red-50 text-red-700">
                      {con} <button type="button" onClick={() => setProductForm(p => ({ ...p, cons: p.cons.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3 ml-1" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeProductModal} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700" disabled={createProduct.isPending || updateProduct.isPending}>
                {(createProduct.isPending || updateProduct.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}