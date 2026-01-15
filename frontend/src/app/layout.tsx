import './globals.css'; // <--- ENSURE THIS LINE EXISTS AT THE TOP
import { AuthProvider } from '@/context/AuthContext';
import { ProtocolProvider } from '@/context/ProtocolContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Make sure the body doesn't have a style that hides everything */}
      <body className="antialiased bg-[#020617]"> 
        <AuthProvider>
          <ProtocolProvider>
            {children}
          </ProtocolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}