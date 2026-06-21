import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(email, password);
      // Save details to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', data.email);
      if (data.driverId) {
        localStorage.setItem('driverId', data.driverId);
      }

      // Invoke success handler
      onLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-card">
      {/* Left Branding Panel */}
      <div className="brand-panel">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>SmartRide</h1>
          <p style={{ fontSize: '1rem', opacity: '0.9', fontWeight: '500' }}>Smart Transportation Booking Platform</p>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Travel Made Intelligent</h3>
          <p style={{ fontSize: '0.85rem', opacity: '0.8', lineHeight: '1.6' }}>
            Book quick rides, track driver routes, and manage your trips on our modern eco-friendly urban mobility platform.
          </p>
        </div>
        <div style={{ fontSize: '0.8rem', opacity: '0.6' }}>
          Version 2.0.4 (Spring & React Submission)
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="form-panel">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Log in to access your SmartRide dashboard</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="john@smartride.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Verifying Account...' : 'Sign In'}
          </button>
        </form>

        <div className="card-switch" style={{ marginTop: '2rem' }}>
          New to SmartRide? 
          <span onClick={onSwitchToRegister}>Create Account</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
