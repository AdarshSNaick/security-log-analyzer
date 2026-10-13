import { useState, useEffect } from 'react';
import {
  NavLink,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  FiGrid,
  FiUploadCloud,
  FiFileText,
  FiAlertTriangle,
  FiActivity,
  FiPieChart,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';

import { useAuth } from '../hooks/useAuth';
import api from '../services/api';


export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [alertCount, setAlertCount] = useState(0);
  const [incidentCount, setIncidentCount] = useState(0);


  /* ---------------------------------------------------------
     Fetch real alert and incident counts
  --------------------------------------------------------- */

  const fetchCounts = async () => {
    try {
      const [alertsResponse, incidentsResponse] =
        await Promise.all([
          api.get('/alerts/'),
          api.get('/incidents/'),
        ]);


      /* -----------------------------
         Alerts
      ----------------------------- */

      const alertsData =
        Array.isArray(alertsResponse.data)
          ? alertsResponse.data
          : alertsResponse.data?.results ?? [];


      const activeAlerts = alertsData.filter(
        (alert) =>
          String(alert.status ?? '').toUpperCase() !==
          'RESOLVED'
      );


      setAlertCount(activeAlerts.length);


      /* -----------------------------
         Incidents
      ----------------------------- */

      const incidentsData =
        Array.isArray(incidentsResponse.data)
          ? incidentsResponse.data
          : incidentsResponse.data?.results ?? [];


      const activeIncidents = incidentsData.filter(
        (incident) => {
          const status = String(
            incident.status ?? ''
          ).toUpperCase();

          return (
            status !== 'RESOLVED' &&
            status !== 'CLOSED'
          );
        }
      );


      setIncidentCount(
        activeIncidents.length
      );

    } catch (error) {
      console.error(
        'Failed to load sidebar security counts:',
        error
      );

      /*
       * Do not fall back to mock numbers.
       * If the API is unavailable, show zero
       * rather than displaying incorrect data.
       */
      setAlertCount(0);
      setIncidentCount(0);
    }
  };


  /* ---------------------------------------------------------
     Initial load + refresh when navigating
  --------------------------------------------------------- */

  useEffect(() => {
    fetchCounts();
  }, [location.pathname]);


  /* ---------------------------------------------------------
     Periodic refresh
  --------------------------------------------------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCounts();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  /* ---------------------------------------------------------
     Navigation items
  --------------------------------------------------------- */

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: FiGrid,
    },

    {
      label: 'Upload Logs',
      path: '/upload',
      icon: FiUploadCloud,
    },

    {
      label: 'Logs',
      path: '/logs',
      icon: FiFileText,
    },

    {
      label: 'Alerts',
      path: '/alerts',
      icon: FiAlertTriangle,
      badge: alertCount,
    },

    {
      label: 'Incidents',
      path: '/incidents',
      icon: FiActivity,
      badge: incidentCount,
    },

    {
      label: 'Reports',
      path: '/reports',
      icon: FiPieChart,
    },

    {
      label: 'Settings',
      path: '/settings',
      icon: FiSettings,
    },
  ];


  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */

  return (
    <>
      {/* Mobile Backdrop Overlay */}

      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-lg-none"
          style={{
            backgroundColor:
              'rgba(0, 0, 0, 0.7)',
            zIndex: 1040,
          }}
          onClick={onClose}
        />
      )}


      {/* Sidebar */}

      <aside
        className={`soc-sidebar d-flex flex-column flex-shrink-0 p-3 border-end position-fixed top-0 bottom-0 start-0 transition-all ${
          isOpen
            ? 'translate-x-0'
            : 'd-none d-lg-flex'
        }`}
        style={{
          width: '250px',
          backgroundColor:
            'var(--soc-bg-sidebar)',
          borderColor:
            'var(--soc-border-color)',
          zIndex: 1045,
          marginTop: '61px',
          height: 'calc(100vh - 61px)',
        }}
      >

        {/* Section title */}

        <div className="small text-muted text-uppercase fw-bold mb-3 px-3 tracking-wider">
          SOC Operations
        </div>


        {/* Navigation */}

        <ul className="nav nav-pills flex-column mb-auto gap-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li
                key={item.path}
                className="nav-item"
              >

                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-decoration-none transition-all ${
                      isActive
                        ? 'soc-btn-primary text-dark fw-bold'
                        : 'text-muted hover-text-cyan hover-bg-dark'
                    }`
                  }
                >

                  <div className="d-flex align-items-center gap-3">

                    <Icon size={18} />

                    <span>
                      {item.label}
                    </span>

                  </div>


                  {/* Only show badge when there are active items */}

                  {item.badge > 0 && (
                    <span className="soc-badge soc-badge-critical py-0 px-2 font-monospace">
                      {item.badge}
                    </span>
                  )}

                </NavLink>

              </li>
            );
          })}

        </ul>


        {/* Logout */}

        <div className="border-top border-secondary pt-3 mt-auto">

          <button
            type="button"
            className="w-100 btn btn-outline-danger d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 small"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >

            <FiLogOut size={18} />

            <span>
              Logout SOC Session
            </span>

          </button>

        </div>

      </aside>
    </>
  );
};