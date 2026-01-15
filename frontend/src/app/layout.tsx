import './globals.css';

import { AuthProvider } from '@/context/AuthContext';
import { ProtocolProvider } from '@/context/ProtocolContext';
import { Web3Provider } from '@/lib/wagmiConfig';
import { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#020617]">
        <Web3Provider>
          <AuthProvider>
            <ProtocolProvider>
              <Suspense fallback={
                <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              }>
                {children}
              </Suspense>
            </ProtocolProvider>
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}

