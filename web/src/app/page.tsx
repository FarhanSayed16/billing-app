"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [billingId, setBillingId] = useState('');
  const [phone, setPhone] = useState('');

  const handleBillingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (billingId.trim()) {
      router.push(`/invoice/${billingId.trim()}`);
    }
  };

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length === 10) {
      router.push(`/history?phone=${phone.trim()}`);
    } else {
      alert("Please enter a valid 10-digit phone number");
    }
  };

  return (
    <div className="page-center">
    <div className="w-full" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="text-center mb-8 pb-4">
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', letterSpacing: '-1px' }}>BillPush</h1>
        <p className="text-muted" style={{ fontSize: '1.2rem' }}>Access your digital receipts anywhere.</p>
      </div>

      <div className="landing-grid">
        {/* Card 1: Billing ID Lookup */}
        <div className="glass-panel">
          <h2 className="mb-2">I have a Billing ID</h2>
          <p className="text-muted mb-6">Enter the 16-character code found on your receipt to view the full details of your purchase.</p>
          
          <form onSubmit={handleBillingSearch}>
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="e.g. A1B2C3D4E5F6G7H8" 
                value={billingId}
                onChange={(e) => setBillingId(e.target.value.toUpperCase())}
                maxLength={20}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">Look Up Invoice</button>
          </form>
        </div>

        {/* Card 2: Phone Number Lookup */}
        <div className="glass-panel">
          <h2 className="mb-2">View Purchase History</h2>
          <p className="text-muted mb-6">Enter your phone number to retrieve a summary of your recent purchases across all BillPush stores.</p>
          
          <form onSubmit={handlePhoneSearch}>
            <div className="mb-4">
              <input 
                type="tel" 
                placeholder="10-Digit Mobile Number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                pattern="[0-9]*"
                required
              />
            </div>
            <button type="submit" className="btn-secondary w-full">Search History</button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
