import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Register = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState('USER'); // USER or DRIVER
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Driver specific fields
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = role === 'USER' 
      ? { name, email, password } 
      : { name, email, password, phone, vehicleNumber };

    console.log(`[FRONTEND] Submitting ${role} Registration Request. Payload:`, payload);

    try {
      if (role === 'USER') {
        const responseData = await authAPI.registerUser(name, email, password);
        console.log('[FRONTEND] Registration Success response:', responseData);
        setSuccess('Passenger registered successfully! Redirecting to login...');
      } else {
        const responseData = await authAPI.registerDriver(name, email, password, phone, vehicleNumber);
        console.log('[FRONTEND] Registration Success response:', responseData);
        setSuccess('Driver partner registered successfully! Redirecting to login...');
      }
      
      // Clear fields
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setVehicleNumber('');

      // Auto redirect to login page after 2 seconds
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);

    } catch (err) {
      console.error('[FRONTEND] Registration Failed. Error response details:', err.response);
      const serverErrorMessage = typeof err.response?.data === 'string' 
        ? err.response.data 
        : (err.response?.data?.message || 'Registration failed. Please check inputs.');
      setError(serverErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-split-card">
      <div className="card-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-dark)' }}>Create SmartRide Account</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Choose your profile type and register below</p>
      </div>

      {/* Select Role via elegant side-by-side card items */}
      <div className="role-selector" style={{ gap: '1rem', marginBottom: '2.5rem' }}>
        <div 
          onClick={() => { if (!loading) setRole('USER'); setError(''); setSuccess(''); }}
          style={{ 
            flex: '1', 
            padding: '1.5rem', 
            border: `2px solid ${role === 'USER' ? 'var(--primary)' : 'var(--card-border)'}`, 
            borderRadius: '16px', 
            textAlign: 'center', 
            cursor: 'pointer', 
            background: role === 'USER' ? 'var(--primary-glow)' : 'transparent',
            transition: 'all 0.2s ease',
            boxShadow: role === 'USER' ? 'var(--shadow-md)' : 'none'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎫</div>
          <h4 style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Passenger Profile</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Book cabs & track rides</p>
        </div>

        <div 
          onClick={() => { if (!loading) setRole('DRIVER'); setError(''); setSuccess(''); }}
          style={{ 
            flex: '1', 
            padding: '1.5rem', 
            border: `2px solid ${role === 'DRIVER' ? 'var(--primary)' : 'var(--card-border)'}`, 
            borderRadius: '16px', 
            textAlign: 'center', 
            cursor: 'pointer', 
            background: role === 'DRIVER' ? 'var(--primary-glow)' : 'transparent',
            transition: 'all 0.2s ease',
            boxShadow: role === 'DRIVER' ? 'var(--shadow-md)' : 'none'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚘</div>
          <h4 style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Driver Partner</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Accept trips & toggle duty</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✅</span>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-control"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="form-control"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '0.5rem' }}>
          <label className="form-label" htmlFor="reg-password">Secure Password</label>
          <input
            id="reg-password"
            type="password"
            className="form-control"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        {role === 'DRIVER' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                type="tel"
                className="form-control"
                placeholder="+1-555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-vehicle">Vehicle License Plate</label>
              <input
                id="reg-vehicle"
                type="text"
                className="form-control"
                placeholder="TX-882-KM"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1.75rem' }} disabled={loading}>
          {loading ? 'Submitting Details...' : `Register as ${role === 'USER' ? 'Passenger' : 'Driver'}`}
        </button>
      </form>

      <div className="card-switch" style={{ marginTop: '2rem' }}>
        Already have a SmartRide account? 
        <span onClick={onSwitchToLogin}>Login here</span>
      </div>
    </div>
  );
};

export default Register;
