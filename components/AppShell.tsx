'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isToolPage =
    pathname.includes('/architecture-builder') ||
    pathname.includes('/code-reviewer') ||
    pathname.includes('/docs-generator');

  if (!isToolPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">{children}</div>
      <ChatPanel />
    </div>
  );
}
