import Link from 'next/link';

async function fetchInvoice(billingId: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/invoices/billing/${billingId}`;
  const res = await fetch(url, { cache: 'no-store' });
  
  if (!res.ok) {
    return null;
  }
  
  return res.json();
}

export default async function InvoiceDetail({ params }: { params: { billingId: string } }) {
  const invoice = await fetchInvoice(params.billingId);

  if (!invoice) {
    return (
      <div className="page-center">
        <div className="glass-panel text-center">
          <h1 className="text-error mb-4">Invoice Not Found</h1>
          <p className="text-muted mb-6">We couldn't locate an invoice with the ID <strong>{params.billingId}</strong>.</p>
          <Link href="/">
            <button className="btn-primary">Return Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="no-print mb-6 display-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
          &larr; Back to Home
        </Link>
        <button 
          className="btn-primary" 
          onClick="window.print()" 
        >
          Download as PDF
        </button>
      </div>

      <div className="glass-panel invoice-paper" style={{ background: 'white', borderRadius: '8px', color: 'black' }}>
        
        {/* Store Header Info */}
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>{invoice.store_name || "Your Store"}</h1>
          <p className="text-muted">{invoice.store?.address || invoice.store_address || ""}</p>
          <p className="text-muted">{invoice.store?.city || ""}</p>
          <p className="text-muted">Ph: {invoice.store?.phone || ""}</p>
          {invoice.store?.gst_number && <p className="text-muted">GSTIN: {invoice.store.gst_number}</p>}
        </div>

        <hr style={{ borderColor: '#e2e8f0', margin: '2rem 0' }} />

        {/* Invoice Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <p><strong>Invoice #:</strong> {invoice.invoice_number}</p>
            <p><strong>Billing ID:</strong> {invoice.billing_id}</p>
            <p><strong>Date:</strong> {new Date(invoice.created_at).toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p><strong>Bill To:</strong></p>
            <p>{invoice.customer_name || 'Guest'}</p>
            <p>{invoice.customer_phone || ''}</p>
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
          
          {(invoice.items || []).map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ flex: '3' }}>{item.name}</div>
              <div style={{ flex: '1', textAlign: 'center' }}>{item.quantity}</div>
              <div style={{ flex: '1', textAlign: 'right' }}>₹{item.unit_price}</div>
              <div style={{ flex: '2', textAlign: 'right' }}>₹{item.unit_price * item.quantity}</div>
            </div>
          ))}
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
            {invoice.loyalty_points_redeemed > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--error)' }}>
                <span>Loyalty Redeemed:</span>
                <span>-₹{invoice.loyalty_points_redeemed}</span>
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
      
      {/* Script injected to handle print because onClick doesn't map directly in pure Server Components unless wrapped in client component, so we export a simple client wrapper or use raw DOM injection */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('button.btn-primary').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  );
}
