'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      router.replace(`/invitation-preview/image/${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-50 to-indigo-100 flex items-center justify-center">
      <p className="text-gray-600">Loading invitation preview...</p>
    </div>
  );
}

/**
 * Legacy image preview route.
 *
 * Card-backed previews now live at /invitation-preview/image/[id]; this page
 * only redirects a ?id= query to it.
 */
export default function ImageInvitationPreviewRedirect() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-50 to-indigo-100 flex items-center justify-center"><p className="text-gray-600">Loading invitation preview...</p></div>}>
      <RedirectContent />
    </Suspense>
  );
}
