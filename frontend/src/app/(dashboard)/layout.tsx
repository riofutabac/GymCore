import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { getCurrentUserServer } from '@/lib/auth-server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <DashboardHeader user={user} />
        <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}