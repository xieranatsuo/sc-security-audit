import { Sidebar } from '@/components/layout/Sidebar';

export const metadata = {
  title: 'Dashboard - Smart Contract Audit Platform',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
