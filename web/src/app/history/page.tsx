"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function HistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phone = searchParams.get('phone');

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!phone) {
      router.push('/');
      return;
    }

    const fetchHistory = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/invoices/customer/${phone}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        setError('Could not retrieve purchase history. Please check the number and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [phone, router]);

  if (loading) {
    return <div className="text-center mt-8"><p className="text-muted">Loading your purchase history...</p></div>;
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-error mb-4">{error}</p>
        <button onClick={() => router.push('/')} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="mb-8">
        <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
          &larr; Back to Home
        </Link>
      </div>

      <div className="glass-panel text-center mb-8">
        <h1 style={{ color: 'var(--primary)' }}>Purchase Summary</h1>
        <p className="text-muted">History for <strong>{phone}</strong></p>
      </div>

      {invoices.length === 0 ? (
        <div className="glass-panel text-center">
          <p className="text-muted">No purchase history found for this number.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '0' }}>
          {invoices.map((inv, idx) => (
            <div key={inv.id || idx} className="history-item" onClick={() => router.push(`/invoice/${inv.billing_id}`)}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{inv.store_name || 'BillPush Store'}</p>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {new Date(inv.invoice_date).toLocaleDateString()} &middot; {new Date(inv.invoice_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
                  ₹{inv.grand_total}
                </p>
                <p className="text-muted" style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>View Detail &rarr;</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-center mt-8">
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          For privacy, full itemized details are only available via direct Billing ID. Click "View Detail" to access.
        </p>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="text-center mt-8"><p className="text-muted">Loading...</p></div>}>
      <HistoryContent />
    </Suspense>
  );
}
