import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiShield } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Inputs/Input';
import { Button } from '../components/Buttons/Button';
import { AlertBanner } from '../components/Alerts/AlertBanner';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your SOC username.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.message ||
          'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // const handleDemoLogin = () => {
  //   setUsername('admin_sec');
  //   setPassword('CyberGuard2026!');
  // };

  return (
    <div className="soc-card p-4 p-md-5 border-cyan login-card">
      
      {/* =====================================================
          LOGIN HEADER
      ====================================================== */}
      <div className="text-center mb-4">
        <div
          className="d-inline-flex p-3 rounded-circle mb-3"
          style={{
            background: 'var(--soc-accent-gradient)',
            color: '#070b19'
          }}
        >
          <FiShield size={32} />
        </div>

        <h3 className="fw-bold login-card-title mb-1">
          Security Log Analyzer
        </h3>

        <p className="small login-card-subtitle mb-0">
          Sign in to access your Security Operations Center
        </p>
      </div>

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}
      {error && (
        <AlertBanner
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* =====================================================
          LOGIN FORM
      ====================================================== */}
      <form onSubmit={handleSubmit}>

        {/* Username */}
        <Input
          label="Username / Agent ID"
          id="username"
          type="text"
          placeholder="e.g. admin_sec"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          icon={FiUser}
          required
        />

        {/* Password */}
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={FiLock}
          required
        />

        {/* Remember Me / Forgot Password */}
        <div className="d-flex align-items-center justify-content-between mb-4">

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input bg-dark border-secondary"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />

            <label
              className="form-check-label small login-card-muted ms-1"
              htmlFor="rememberMe"
            >
              Remember Me
            </label>
          </div>

          <button
            type="button"
            className="btn btn-link text-cyan p-0 border-0 text-decoration-none small"
            onClick={() =>
              alert(
                'Please contact your SOC Administrator to reset authentication tokens.'
              )
            }
          >
            Forgot Password?
          </button>

        </div>

        {/* Authenticate */}
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          className="w-100 py-2 mb-3 fs-6"
        >
          Authenticate & Enter SOC
        </Button>

        {/* Demo Credentials */}
        {/* <button
          type="button"
          className="w-100 btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
          onClick={handleDemoLogin}
        >
          <FiKey size={14} />
          Fill Demo Credentials
        </button> */}

      </form>
    </div>
  );
};