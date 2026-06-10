"use client";

import Link from 'next/link';

export default function InvoiceDetailClient({ invoice, billingId, notFound }: { invoice: any, billingId: string, notFound: boolean }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice?.invoice_number}`,
          text: `Here is your receipt from ${invoice?.store?.name || 'our store'}.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      alert('Native sharing is not supported by your browser.');
    }
  };

  if (notFound || !invoice) {
    return (
      <div className="page-center">
        <div className="glass-panel text-center">
          <h1 className="text-error mb-4">Invoice Not Found</h1>
          <p className="text-muted mb-6">We couldn&apos;t locate an invoice with the ID <strong>{billingId}</strong>.</p>
          <Link href="/">
            <button className="btn-primary">Return Home</button>
          </Link>
        </div>
      </div>
    );
  }

  const customerName = invoice.customer?.name || 'Guest';
  const customerPhone = invoice.customer?.phone || '';
  const storeName = invoice.store?.name || 'Your Store';
  const storeAddress = invoice.store?.address || '';
  const storeCity = invoice.store?.city || '';
  const storePhone = invoice.store?.phone || '';
  const storeGst = invoice.store?.gst_number || '';

  return (
    <div className="w-full" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="no-print mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
          &larr; Back to Home
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-secondary" 
            onClick={handleShare}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>
              Share
            </span>
          </button>
          <button 
            className="btn-primary" 
            onClick={() => window.print()}
          >
            Download as PDF
          </button>
        </div>
      </div>

      <div className="glass-panel invoice-paper" style={{ background: 'white', borderRadius: '8px', color: 'black' }}>
        
        {/* Store Header Info */}
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>{storeName}</h1>
          <p className="text-muted">{storeAddress}</p>
          <p className="text-muted">{storeCity}</p>
          <p className="text-muted">Ph: {storePhone}</p>
          {storeGst && <p className="text-muted">GSTIN: {storeGst}</p>}
        </div>

        <hr style={{ borderColor: '#e2e8f0', margin: '2rem 0' }} />

        {/* Invoice Info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' }}>
          <div style={{ flex: '1 1 200px' }}>
            <p className="mb-1"><strong>Invoice #:</strong> {invoice.invoice_number}</p>
            <p className="mb-1"><strong>Billing ID:</strong> {invoice.billing_id}</p>
            <p><strong>Date:</strong> {new Date(invoice.created_at).toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right', flex: '1 1 200px' }}>
            <p className="mb-1"><strong>Bill To:</strong></p>
            <p className="mb-1">{customerName}</p>
            <p>{customerPhone}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div style={{ width: '100%', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ flex: '3' }}>Item</div>
            <div style={{ flex: '1', textAlign: 'center' }}>Qty</div>
            <div style={{ flex: '1', textAlign: 'right' }}>Price</div>
            <div style={{ flex: '2', textAlign: 'right' }}>Total</div>
          </div>
          
          {(invoice.items || []).map((item: any, i: number) => {
            const hasReturns = item.returned_quantity && item.returned_quantity > 0;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: '3' }}>
                    {item.name}
                    {hasReturns && <span style={{ color: 'var(--error)', fontSize: '0.8rem', marginLeft: '8px' }}>(Returned: {item.returned_quantity})</span>}
                  </div>
                  <div style={{ flex: '1', textAlign: 'center' }}>{item.quantity}</div>
                  <div style={{ flex: '1', textAlign: 'right' }}>₹{item.unit_price}</div>
                  <div style={{ flex: '2', textAlign: 'right', textDecoration: hasReturns && item.returned_quantity === item.quantity ? 'line-through' : 'none' }}>
                    ₹{item.unit_price * item.quantity}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Tax Amount:</span>
                <span>₹{invoice.tax_amount}</span>
              </div>
            )}
            {invoice.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--error)' }}>
                <span>Discount:</span>
                <span>-₹{invoice.discount_amount}</span>
              </div>
            )}
            {invoice.loyalty_discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--error)' }}>
                <span>Loyalty Redeemed:</span>
                <span>-₹{invoice.loyalty_discount}</span>
              </div>
            )}
            {invoice.loyalty_points_earned > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                <span>Points Earned:</span>
                <span>+{invoice.loyalty_points_earned} pts</span>
              </div>
            )}
            
            <hr style={{ borderColor: '#e2e8f0', margin: '1rem 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
              <span>GRAND TOTAL:</span>
              <span style={{ color: 'var(--primary)' }}>₹{invoice.grand_total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center" style={{ marginTop: '4rem' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Thank you for your purchase!</p>
          <div className="mt-8 pt-8" style={{ borderTop: '1px dashed #cbd5e1' }}>
             <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>POWERED BY BILLPUSH</p>
          </div>
        </div>

      </div>
    </div>
  );
}
