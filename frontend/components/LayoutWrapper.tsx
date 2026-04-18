'use client';

import { useLoading } from "../hooks/useLoading";
import LoadingAnimation from "./LoadingAnimation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isLoading } = useLoading(2500);

  return (
    <>
      <LoadingAnimation />
      <div className={`${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-500`}>
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
