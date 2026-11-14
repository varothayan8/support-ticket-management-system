import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page page-narrow">
      <section className="card not-found">
        <span className="nf-code">404</span>
        <h2>Page not found</h2>
        <p className="muted">The page you are looking for does not exist.</p>
        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
      </section>
    </div>
  );
}
