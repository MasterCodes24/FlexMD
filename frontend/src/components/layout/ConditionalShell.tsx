"use client";

import { usePathname } from 'next/navigation';
import AppShell from './AppShell';

// Routes that should NOT render inside the AppShell sidebar layout
const PUBLIC_ROUTES = ['/', '/login', '/register', '/otp'];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
