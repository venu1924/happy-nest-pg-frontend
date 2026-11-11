import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AssistantDock from '../assistant/AssistantDock';

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-nest-soft text-nest-navy">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-24 sm:px-6 sm:py-6">
        <Outlet />
      </main>
      <AssistantDock />
    </div>
  );
}
