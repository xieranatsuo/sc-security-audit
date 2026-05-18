export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
