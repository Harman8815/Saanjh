'use client';

import { usePathname } from 'next/navigation';
import { useLoading } from "../../hooks/useLoading";
import LoadingAnimation from "./LoadingAnimation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isDashboardPage = pathname?.startsWith('/dashboard');
  const { isLoading } = useLoading(2500);

  // Skip loading animation for dashboard pages (they have their own skeleton loading)
  if (isDashboardPage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <LoadingAnimation />
      <div className={`${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-500`}>
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
