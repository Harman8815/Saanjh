'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Building,
  Users,
  DollarSign,
  Store,
  CheckSquare,
  Image,
  FileText,
  Globe,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  Heart,
  Circle
} from 'lucide-react';

interface SidebarSubItem {
  label: string;
  href: string;
  badge?: string;
}

interface SidebarItem {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  href?: string;
  badge?: string;
  subItems?: SidebarSubItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    icon: Home,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: Calendar,
    label: 'Timeline',
    href: '/dashboard/timeline',
  },
  {
    icon: Building,
    label: 'Venues & Booking',
    href: '/dashboard/venues',
  },
  {
    icon: Users,
    label: 'Guests',
    href: '/dashboard/guests',
    badge: '12',
    subItems: [
      { label: 'Guest List', href: '/dashboard/guests/list' },
      { label: 'RSVP Status', href: '/dashboard/guests/rsvp' },
      { label: 'Seating Chart', href: '/dashboard/guests/seating' },
      { label: 'Meal Preferences', href: '/dashboard/guests/meals' },
    ],
  },
  {
    icon: DollarSign,
    label: 'Budget',
    href: '/dashboard/budget',
  },
  {
    icon: Store,
    label: 'Vendors',
    href: '/dashboard/vendors',
    badge: '3',
  },
  {
    icon: CheckSquare,
    label: 'Tasks',
    href: '/dashboard/tasks',
    badge: '5',
    subItems: [
      { label: 'Task List', href: '/dashboard/tasks/list' },
      { label: 'Checklists', href: '/dashboard/tasks/checklists' },
      { label: 'Deadlines', href: '/dashboard/tasks/deadlines' },
      { label: 'Completed', href: '/dashboard/tasks/completed' },
    ],
  },
  {
    icon: Image,
    label: 'Gallery',
    href: '/dashboard/gallery',
    subItems: [
      { label: 'All Albums', href: '/dashboard/gallery' },
      { label: 'Featured', href: '/dashboard/gallery?filter=featured' },
      { label: 'Recent Uploads', href: '/dashboard/gallery?sort=date-desc' },
      { label: 'Manage Media', href: '/dashboard/gallery/manage' },
    ],
  },
  {
    icon: FileText,
    label: 'Documents',
    href: '/dashboard/documents',
    subItems: [
      { label: 'Contracts', href: '/dashboard/documents/contracts' },
      { label: 'Invitations', href: '/dashboard/documents/invitations' },
      { label: 'Licenses', href: '/dashboard/documents/licenses' },
      { label: 'Other', href: '/dashboard/documents/other' },
    ],
  },
  {
    icon: Globe,
    label: 'Website',
    href: '/dashboard/website',
    subItems: [
      { label: 'Website Builder', href: '/dashboard/website/builder' },
      { label: 'Pages', href: '/dashboard/website/pages' },
      { label: 'Domain', href: '/dashboard/website/domain' },
      { label: 'Analytics', href: '/dashboard/website/analytics' },
    ],
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/settings',
    subItems: [
      { label: 'Profile', href: '/dashboard/settings/profile' },
      { label: 'Wedding Details', href: '/dashboard/settings/wedding' },
      { label: 'Privacy', href: '/dashboard/settings/privacy' },
      { label: 'Notifications', href: '/dashboard/settings/notifications' },
    ],
  },
];

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function DashboardSidebar({ isCollapsed = false, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine if an item is active based on current pathname
  const isItemActive = (itemHref?: string): boolean => {
    if (!itemHref) return false;
    // Dashboard should only be active on exact match, not sub-pages
    if (itemHref === '/dashboard') {
      return pathname === '/dashboard';
    }
    // For other items: exact match or starts with the item href (for parent items with sub-items)
    return pathname === itemHref || pathname.startsWith(itemHref + '/');
  };
  
  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems(prev => 
      prev.includes(itemLabel) 
        ? prev.filter(item => item !== itemLabel)
        : [...prev, itemLabel]
    );
  };

  const handleItemClick = (item: SidebarItem) => {
    // Toggle expansion if item has subItems
    if (item.subItems) {
      if (!expandedItems.includes(item.label)) {
        toggleExpanded(item.label);
      } else {
        // If submenu is already expanded, clicking should collapse it
        setExpandedItems(prev =>
          prev.includes(item.label)
            ? prev.filter(i => i !== item.label)
            : [...prev, item.label]
        );
      }
    }
    // Close mobile menu after navigation (whether or not item has subItems)
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSidebarClick = (e: React.MouseEvent) => {
    // If sidebar is collapsed and click is not on an icon or button, expand it
    if (isCollapsed && !(e.target as HTMLElement).closest('button, svg')) {
      onToggle?.();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ 
          x: isMobileMenuOpen ? 0 : 0
        }}
        transition={{ duration: 0.3 }}
        onClick={handleSidebarClick}
        className={`fixed left-0 top-0 h-full bg-surface border-r border-white/10 z-40 transition-all duration-300 overflow-y-auto overflow-x-hidden ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-text-primary font-semibold">Wedding</h2>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-white/5"
              title={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {/* Desktop Collapse Toggle - Only show when expanded */}
            {!isCollapsed && (
              <button
                onClick={onToggle}
                className="hidden md:flex text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-white/5"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Main Item */}
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isItemActive(item.href)
                      ? item.subItems 
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <item.icon 
                    size={20} 
                    className={`group-hover:scale-110 transition-transform ${
                      isItemActive(item.href) ? 'text-white' : 'text-text-secondary'
                    }`} 
                  />
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 + 0.1 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="bg-gold text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.subItems && (
                          <ChevronDown 
                            size={14} 
                            className={`transition-transform duration-200 text-current ${
                              expandedItems.includes(item.label) ? 'rotate-180' : ''
                            }`} 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleExpanded(item.label);
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </Link>
              ) : (
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isItemActive(item.href)
                      ? item.subItems 
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <item.icon 
                    size={20} 
                    className={`group-hover:scale-110 transition-transform ${
                      isItemActive(item.href) ? 'text-white' : 'text-text-secondary'
                    }`} 
                  />
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 + 0.1 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="bg-gold text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.subItems && (
                          <ChevronDown 
                            size={14} 
                            className={`transition-transform duration-200 text-current ${
                              expandedItems.includes(item.label) ? 'rotate-180' : ''
                            }`} 
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Sub Items */}
              {!isCollapsed && item.subItems && expandedItems.includes(item.label) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="ml-4 mt-2 space-y-1"
                >
                  {item.subItems.map((subItem, subIndex) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                        isItemActive(subItem.href)
                          ? 'bg-white/10 text-primary border border-primary/30'
                          : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
                      }`}
                      onClick={() => {
                        if (isMobileMenuOpen) {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                    >
                      <span className="w-2 h-2 bg-primary/50 rounded-full"></span>
                      <span className="flex-1">{subItem.label}</span>
                      {subItem.badge && (
                        <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-gold to-bronze rounded-full mx-auto mb-3 flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <p className="text-text-secondary text-sm">Happy Planning!</p>
          </motion.div>
        )}
      </div>
    </motion.div>
    </>
  );
}
