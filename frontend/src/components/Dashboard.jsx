import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <span>Welcome, {user?.firstName || user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'contacts' ? 'active' : ''}
          onClick={() => setActiveTab('contacts')}
        >
          Contacts
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="tab-content">
                <h2>Overview</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-value">{stats.totalUsers || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Contacts</h3>
                    <p className="stat-value">{stats.totalContacts || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Active Users</h3>
                    <p className="stat-value">{stats.activeUsers || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Logs</h3>
                    <p className="stat-value">{stats.totalLogs || 0}</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'users' && (
              <div className="tab-content">
                <h2>User Management</h2>
                <p>User management features coming soon...</p>
              </div>
            )}
            {activeTab === 'contacts' && (
              <div className="tab-content">
                <h2>Contacts Management</h2>
                <p>Contacts management features coming soon...</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="tab-content">
                <h2>Settings</h2>
                <p>Settings features coming soon...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;