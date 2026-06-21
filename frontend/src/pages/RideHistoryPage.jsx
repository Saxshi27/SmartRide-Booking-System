import React, { useState, useEffect } from 'react';
import { rideAPI } from '../services/api';

const RideHistoryPage = ({ user, onBack }) => {
  const isDriver = user.role === 'ROLE_DRIVER';
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      let data = [];
      if (isDriver) {
        const driverId = user.driverId || localStorage.getItem('driverId');
        if (driverId) {
          data = await rideAPI.getAssignedRides(parseInt(driverId));
        } else {
          setError('Driver profile ID not loaded correctly. Try logging in again.');
        }
      } else {
        data = await rideAPI.getRideHistory(user.userId);
      }
      data.sort((a, b) => new Date(b.requestTime) - new Date(a.requestTime));
      setRides(data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Could not retrieve ride history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      ride.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.dropLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.id.toString().includes(searchTerm);
      
    const matchesStatus = statusFilter === 'ALL' || ride.status.toUpperCase() === statusFilter.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Ride Logs</h2>
          <p>Review {isDriver ? 'assigned deliveries' : 'past booked trips'} on SmartRide</p>
        </div>
        <button className="btn btn-secondary" onClick={onBack} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
          Back to Dashboard
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search pickup, drop, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '160px' }}>
          <select 
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button className="btn btn-secondary" onClick={fetchHistory} style={{ width: 'auto', height: '40px' }} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem 0' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading history records...</p>
        </div>
      ) : filteredRides.length === 0 ? (
        <div className="text-center" style={{ padding: '4rem 1rem', border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No history entries found matching criteria.</p>
        </div>
      ) : (
        /* Redesigned Clean Table Layout */
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Date</th>
                <th>Route Info</th>
                <th>Distance</th>
                <th>Fare Paid</th>
                <th>Status</th>
                <th>{isDriver ? 'Passenger' : 'Driver'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRides.map((ride) => (
                <tr key={ride.id}>
                  <td><strong>#{ride.id}</strong></td>
                  <td>{formatDate(ride.requestTime)}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.85rem' }}>🟢 {ride.pickupLocation}</span>
                      <span style={{ fontSize: '0.85rem' }}>🔴 {ride.dropLocation}</span>
                    </div>
                  </td>
                  <td>{ride.distance.toFixed(1)} km</td>
                  <td><strong style={{ color: 'var(--text-dark)' }}>₹{ride.fare.toFixed(2)}</strong></td>
                  <td>
                    <span className={`status-badge ${ride.status.toLowerCase()}`}>
                      {ride.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {isDriver ? `ID: #${ride.userId}` : (ride.driverId ? `ID: #${ride.driverId}` : 'None')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RideHistoryPage;
