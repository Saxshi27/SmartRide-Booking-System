import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import RideBookingForm from './pages/RideBookingForm';
import RideStatusScreen from './pages/RideStatusScreen';
import DriverDashboard from './pages/DriverDashboard';
import RideHistoryPage from './pages/RideHistoryPage';
import { rideAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  
  // Views: 
  // For Guest: 'login', 'register'
  // For Passenger: 'dashboard', 'tracking', 'history'
  // For Driver: 'dashboard', 'history'
  const [view, setView] = useState('login'); 
  
  const [activeRideId, setActiveRideId] = useState(null);
  const [hasActiveRide, setHasActiveRide] = useState(false);

  // Restore authenticated session
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    const driverId = localStorage.getItem('driverId');

    if (token && role && name && userId) {
      const parsedUser = { 
        token, 
        role, 
        name, 
        userId: parseInt(userId), 
        email,
        driverId: driverId ? parseInt(driverId) : null
      };
      setUser(parsedUser);
      setView('dashboard');
      
      if (role === 'ROLE_USER') {
        checkActiveRide(parseInt(userId));
      }
    }
  }, []);

  // Check if passenger already has a trip in progress
  const checkActiveRide = async (userId) => {
    try {
      const history = await rideAPI.getRideHistory(userId);
      const active = history.find(ride => ride.status === 'REQUESTED' || ride.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS');
      if (active) {
        setActiveRideId(active.id);
        setHasActiveRide(true);
      } else {
        setHasActiveRide(false);
        setActiveRideId(null);
      }
    } catch (err) {
      console.error('Error checking active ride status:', err);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    
    // Store in localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('name', userData.name);
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('email', userData.email || '');
    if (userData.driverId) {
      localStorage.setItem('driverId', userData.driverId);
    }

    setView('dashboard');
    
    if (userData.role === 'ROLE_USER') {
      checkActiveRide(userData.userId);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setHasActiveRide(false);
    setActiveRideId(null);
    setView('login');
  };

  const handleBookingCreated = (rideData) => {
    setActiveRideId(rideData.id);
    setHasActiveRide(true);
    setView('tracking');
  };

  const handleBackToBooking = () => {
    if (user) {
      checkActiveRide(user.userId);
      setView('dashboard');
    }
  };

  // Handle unauthorized/forbidden errors globally
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setView('login');
      setHasActiveRide(false);
      setActiveRideId(null);
      alert("Your session has expired or you do not have permission to access this resource. Please sign in again.");
    };

    window.addEventListener('unauthorized-access', handleUnauthorized);
    return () => window.removeEventListener('unauthorized-access', handleUnauthorized);
  }, []);

  const isPassenger = user?.role === 'ROLE_USER';
  const isDriver = user?.role === 'ROLE_DRIVER';

  // Render Guest Login/Register Layout (No Sidebar)
  if (!user || view === 'login' || view === 'register') {
    return (
      <div className="guest-body">
        <main className="guest-main">
          {view === 'login' && (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onSwitchToRegister={() => setView('register')} 
            />
          )}
          
          {view === 'register' && (
            <Register 
              onSwitchToLogin={() => setView('login')} 
            />
          )}
        </main>
      </div>
    );
  }

  // Render Dashboard Layout (With Sidebar)
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="app-nav">
        <div className="nav-brand">
          Smart<span>Ride</span>
        </div>
        <div className="nav-links">
          {isPassenger && (
            <>
              <div 
                className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} 
                onClick={() => setView('dashboard')}
              >
                <span>📍</span> Book a Ride
              </div>
              {hasActiveRide && (
                <div 
                  className={`nav-item ${view === 'tracking' ? 'active' : ''}`} 
                  onClick={() => setView('tracking')}
                >
                  <span>🔄</span> Live Track
                </div>
              )}
              <div 
                className={`nav-item ${view === 'history' ? 'active' : ''}`} 
                onClick={() => setView('history')}
              >
                <span>📜</span> Ride History
              </div>
            </>
          )}

          {isDriver && (
            <>
              <div 
                className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} 
                onClick={() => setView('dashboard')}
              >
                <span>🏢</span> Driver Portal
              </div>
              <div 
                className={`nav-item ${view === 'history' ? 'active' : ''}`} 
                onClick={() => setView('history')}
              >
                <span>📊</span> Trip Logs
              </div>
            </>
          )}
          
          <button className="nav-btn logout" onClick={handleLogout}>Sign Out</button>
        </div>
        <div className="app-footer" style={{ position: 'relative', left: 0, right: 0, marginTop: '2rem', fontSize: '0.7rem' }}>
          <p>© 2026 SmartRide Inc.</p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        {view === 'dashboard' && isPassenger && (
          <RideBookingForm 
            user={user} 
            onLogout={handleLogout} 
            onBookingCreated={handleBookingCreated}
            onViewHistory={() => setView('history')}
            activeRideDetected={hasActiveRide}
            onViewActiveTracking={() => setView('tracking')}
          />
        )}

        {view === 'tracking' && isPassenger && activeRideId && (
          <RideStatusScreen 
            rideId={activeRideId} 
            onBackToBooking={handleBackToBooking}
            user={user}
          />
        )}

        {view === 'dashboard' && isDriver && (
          <DriverDashboard 
            user={user} 
            onLogout={handleLogout}
            onViewHistory={() => setView('history')}
          />
        )}

        {view === 'history' && (
          <RideHistoryPage 
            user={user}
            onBack={() => setView('dashboard')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
