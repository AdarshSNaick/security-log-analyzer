import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiMoon, FiSun, FiUser, FiLogOut, FiMenu, FiShield, FiClock, FiSearch } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../context/ThemeContext';
import { SearchBar } from './Inputs/SearchBar';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString().slice(17, 25) + ' UTC');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const notifications = [
    { id: 1, text: 'Critical SQL Injection attempt blocked by WAF', time: '3m ago', type: 'critical' },
    { id: 2, text: 'High rate of SSH login failures from 192.168.1.105', time: '10m ago', type: 'high' },
    { id: 3, text: 'Automated database backup completed successfully', time: '45m ago', type: 'info' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/logs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top px-3 py-2 border-bottom"
      style={{
        backgroundColor: 'var(--soc-bg-navbar)',
        borderColor: 'var(--soc-border-color)',
        backdropFilter: 'var(--soc-glass-backdrop)'
      }}
    >
      <div className="container-fluid p-0">
        {/* Left Section: Brand & Telemetry Pulse */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn text-cyan p-1 border-0 d-lg-none"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <FiMenu size={24} />
          </button>
          
          <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2 m-0 text-decoration-none">
            <div
              className="p-2 rounded-3 d-flex align-items-center justify-content-center shadow-lg"
              style={{ background: 'var(--soc-accent-gradient)', color: '#050814' }}
            >
              <FiShield size={22} />
            </div>
            <div className="d-none d-sm-block">
              <span className="fw-extrabold text-bright tracking-wider fs-5 d-block lh-1">
                SECURITY<span style={{ color: 'var(--soc-cyan)' }}>LOG</span>
              </span>
              <span className="small text-cyan font-monospace" style={{ fontSize: '0.68rem', letterSpacing: '1px' }}>
                SOC COMMAND CENTER
              </span>
            </div>
          </Link>

          {/* Live Telemetry Ticker */}
          <div className="d-none d-xl-flex align-items-center gap-2 ps-3 border-start border-secondary">
            <span className="pulse-indicator"></span>
            <span className="small text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
              TELEMETRY: <span className="text-success fw-bold">ONLINE</span>
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="d-none d-md-flex mx-auto" style={{ maxWidth: '420px', width: '100%' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search logs, IP addresses, threat vectors (Press Enter)..."
          />
        </form>

        {/* Right Controls */}
        <div className="d-flex align-items-center gap-3">
          {/* Live UTC Clock */}
          <div className="d-none d-md-flex align-items-center gap-2 font-monospace text-cyan small bg-dark px-3 py-1 rounded-pill border border-secondary">
            <FiClock size={14} />
            <span>{currentTime}</span>
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            className="btn btn-outline-secondary p-2 rounded-circle border-0 text-cyan d-flex align-items-center"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="position-relative">
            <button
              type="button"
              className="btn btn-outline-secondary p-2 rounded-circle border-0 text-cyan position-relative d-flex align-items-center"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-dark rounded-circle pulse-alert">
                <span className="visually-hidden">Active Alerts</span>
              </span>
            </button>

            {showNotifications && (
              <div
                className="position-absolute end-0 mt-2 soc-card p-3 shadow-lg"
                style={{ width: '340px', zIndex: 1050 }}
              >
                <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom border-secondary">
                  <h6 className="fw-bold text-bright mb-0">SOC Live Threat Feed</h6>
                  <span className="soc-badge soc-badge-critical">3 Active</span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded bg-dark border border-secondary small">
                      <p className="mb-1 text-main fw-semibold">{n.text}</p>
                      <span className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>{n.time}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/alerts"
                  className="d-block text-center small text-cyan mt-3 text-decoration-none fw-bold"
                  onClick={() => setShowNotifications(false)}
                >
                  View Alert Center →
                </Link>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="position-relative">
            <button
              type="button"
              className="btn p-1 border-0 d-flex align-items-center gap-2"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt="Avatar"
                className="rounded-circle border border-cyan"
                width="36"
                height="36"
              />
              <div className="d-none d-lg-block text-start">
                <span className="small text-bright fw-bold d-block lh-1">{user?.name || 'SOC Commander'}</span>
                <span className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>Administrator</span>
              </div>
            </button>

            {showProfileMenu && (
              <div
                className="position-absolute end-0 mt-2 soc-card p-2 shadow-lg"
                style={{ width: '220px', zIndex: 1050 }}
              >
                <div className="px-3 py-2 border-bottom border-secondary mb-1">
                  <p className="small fw-bold text-bright mb-0">{user?.name}</p>
                  <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>{user?.email}</span>
                </div>
                <Link
                  to="/profile"
                  className="d-flex align-items-center gap-2 px-3 py-2 small text-main text-decoration-none rounded hover-bg-dark"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FiUser size={16} /> Operator Profile
                </Link>
                <button
                  type="button"
                  className="w-100 text-start d-flex align-items-center gap-2 px-3 py-2 small text-danger btn p-0 border-0 mt-1"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                >
                  <FiLogOut size={16} /> Logout Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
