import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ThumbsUp, ThumbsDown, HelpCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FeedbackSuccessOverlay from './FeedbackSuccessOverlay';

const TOPICS = ['Newsletter', 'Browsing Campers', 'Comparison', 'Camper Details', 'Filters'];

const EUROPEAN_COUNTRIES = [
  'Austria','Belgium','Bulgaria','Croatia','Cyprus','Czech Republic','Denmark',
  'Estonia','Finland','France','Germany','Greece','Hungary','Iceland','Ireland',
  'Italy','Latvia','Lithuania','Luxembourg','Malta','Netherlands','Norway','Poland',
  'Portugal','Romania','Slovakia','Slovenia','Spain','Sweden','Switzerland','United Kingdom',
  'Africa (other)','Asia (other)','North America (other)','South America (other)','Oceania (other)'
];

const sentimentIcons = {
  positive: <ThumbsUp className="w-8 h-8 text-emerald-500" />,
  negative: <ThumbsDown className="w-8 h-8 text-red-500" />,
  question: <HelpCircle className="w-8 h-8 text-violet-500" />,
};

export default function FeedbackModal({ isOpen, onClose, sentiment, defaultTopic }) {
  const [form, setForm] = useState({
    topic: defaultTopic || '',
    message: '',
    reach_out: false,
    news_subscribe: false,
    email: '',
    user_type: 'private',
    name: '',
    country: '',
    zip_code: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(prev => ({
        ...prev,
        topic: defaultTopic || prev.topic || '',
      }));
    }
  }, [isOpen, defaultTopic]);

  // Try to detect country from browser
  useEffect(() => {
    try {
      const lang = navigator.language || navigator.languages?.[0] || '';
      const countryCode = lang.split('-')[1]?.toUpperCase();
      const codeToCountry = {
        AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus',
        CZ: 'Czech Republic', DK: 'Denmark', EE: 'Estonia', FI: 'Finland', FR: 'France',
        DE: 'Germany', GR: 'Greece', HU: 'Hungary', IS: 'Iceland', IE: 'Ireland',
        IT: 'Italy', LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta',
        NL: 'Netherlands', NO: 'Norway', PL: 'Poland', PT: 'Portugal', RO: 'Romania',
        SK: 'Slovakia', SI: 'Slovenia', ES: 'Spain', SE: 'Sweden', CH: 'Switzerland',
        GB: 'United Kingdom', UK: 'United Kingdom',
      };
      if (countryCode && codeToCountry[countryCode]) {
        setForm(prev => ({ ...prev, country: codeToCountry[countryCode] }));
      }
    } catch {}
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const needsEmail = form.reach_out || form.news_subscribe;

  const handleSubmit = async () => {
    if (!form.topic) return;
    if (needsEmail && !form.email) {
      setEmailError('Email is required when you want us to reach out or subscribe to news.');
      return;
    }
    if (form.email && !validateEmail(form.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setSubmitting(true);

    await base44.entities.Feedback.create({
      sentiment,
      topic: form.topic,
      message: form.message,
      reach_out: form.reach_out,
      news_subscribe: form.news_subscribe,
      email: form.email || undefined,
      user_type: form.user_type,
      name: form.name || undefined,
      country: form.country || undefined,
      zip_code: form.zip_code || undefined,
      status: 'open',
    });

    setSubmitting(false);
    onClose();
    setShowSuccess(true);
  };

  const handleSuccessDone = useCallback(() => {
    setShowSuccess(false);
    setForm({
      topic: '', message: '', reach_out: false, news_subscribe: false,
      email: '', user_type: 'private', name: '', country: '', zip_code: '',
    });
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto border-0 bg-gradient-to-b from-white to-violet-50/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Thank you for your feedback!</DialogTitle>
          </DialogHeader>

          {sentiment && (
            <div className="flex justify-center my-2">
              {sentimentIcons[sentiment]}
            </div>
          )}

          <div className="space-y-4 mt-2">
            {/* Topic */}
            <div>
              <Label className="text-sm">Topic <span className="text-red-500">*</span></Label>
              <Select value={form.topic} onValueChange={(v) => setForm(prev => ({ ...prev, topic: v }))}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select topic..." />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div>
              <Label className="text-sm">How can we help you or make this site better?</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us what you think..."
                className="mt-1 bg-white h-20"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reach_out"
                  checked={form.reach_out}
                  onCheckedChange={(c) => setForm(prev => ({ ...prev, reach_out: !!c }))}
                />
                <label htmlFor="reach_out" className="text-sm text-slate-700 cursor-pointer">
                  Do you want us to reach back out to you?
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="news_subscribe"
                  checked={form.news_subscribe}
                  onCheckedChange={(c) => setForm(prev => ({ ...prev, news_subscribe: !!c }))}
                />
                <label htmlFor="news_subscribe" className="text-sm text-slate-700 cursor-pointer">
                  Do you want to be informed about news (Campers, Builders, Renters, Apps, etc)?
                </label>
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-sm">
                Email {needsEmail && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => { setForm(prev => ({ ...prev, email: e.target.value })); setEmailError(''); }}
                placeholder="your@email.com"
                className="mt-1 bg-white"
              />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>

            {/* Private / Business toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">Private or Business?</Label>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${form.user_type === 'private' ? 'font-medium text-slate-900' : 'text-slate-400'}`}>Private</span>
                <Switch
                  checked={form.user_type === 'business'}
                  onCheckedChange={(c) => setForm(prev => ({ ...prev, user_type: c ? 'business' : 'private' }))}
                />
                <span className={`text-sm ${form.user_type === 'business' ? 'font-medium text-slate-900' : 'text-slate-400'}`}>Business</span>
              </div>
            </div>

            {/* Name */}
            <div>
              <Label className="text-sm">Name (optional)</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                className="mt-1 bg-white"
              />
            </div>

            {/* Country */}
            <div>
              <Label className="text-sm">Country (optional)</Label>
              <Select value={form.country} onValueChange={(v) => setForm(prev => ({ ...prev, country: v }))}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select country..." />
                </SelectTrigger>
                <SelectContent>
                  {EUROPEAN_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* ZIP */}
            <div>
              <Label className="text-sm">ZIP Code (optional)</Label>
              <Input
                value={form.zip_code}
                onChange={(e) => setForm(prev => ({ ...prev, zip_code: e.target.value }))}
                placeholder="ZIP code"
                className="mt-1 bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !form.topic}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FeedbackSuccessOverlay
        show={showSuccess}
        wantsContact={form.reach_out || form.news_subscribe}
        onDone={handleSuccessDone}
      />
    </>
  );
}