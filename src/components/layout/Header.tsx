import React from 'react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/app/providers/ThemeProvider';

const Header: React.FC = () => {
  const { theme, toggle } = useTheme();
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-blue-600" />
          <span className="text-lg font-semibold">Web App</span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={toggle}>
            Toggle {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

