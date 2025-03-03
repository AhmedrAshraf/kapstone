import React from 'react';
import { useAuthStore } from '../../store/authStore';

interface AdminOverlayProps {
  children: React.ReactNode;
}

export function AdminOverlay({ children }: AdminOverlayProps) {
  const { user } = useAuthStore();

  // For non-admin users, render children directly
  if (user?.role !== 'super_admin') {
    return <>{children}</>;
  }

  // For admin users, wrap children in a div with edit mode class
  return (
    <div className="cms-edit-mode">
      {children}
    </div>
  );
}