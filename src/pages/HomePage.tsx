import React from 'react';
import { Button } from '@/components/ui/Button';

const HomePage: React.FC = () => {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="text-gray-600">Professional React + TS + Tailwind starter.</p>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </section>
  );
};

export default HomePage;

