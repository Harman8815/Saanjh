'use client';

import { ChevronLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    ...items
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-muted mb-6">
      <Link 
        href="/dashboard"
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
      >
        <Home size={16} />
        <span>Dashboard</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          <ChevronLeft size={16} />
          {item.href ? (
            <Link 
              href={item.href}
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-white/10 hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span className="px-3 py-2 bg-surface border border-white/10 rounded-lg">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
