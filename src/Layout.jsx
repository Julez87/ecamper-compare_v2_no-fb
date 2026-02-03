import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Scale, Settings, Home } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      {currentPageName !== 'Home' && (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900">CompareHub</span>
              </Link>

              <div className="flex items-center gap-2">
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
            </div>
          </div>
        </nav>
      )}

      <main>{children}</main>
    </div>
  );
}