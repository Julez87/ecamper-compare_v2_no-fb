import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Check, X, Package, MessageSquare, Loader2, ExternalLink, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import CamperAdminForm from '../components/campers/CamperAdminForm';
import RentalCompanyForm from '../components/rental/RentalCompanyForm';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({});
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({});

  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
    enabled: isAuthenticated,
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: () => base44.entities.ProductRequest.list(),
    enabled: isAuthenticated,
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.RentalCompany.list(),
    enabled: isAuthenticated,
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

  const createCompany = useMutation({
    mutationFn: (data) => base44.entities.RentalCompany.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      closeCompanyModal();
    }
  });

  const updateCompany = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RentalCompany.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      closeCompanyModal();
    }
  });

  const deleteCompany = useMutation({
    mutationFn: (id) => base44.entities.RentalCompany.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] })
  });

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm(product);
    } else {
      setEditingProduct(null);
      setProductForm({});
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const openCompanyModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setCompanyForm(company);
    } else {
      setEditingCompany(null);
      setCompanyForm({});
    }
    setIsCompanyModalOpen(true);
  };

  const closeCompanyModal = () => {
    setIsCompanyModalOpen(false);
    setEditingCompany(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: productForm });
    } else {
      createProduct.mutate(productForm);
    }
  };

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    
    if (editingCompany) {
      updateCompany.mutate({ id: editingCompany.id, data: companyForm });
    } else {
      createCompany.mutate(companyForm);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin00') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
              <p className="text-slate-600 mt-2">Enter password to continue</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Login
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage electric campers and review requests</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white shadow-sm p-1 rounded-xl">
            <TabsTrigger value="products" className="rounded-lg px-6 data-[state=active]:bg-emerald-900 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" /> Campers ({products.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg px-6 data-[state=active]:bg-emerald-900 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" /> Camper Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-emerald-600">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="companies" className="rounded-lg px-6 data-[state=active]:bg-emerald-900 data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" /> Rental Companies ({companies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="border-0 shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-slate-900">All Campers</h2>
                <Button onClick={() => openProductModal()} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Camper
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Buy Price</TableHead>
                    <TableHead>Rent Price</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : products.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No campers yet</TableCell></TableRow>
                  ) : products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-10 h-10 object-contain rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-lg">🚐</div>
                          )}
                          <span className="font-medium">{product.model_name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{product.size_category}</Badge></TableCell>
                      <TableCell>{product.base_vehicle?.brand}</TableCell>
                      <TableCell>€{product.buy_from_price?.toLocaleString()}</TableCell>
                      <TableCell>€{product.rent_from_price}/day</TableCell>
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
                <h2 className="font-semibold text-slate-900">Camper Requests</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No requests yet</TableCell></TableRow>
                  ) : requests.map(request => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{request.model_name}</span>
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
                      <TableCell>{request.size_category}</TableCell>
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

          <TabsContent value="companies">
            <Card className="border-0 shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-slate-900">Rental Companies</h2>
                <Button onClick={() => openCompanyModal()} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Company
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Countries</TableHead>
                    <TableHead>Cities</TableHead>
                    <TableHead>Campers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companiesLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : companies.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No rental companies yet</TableCell></TableRow>
                  ) : companies.map(company => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {company.logo_url ? (
                            <img src={company.logo_url} alt="" className="w-10 h-10 object-contain rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <span className="font-medium">{company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.countries?.length || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        {Object.values(company.locations || {}).reduce((acc, cities) => acc + cities.length, 0)} locations
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.available_campers?.length || 0} campers</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openCompanyModal(company)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCompany.mutate(company.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Camper' : 'Add New Camper'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-4">
            <CamperAdminForm formData={productForm} setFormData={setProductForm} />
            
            <div className="flex gap-3 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={closeProductModal} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={createProduct.isPending || updateProduct.isPending}>
                {(createProduct.isPending || updateProduct.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingProduct ? 'Update Camper' : 'Create Camper'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Company Modal */}
      <Dialog open={isCompanyModalOpen} onOpenChange={closeCompanyModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Edit Rental Company' : 'Add New Rental Company'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCompanySubmit} className="mt-4">
            <RentalCompanyForm formData={companyForm} setFormData={setCompanyForm} />
            
            <div className="flex gap-3 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={closeCompanyModal} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={createCompany.isPending || updateCompany.isPending}>
                {(createCompany.isPending || updateCompany.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingCompany ? 'Update Company' : 'Create Company'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}