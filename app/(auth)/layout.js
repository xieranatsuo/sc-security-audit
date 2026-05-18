import { AuthProvider } from '@/lib/auth-context';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  );
}
