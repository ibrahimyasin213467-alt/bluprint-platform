"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dinamik import ile SSR'ı tamamen devre dışı bırak
const CreatePageContent = dynamic(
  () => import('./CreatePageContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    )
  }
);

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}