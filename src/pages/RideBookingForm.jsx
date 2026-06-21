import React, { useState } from 'react';
import { rideAPI } from '../services/api';

const RideBookingForm = ({ user, onLogout, onBookingCreated, onViewHistory, activeRideDetected, onViewActiveTracking }) => {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [distance, setDistance] = useState(1); // default 1 km
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBookRide = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await rideAPI.bookRide(user.userId, pickup, drop, parseFloat(distance));
      setSuccess('SmartRide requested successfully! Allocating nearest driver...');
      
      setPickup('');
      setDrop('');
      setDistance(1);
      
      setTimeout(() => {
        onBookingCreated(data);
      }, 1500);

    } catch (err) {
      console.error('Error booking ride:', err);
      setError(err.response?.data || 'Failed to request ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const estimatedFare = 50.0 + (distance * 15.0);

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
        <h2>Welcome to SmartRide</h2>
        <p>Book quick rides and monitor trip logs in real time</p>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}
      {success && <div className="alert alert-success"><span>✅</span>{success}</div>}

      {/* Active Session Notification */}
      {activeRideDetected && (
        <div style={{ 
          background: 'var(--primary-glow)', 
          border: '1px solid var(--primary)', 
          borderRadius: '12px', 
          padding: '1rem', 
          marginBottom: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚘</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>You have an active ride session</span>
          </div>
          <button className="btn btn-primary" onClick={onViewActiveTracking} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            Track Trip Status
          </button>
        </div>
      )}

      {/* Grid: Form on Left, Summary Card on Right */}
      <div className="booking-grid">
        {/* Form panel */}
        <form onSubmit={handleBookRide}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1.25rem' }}>Route Details</h3>
          
          <div className="form-group">
            <label className="form-label" htmlFor="pickup">Pickup Address</label>
            <input
              id="pickup"
              type="text"
              className="form-control"
              placeholder="e.g. Grand Central Station"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="drop">Destination Address</label>
            <input
              id="drop"
              type="text"
              className="form-control"
              placeholder="e.g. JFK Airport Terminal 4"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Estimated Distance</label>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700' }}>{distance} km</span>
            </div>
            <input
              id="distance"
              type="range"
              min="1"
              max="50"
              step="0.5"
              style={{ width: '100%', accentColor: 'var(--primary)' }}
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              disabled={loading}
            />
          </div>
        </form>

        {/* Summary Side Card */}
        <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--card-border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-dark)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Trip Pricing Summary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Base Ride Fare:</span>
                <span style={{ fontWeight: '600' }}>₹50.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Distance Rate (₹15/km):</span>
                <span style={{ fontWeight: '600' }}>₹{(distance * 15).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Total Estimation:</span>
                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.2rem' }}>₹{estimatedFare.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            onClick={handleBookRide} 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem' }} 
            disabled={loading || !pickup || !drop}
          >
            {loading ? 'Requesting Cab...' : 'Confirm Cab Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideBookingForm;
