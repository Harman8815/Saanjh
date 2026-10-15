'use client';

import { Suspense } from 'react';
import WebsiteEditorClient from './page-client';

export default function WebsiteEditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <WebsiteEditorClient />
    </Suspense>
  );
}
