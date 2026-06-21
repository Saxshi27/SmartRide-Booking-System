import React, { useState, useEffect } from 'react';
import { rideAPI } from '../services/api';

const RideStatusScreen = ({ rideId, onBackToBooking, user }) => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRideDetails();
    
    // Auto-refresh status every 8 seconds
    const interval = setInterval(fetchRideDetails, 8000);
    return () => clearInterval(interval);
  }, [rideId]);

  const fetchRideDetails = async () => {
    setError('');
    try {
      const data = await rideAPI.getRideDetails(rideId);
      setRide(data);
    } catch (err) {
      console.error('Error fetching ride details:', err);
      setError('Could not fetch active ride updates.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride request?')) return;
    
    setActionLoading(true);
    setError('');
    try {
      const data = await rideAPI.updateRideStatus(rideId, 'CANCELLED');
      setRide(data);
      alert('Ride request has been successfully cancelled.');
    } catch (err) {
      console.error('Error cancelling ride:', err);
      setError(err.response?.data || 'Failed to cancel the ride. It may have progressed already.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !ride) {
    return (
      <div className="dashboard-card text-center" style={{ padding: '4rem 2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Connecting to SmartRide tracking system...</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="dashboard-card text-center" style={{ padding: '4rem 2rem' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1.5rem' }}>Active ride data could not be recovered.</p>
        <button className="btn btn-primary" onClick={onBackToBooking}>Return to Booking</button>
      </div>
    );
  }

  const statuses = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
  const currentStatus = ride.status.toUpperCase();
  const currentStep = statuses.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Trip Monitor</h2>
          <p>Real-time status updates for SmartRide booking #{ride.id}</p>
        </div>
        <button className="btn btn-secondary" onClick={onBackToBooking} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
          New Ride
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

      {/* Grid: Left: vertical progress tracker cards. Right: details card */}
      <div className="booking-grid">
        {/* Left timeline */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1rem' }}>Trip Status Log</h3>
          
          {isCancelled ? (
            <div className="alert alert-error" style={{ padding: '1.5rem', fontWeight: '700', justifyContent: 'center' }}>
              🛑 THIS RIDE HAS BEEN CANCELLED
            </div>
          ) : (
            <div className="status-timeline">
              {statuses.map((status, index) => {
                const active = index <= currentStep;
                const current = index === currentStep;
                
                let stepLabel = 'Ride Requested';
                let stepDesc = 'Waiting for driver allocation...';
                if (status === 'ACCEPTED') {
                  stepLabel = 'Driver Assigned';
                  stepDesc = 'Driver is en route to pickup...';
                } else if (status === 'IN_PROGRESS') {
                  stepLabel = 'Trip Started';
                  stepDesc = 'You are currently on the move...';
                } else if (status === 'COMPLETED') {
                  stepLabel = 'Concluded';
                  stepDesc = 'Thank you for riding with SmartRide!';
                }

                return (
                  <div 
                    key={status} 
                    className={`status-step-card ${current ? 'active' : ''} ${active && !current ? 'completed' : ''}`}
                  >
                    <div className="status-number-circle">
                      {active && !current ? '✓' : index + 1}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '700', color: current ? 'var(--primary)' : 'var(--text-dark)', textTransform: 'capitalize' }}>
                        {stepLabel}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stepDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Info card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Parameters */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-dark)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Trip Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>PICKUP</span>
                <strong style={{ color: 'var(--text-dark)' }}>{ride.pickupLocation}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>DESTINATION</span>
                <strong style={{ color: 'var(--text-dark)' }}>{ride.dropLocation}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>DISTANCE</span>
                  <strong style={{ color: 'var(--text-dark)', fontSize: '1rem' }}>{ride.distance.toFixed(1)} km</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>FINAL FARE</span>
                  <strong style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>₹{ride.fare.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Card */}
          {ride.driverId ? (
            <div style={{ background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: '16px', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>🚘 Driver Profile</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '600' }}>SmartRide Partner ID #{ride.driverId}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Assigned, driving to location.</p>
            </div>
          ) : (
            !isCancelled && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#d97706', fontWeight: '700', fontSize: '0.9rem' }}>⌛ Seeking Driver...</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Searching the database for available drivers.</p>
              </div>
            )
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            {(currentStatus === 'REQUESTED' || currentStatus === 'ACCEPTED') && (
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelRide}
                disabled={actionLoading}
                style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.25)', flex: 1 }}
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Request'}
              </button>
            )}
            <button className="btn btn-primary" onClick={fetchRideDetails} style={{ flex: 1 }}>
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideStatusScreen;
