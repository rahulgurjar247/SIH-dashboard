import React, { PropsWithChildren } from 'react';
import Header from '@/components/layout/Header';

const RootLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
};

export default RootLayout;

