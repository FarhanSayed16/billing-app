import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-center text-center">
      <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--primary)' }}>404</h1>
        <h2 className="mb-4">Invoice Not Found</h2>
        <p className="text-muted mb-8">
          We couldn't locate the bill you're searching for. It may have been removed or the link is incorrect.
        </p>
        <Link href="/">
          <button className="btn-primary w-full">Return Home</button>
        </Link>
      </div>
    </div>
  );
}
