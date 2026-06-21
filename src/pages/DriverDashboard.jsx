import React, { useState, useEffect } from 'react';
import { rideAPI } from '../services/api';

const DriverDashboard = ({ user, onLogout, onViewHistory }) => {
  const driverId = user.driverId || localStorage.getItem('driverId');

  // Driver States
  const [isAvailable, setIsAvailable] = useState(true);
  const [assignedRides, setAssignedRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);
  
  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (driverId) {
      fetchDriverData();
    } else {
      setError('Driver identity could not be verified. Try signing in again.');
    }
  }, [driverId]);

  const fetchDriverData = async () => {
    setLoading(true);
    setError('');
    try {
      const assignedData = await rideAPI.getAssignedRides(parseInt(driverId));
      setAssignedRides(assignedData);

      const requestedData = await rideAPI.getRequestedRides();
      setRequestedRides(requestedData);
    } catch (err) {
      console.error('Error fetching driver dashboard data:', err);
      setError('Failed to refresh dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    setError('');
    setSuccess('');
    try {
      const nextState = !isAvailable;
      await rideAPI.toggleDriverAvailability(parseInt(driverId), nextState);
      setIsAvailable(nextState);
      setSuccess(`Availability successfully updated to: ${nextState ? 'ONLINE' : 'OFFLINE'}`);
    } catch (err) {
      console.error('Error toggling availability:', err);
      setError('Could not update availability state.');
    }
  };

  const handleAcceptRide = async (rideId) => {
    setError('');
    setSuccess('');
    try {
      await rideAPI.updateRideStatus(rideId, 'ACCEPTED', parseInt(driverId));
      setSuccess(`Ride #${rideId} successfully accepted!`);
      fetchDriverData();
    } catch (err) {
      console.error('Error accepting ride:', err);
      setError(err.response?.data || 'Failed to accept ride. Another driver may have taken it.');
    }
  };

  const handleUpdateStatus = async (rideId, status) => {
    setError('');
    setSuccess('');
    try {
      await rideAPI.updateRideStatus(rideId, status, parseInt(driverId));
      setSuccess(`Trip status updated: ${status.replace('_', ' ')}`);
      fetchDriverData();
    } catch (err) {
      console.error(`Error updating status to ${status}:`, err);
      setError(err.response?.data || 'Failed to update trip status.');
    }
  };

  // Metrics calculations
  const activeTrips = assignedRides.filter(r => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS');
  const completedTrips = assignedRides.filter(r => r.status === 'COMPLETED');
  const totalEarnings = completedTrips.reduce((sum, r) => sum + r.fare, 0);

  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="card-header" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Driver Control Desk</h2>
          <p>Partner: <strong>{user.name}</strong> (Profile ID: #{driverId})</p>
        </div>
        <button className="btn btn-secondary" onClick={onViewHistory} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
          Assigned History
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}
      {success && <div className="alert alert-success"><span>✅</span>{success}</div>}

      {/* Grid Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Availability Toggle */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>DUTY STATUS</span>
            <span style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: isAvailable ? 'var(--success)' : 'var(--text-muted)'
            }}></span>
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: '800', color: isAvailable ? 'var(--success)' : 'var(--text-muted)', margin: '0.5rem 0' }}>
            {isAvailable ? 'ACTIVE ONLINE' : 'DUTY OFFLINE'}
          </p>
          <button 
            className="btn btn-secondary" 
            onClick={handleToggleAvailability}
            style={{ padding: '0.4rem', fontSize: '0.8rem', background: isAvailable ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', color: isAvailable ? 'var(--error)' : 'var(--success)', borderColor: 'var(--card-border)' }}
          >
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Earnings */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>ESTIMATED EARNINGS</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--secondary)', marginTop: '0.25rem' }}>₹{totalEarnings.toFixed(2)}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completedTrips.length} jobs completed</span>
        </div>

        {/* Active Tasks */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>ACTIVE JOBS</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>{activeTrips.length}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned to your vehicle</span>
        </div>
      </div>

      {/* Grid: Active Assignments vs Available Pool */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Active Assignments */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Active Assignments ({activeTrips.length})</span>
            <button className="btn btn-secondary" onClick={fetchDriverData} style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} disabled={loading}>
              Refresh Pool
            </button>
          </h3>

          {activeTrips.length === 0 ? (
            <div className="text-center" style={{ padding: '2.5rem', border: '1px dashed var(--card-border)', borderRadius: '12px', background: '#f8fafc' }}>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No active bookings currently assigned. Go online or check the requests queue below.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeTrips.map(ride => (
                <div key={ride.id} className="history-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', background: '#ffffff', border: '1px solid var(--primary)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span className={`status-badge ${ride.status.toLowerCase()}`}>{ride.status}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '700' }}>TRIP #{ride.id}</span>
                      </div>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>🟢 From: <strong>{ride.pickupLocation}</strong></p>
                      <p style={{ fontSize: '0.9rem' }}>🔴 To: <strong>{ride.dropLocation}</strong></p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Distance: {ride.distance.toFixed(1)} km | Passenger ID: #{ride.userId}
                      </p>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)' }}>₹{ride.fare.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {ride.status === 'ACCEPTED' && (
                      <button className="btn btn-primary" onClick={() => handleUpdateStatus(ride.id, 'IN_PROGRESS')} style={{ flex: 2 }}>
                        Start Trip
                      </button>
                    )}
                    {ride.status === 'IN_PROGRESS' && (
                      <button className="btn btn-primary" onClick={() => handleUpdateStatus(ride.id, 'COMPLETED')} style={{ flex: 2, background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' }}>
                        Complete Trip
                      </button>
                    )}
                    <button className="btn btn-secondary" onClick={() => handleUpdateStatus(ride.id, 'CANCELLED')} style={{ flex: 1, color: 'var(--error)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pool Queue */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
            Available Requests Pool ({requestedRides.length})
          </h3>

          {requestedRides.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem', border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No pending ride requests available currently.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requestedRides.map(ride => (
                <div key={ride.id} className="history-item" style={{ background: '#f8fafc' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>REQUEST #{ride.id}</span>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>From: <strong>{ride.pickupLocation}</strong></p>
                    <p style={{ fontSize: '0.9rem' }}>To: <strong>{ride.dropLocation}</strong></p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Distance: {ride.distance.toFixed(1)} km | Est. Fare: ₹{ride.fare.toFixed(2)}
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleAcceptRide(ride.id)}
                    style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                    disabled={!isAvailable}
                  >
                    Accept Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DriverDashboard;
