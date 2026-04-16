'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, X, Menu } from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import DashboardSearch from '../../components/dashboard/DashboardSearch';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState('/dashboard');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    if (pathname === '/dashboard') return [];
    
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: { label: string; href?: string }[] = [];
    
    if (pathSegments.length > 2) {
      breadcrumbItems.push({
        label: pathSegments[2].charAt(0).toUpperCase() + pathSegments[2].slice(1),
        href: `/dashboard/${pathSegments[2]}`
      });
    }
    
    return breadcrumbItems;
  };

  const goBack = () => {
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Sidebar */}
      <DashboardSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 overflow-x-hidden ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className={`container mx-auto px-4 py-8 transition-all duration-300 ${
          isSidebarCollapsed ? 'max-w-full' : 'max-w-[calc(100vw-16rem)]'
        }`}>
          {/* Breadcrumbs and Back Button */}
          {pathname !== '/dashboard' && (
            <div className="flex items-center justify-between mb-6">
              <Breadcrumbs items={getBreadcrumbItems()} />
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                title="Go back to dashboard"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            </div>
          )}
          
          {/* Search Bar */}
          <DashboardSearch 
            onSearch={setSearchQuery}
            placeholder="Search dashboard, tasks, guests, vendors..."
          />
          
          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={toggleMobileMenu}
            >
              {/* Mobile Menu Content */}
              <div className="flex flex-col h-full w-64 bg-surface border-r border-white/10">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Menu</h3>
                    <button
                      onClick={toggleMobileMenu}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <X size={20} className="text-text-muted" />
                    </button>
                  </div>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-2">
                    {sidebarItems.map((item: SidebarItem, index: number) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                        onClick={() => handleItemClick(item, index)}
                      >
                        <item.icon size={20} className="text-current" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          )}
          
          {/* Page Content */}
          {children}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        title="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
