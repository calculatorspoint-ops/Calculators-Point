export default function NotFound() {
  return <section style={{ maxWidth: 760, margin: '80px auto', padding: 24, textAlign: 'center' }}>
    <p style={{ color: 'var(--brand)', fontWeight: 800 }}>404</p>
    <h1>Page not found</h1>
    <p>The page you’re looking for may have moved or no longer exists.</p>
    <a className="btn btn-primary" href="/">Return home</a>
  </section>;
}
