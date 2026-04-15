'use client';

import { useState } from 'react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import DashboardSearch from '../../components/dashboard/DashboardSearch';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Search Bar */}
          <DashboardSearch 
            onSearch={setSearchQuery}
            placeholder="Search dashboard, tasks, guests, vendors..."
          />
          
          {/* Page Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
