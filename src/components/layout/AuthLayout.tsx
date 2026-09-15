import React from 'react';
import { Outlet } from 'react-router-dom';
import { School } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex flex-col justify-between">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <Outlet />
      </main>
      <footer className="py-4 px-6 text-center">
        <p className="text-[11px] text-slate-400">
          FixTrack · School Facility Concern Reporting & Maintenance System · AY 2026–27
        </p>
      </footer>
    </div>
  );
};
