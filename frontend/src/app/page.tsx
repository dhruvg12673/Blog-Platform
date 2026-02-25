import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
        Welcome to <span style={{ color: 'var(--accent)' }}>BlogPlatform</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
        A clean, secure platform to write and share your thoughts with the world.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/feed" className="btn btn-primary">Browse Feed</Link>
        <Link href="/register" className="btn btn-outline">Start Writing</Link>
      </div>
    </div>
  );
}