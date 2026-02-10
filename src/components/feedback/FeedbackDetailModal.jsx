import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

const sentimentIcons = {
  positive: <ThumbsUp className="w-4 h-4 text-emerald-500" />,
  negative: <ThumbsDown className="w-4 h-4 text-red-500" />,
  question: <HelpCircle className="w-4 h-4 text-violet-500" />,
};

export default function FeedbackDetailModal({ feedback, isOpen, onClose, onStatusChange }) {
  if (!feedback) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {sentimentIcons[feedback.sentiment]}
            Feedback Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Topic</p>
              <Badge variant="outline">{feedback.topic}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Date</p>
              <p className="text-sm text-slate-900">{feedback.created_date ? format(new Date(feedback.created_date), 'MMM d, yyyy HH:mm') : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Type</p>
              <Badge variant="outline" className="capitalize">{feedback.user_type || 'private'}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
              <Select value={feedback.status || 'open'} onValueChange={(val) => onStatusChange(feedback.id, val)}>
                <SelectTrigger className="w-full h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {feedback.message && (
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Message</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{feedback.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {feedback.email && (
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Email</p>
                <p className="text-sm text-slate-900">{feedback.email}</p>
              </div>
            )}
            {feedback.name && (
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Name</p>
                <p className="text-sm text-slate-900">{feedback.name}</p>
              </div>
            )}
            {feedback.country && (
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Country</p>
                <p className="text-sm text-slate-900">{feedback.country}</p>
              </div>
            )}
            {feedback.zip_code && (
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">ZIP Code</p>
                <p className="text-sm text-slate-900">{feedback.zip_code}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {feedback.reach_out && (
              <Badge className="bg-blue-100 text-blue-800">Wants contact</Badge>
            )}
            {feedback.news_subscribe && (
              <Badge className="bg-violet-100 text-violet-800">Newsletter</Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}