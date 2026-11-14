import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { Alert } from '../components/Feedback';
import logoLight from '../assets/gc-logo-light.png';

// One page for both Login and Registration.
// "/login" shows the login form, "/register" shows the registration form.
export default function LoginPage({ mode = 'login' }) {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const isRegister = mode === 'register';

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.email.trim() || !form.password) return 'Please enter your email and password.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email address.';
    if (isRegister) {
      if (!form.name.trim()) return 'Please enter your full name.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password !== form.confirm) return 'Passwords do not match.';
    }
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);

    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      } else {
        await login(form.email.trim(), form.password);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // The backend answers 400 "Invalid credentials" or "User already exists"
      setError(getErrorMessage(err, isRegister ? 'Registration failed.' : 'Login failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setError('');
    setForm({ name: '', email: form.email, password: '', confirm: '' });
  };

  return (
    <div className="auth-page">
      <section className="auth-hero" aria-hidden="true">
        <div className="auth-hero-inner">
          <span className="hero-kicker">GodzillaCoder SupportDesk</span>
          <h2>Support requests, tracked from open to resolved.</h2>
          <ul className="hero-points">
            <li>Submit a ticket in seconds</li>
            <li>Follow the status of every request</li>
            <li>Admins manage all tickets and users</li>
          </ul>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <img src={logoLight} alt="GodzillaCoder logo" className="auth-logo" />
          <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">
            {isRegister
              ? 'Register to start submitting support tickets.'
              : 'Sign in to GodzillaCoder SupportDesk.'}
          </p>

          {params.get('expired') && !error && (
            <Alert type="info">Your session has expired. Please sign in again.</Alert>
          )}
          <Alert>{error}</Alert>

          <form onSubmit={onSubmit} noValidate className="form">
            {isRegister && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" value={form.name} onChange={onChange} autoComplete="name" placeholder="e.g. Jane Doe" />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={onChange} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'At least 6 characters' : 'Your password'} />
            </div>
            {isRegister && (
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input id="confirm" name="confirm" type="password" value={form.confirm} onChange={onChange} autoComplete="new-password" placeholder="Repeat your password" />
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={isRegister ? '/login' : '/register'} onClick={switchMode}>
              {isRegister ? 'Login' : 'Register here'}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
