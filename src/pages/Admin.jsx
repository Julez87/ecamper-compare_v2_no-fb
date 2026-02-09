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
import { Plus, Pencil, Trash2, Check, X, Package, MessageSquare, Loader2, ExternalLink, Building2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { format } from 'date-fns';
import CamperAdminForm from '../components/campers/CamperAdminForm';
import RentalCompanyForm from '../components/rental/RentalCompanyForm';
import RequestDetailModal from '../components/requests/RequestDetailModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({});
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({});
  const [viewingRequest, setViewingRequest] = useState(null);
  const [isRequestDetailOpen, setIsRequestDetailOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, item: null });
  const [camperSort, setCamperSort] = useState({ field: 'created_date', direction: 'desc' });
  const [requestSort, setRequestSort] = useState({ field: 'created_date', direction: 'desc' });
  const [companySort, setCompanySort] = useState({ field: 'name', direction: 'asc' });

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

  const toggleReleased = useMutation({
    mutationFn: ({ id, released }) => base44.entities.Product.update(id, { released }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
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

  const handleCopyToAddCamper = (request) => {
    const expertData = request.expert_mode_data || {};
    const newProductData = {
      model_name: request.model_name,
      size_category: request.size_category,
      ...expertData
    };
    setProductForm(newProductData);
    setEditingProduct(null);
    setIsProductModalOpen(true);
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

  const handleDeleteClick = (type, item) => {
    setDeleteConfirm({ isOpen: true, type, item });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.type === 'camper') {
      deleteProduct.mutate(deleteConfirm.item.id);
    } else if (deleteConfirm.type === 'company') {
      deleteCompany.mutate(deleteConfirm.item.id);
    }
    setDeleteConfirm({ isOpen: false, type: null, item: null });
  };

  const handleSort = (table, field) => {
    if (table === 'camper') {
      setCamperSort(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    } else if (table === 'request') {
      setRequestSort(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    } else if (table === 'company') {
      setCompanySort(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    }
  };

  const SortIcon = ({ active, direction }) => {
    if (!active) return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    return direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const sortedProducts = [...products].sort((a, b) => {
    const { field, direction } = camperSort;
    let aVal = field === 'brand' ? a.base_vehicle?.brand : a[field];
    let bVal = field === 'brand' ? b.base_vehicle?.brand : b[field];
    
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    
    if (typeof aVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const sortedRequests = [...requests].sort((a, b) => {
    const { field, direction } = requestSort;
    let aVal = a[field];
    let bVal = b[field];
    
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    
    if (field === 'created_date') {
      return direction === 'asc' 
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal);
    }
    
    if (typeof aVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const sortedCompanies = [...companies].sort((a, b) => {
    const { field, direction } = companySort;
    let aVal = a[field];
    let bVal = b[field];
    
    if (field === 'countries') {
      aVal = a.countries?.length || 0;
      bVal = b.countries?.length || 0;
    } else if (field === 'cities') {
      aVal = Object.values(a.locations || {}).reduce((acc, cities) => acc + cities.length, 0);
      bVal = Object.values(b.locations || {}).reduce((acc, cities) => acc + cities.length, 0);
    } else if (field === 'campers') {
      aVal = a.available_campers?.length || 0;
      bVal = b.available_campers?.length || 0;
    }
    
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    
    if (typeof aVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

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
                    <TableHead>
                      <button onClick={() => handleSort('camper', 'model_name')} className="flex items-center gap-2 hover:text-slate-900">
                        Model
                        <SortIcon active={camperSort.field === 'model_name'} direction={camperSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('camper', 'size_category')} className="flex items-center gap-2 hover:text-slate-900">
                        Size
                        <SortIcon active={camperSort.field === 'size_category'} direction={camperSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('camper', 'brand')} className="flex items-center gap-2 hover:text-slate-900">
                        Brand
                        <SortIcon active={camperSort.field === 'brand'} direction={camperSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('camper', 'buy_from_price')} className="flex items-center gap-2 hover:text-slate-900">
                        Buy Price
                        <SortIcon active={camperSort.field === 'buy_from_price'} direction={camperSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('camper', 'rent_from_price')} className="flex items-center gap-2 hover:text-slate-900">
                        Rent Price
                        <SortIcon active={camperSort.field === 'rent_from_price'} direction={camperSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('camper', 'is_featured')} className="flex items-center gap-2 hover:text-slate-900">
                        Featured
                        <SortIcon active={camperSort.field === 'is_featured'} direction={camperSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('camper', 'released')} className="flex items-center gap-2 hover:text-slate-900">
                        Released
                        <SortIcon active={camperSort.field === 'released'} direction={camperSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : sortedProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-slate-500">No campers yet</TableCell></TableRow>
                  ) : sortedProducts.map(product => (
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
                      <TableCell>
                        <Switch 
                          checked={product.released || false} 
                          onCheckedChange={(checked) => toggleReleased.mutate({ id: product.id, released: checked })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openProductModal(product)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick('camper', product)}>
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
                    <TableHead>
                      <button onClick={() => handleSort('request', 'model_name')} className="flex items-center gap-2 hover:text-slate-900">
                        Model
                        <SortIcon active={requestSort.field === 'model_name'} direction={requestSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('request', 'size_category')} className="flex items-center gap-2 hover:text-slate-900">
                        Size
                        <SortIcon active={requestSort.field === 'size_category'} direction={requestSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('request', 'requester_email')} className="flex items-center gap-2 hover:text-slate-900">
                        Requester
                        <SortIcon active={requestSort.field === 'requester_email'} direction={requestSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('request', 'created_date')} className="flex items-center gap-2 hover:text-slate-900">
                        Date
                        <SortIcon active={requestSort.field === 'created_date'} direction={requestSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('request', 'status')} className="flex items-center gap-2 hover:text-slate-900">
                        Status
                        <SortIcon active={requestSort.field === 'status'} direction={requestSort.direction} />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : sortedRequests.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No requests yet</TableCell></TableRow>
                  ) : sortedRequests.map(request => (
                   <TableRow key={request.id} className="cursor-pointer hover:bg-slate-50" onClick={() => {
                     setViewingRequest(request);
                     setIsRequestDetailOpen(true);
                   }}>
                     <TableCell>
                       <div>
                         <span className="font-medium">{request.model_name}</span>
                         {request.expert_mode_data && Object.keys(request.expert_mode_data).length > 0 && (
                           <Badge className="ml-2 bg-emerald-100 text-emerald-800 text-xs">Expert</Badge>
                         )}
                         {request.product_url && (
                           <a href={request.product_url.startsWith('http') ? request.product_url : `https://${request.product_url}`} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex" onClick={(e) => e.stopPropagation()}>
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
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                    <TableHead>
                      <button onClick={() => handleSort('company', 'name')} className="flex items-center gap-2 hover:text-slate-900">
                        Company
                        <SortIcon active={companySort.field === 'name'} direction={companySort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('company', 'countries')} className="flex items-center gap-2 hover:text-slate-900">
                        Countries
                        <SortIcon active={companySort.field === 'countries'} direction={companySort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('company', 'cities')} className="flex items-center gap-2 hover:text-slate-900">
                        Cities
                        <SortIcon active={companySort.field === 'cities'} direction={companySort.direction} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('company', 'campers')} className="flex items-center gap-2 hover:text-slate-900">
                        Campers
                        <SortIcon active={companySort.field === 'campers'} direction={companySort.direction} />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companiesLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : sortedCompanies.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No rental companies yet</TableCell></TableRow>
                  ) : sortedCompanies.map(company => (
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
                        <Badge variant="outline">{company.countries?.length || 0} countries</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{Object.values(company.locations || {}).reduce((acc, cities) => acc + cities.length, 0)} cities</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.available_campers?.length || 0} campers</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openCompanyModal(company)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick('company', company)}>
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

      {/* Request Detail Modal */}
      <RequestDetailModal
        request={viewingRequest}
        isOpen={isRequestDetailOpen}
        onClose={() => setIsRequestDetailOpen(false)}
        onCopyToAddCamper={handleCopyToAddCamper}
      />

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

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: null, item: null })}
        onConfirm={handleConfirmDelete}
        title={deleteConfirm.type === 'camper' ? 'Delete Camper' : 'Delete Rental Company'}
        itemName={deleteConfirm.item?.model_name || deleteConfirm.item?.name}
        itemType={deleteConfirm.type === 'camper' ? 'camper' : 'rental company'}
      />
    </div>
  );
}