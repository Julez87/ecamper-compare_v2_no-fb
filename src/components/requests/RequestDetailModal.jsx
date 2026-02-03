import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Copy, Calendar, User, Package } from 'lucide-react';
import { format } from 'date-fns';

export default function RequestDetailModal({ request, isOpen, onClose, onCopyToAddCamper }) {
  if (!request) return null;

  const hasExpertData = request.expert_mode_data && Object.keys(request.expert_mode_data).length > 0;

  const renderValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return value;
  };

  const renderSection = (title, data) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">{title}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="text-slate-500 text-xs">{key.replace(/_/g, ' ')}</div>
              <div className="text-slate-900 font-medium">{renderValue(value)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{request.model_name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{request.size_category}</Badge>
                <Badge className={
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {request.status}
                </Badge>
                {hasExpertData && (
                  <Badge className="bg-emerald-100 text-emerald-800">Expert Mode</Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Info */}
          <div className="space-y-3">
            {request.requester_email && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Requested by:</span>
                <span className="font-medium text-slate-900">{request.requester_email}</span>
              </div>
            )}
            
            {request.created_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Date:</span>
                <span className="font-medium text-slate-900">{format(new Date(request.created_date), 'MMM d, yyyy HH:mm')}</span>
              </div>
            )}

            {request.product_url && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">URL:</span>
                <a href={request.product_url.startsWith('http') ? request.product_url : `https://${request.product_url}`} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                  {request.product_url}
                </a>
              </div>
            )}

            {request.reason && (
              <div className="space-y-1">
                <div className="text-slate-600 text-sm">Reason:</div>
                <div className="text-slate-900 bg-slate-50 rounded-lg p-3 text-sm">{request.reason}</div>
              </div>
            )}
          </div>

          {/* Expert Mode Data */}
          {hasExpertData && (
            <>
              <Separator />
              
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Detailed Specifications</h2>
                </div>

                {renderSection('Base Vehicle', request.expert_mode_data.base_vehicle)}
                {renderSection('Camper Data', request.expert_mode_data.camper_data)}
                {renderSection('Sleeping', request.expert_mode_data.sleeping)}
                {renderSection('Sit & Lounge', request.expert_mode_data.sit_lounge)}
                {renderSection('Kitchen', request.expert_mode_data.kitchen)}
                {renderSection('Bathroom', request.expert_mode_data.bathroom)}
                {renderSection('Energy', request.expert_mode_data.energy)}
                {renderSection('Climate', request.expert_mode_data.climate)}
                {renderSection('Smart & Connected', request.expert_mode_data.smart_connected)}
                {renderSection('Extras', request.expert_mode_data.extras)}
                {renderSection('Eco Scoring', request.expert_mode_data.eco_scoring)}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {hasExpertData && (
            <Button 
              onClick={() => {
                onCopyToAddCamper(request);
                onClose();
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to Add Camper
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}