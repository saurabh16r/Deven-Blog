import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingClient from './PricingClient';

export const metadata = {
  title: 'Pricing - Deven Premium Membership',
  description: 'Unlock unlimited access to high-quality founder briefings, audio narration, and case studies.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <PricingClient />
      </main>

      <Footer />
    </div>
  );
}
