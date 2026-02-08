import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Scale, Settings, Home, Menu } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 shrink-0">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69821ce2e60eda0e750871ab/49807fe7d_image.png" 
                alt="eC@mpass" 
                className="w-9 h-9 shrink-0 object-contain"
              />
              <span className="font-bold text-xl text-slate-900 whitespace-nowrap">eC@mpass</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" /> Browse
                </Button>
              </Link>
              <Link to={createPageUrl('Compare')}>
                <Button variant="ghost" size="sm">
                  <Scale className="w-4 h-4 mr-2" /> Compare
                </Button>
              </Link>
              <Link to={createPageUrl('Admin')}>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" /> Admin
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <Link to={createPageUrl('Home')} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="lg" className="w-full justify-start">
                      <Home className="w-5 h-5 mr-3" /> Browse
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Compare')} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="lg" className="w-full justify-start">
                      <Scale className="w-5 h-5 mr-3" /> Compare
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Admin')} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="lg" className="w-full justify-start">
                      <Settings className="w-5 h-5 mr-3" /> Admin
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}