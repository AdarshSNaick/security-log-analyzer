import { useState, useContext } from 'react';
import { FiUser, FiBell, FiShield, FiSliders, FiMoon, FiSun, FiSave } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../context/ThemeContext';
import { Input } from '../components/Inputs/Input';
import { Button } from '../components/Buttons/Button';
import { AlertBanner } from '../components/Alerts/AlertBanner';

export const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState('account');

  // Account form state
  const [name, setName] = useState(user?.name || 'Cyber Security Admin');
  const [email, setEmail] = useState(user?.email || 'admin@securityloganalyzer.io');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification settings state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [criticalSms, setCriticalSms] = useState(false);

  // Security Thresholds state
  const [bruteForceThreshold, setBruteForceThreshold] = useState('5');
  const [wafBlockMode, setWafBlockMode] = useState('strict');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({ name, email });
      setSuccessMsg('Administrator account settings updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch {
      setErrorMsg('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setSuccessMsg('SOC Notification preferences updated successfully.');
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div>
        <h2 className="fw-bold text-bright mb-1">SOC Administrator Settings</h2>
        <p className="small text-muted mb-0">Configure system thresholds, alert channels, administrator profile, and theme preferences</p>
      </div>

      {successMsg && <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
      {errorMsg && <AlertBanner type="error" message={errorMsg} onClose={() => setErrorMsg('')} />}

      <div className="row g-4">
        {/* Navigation Tabs Column */}
        <div className="col-12 col-md-3">
          <div className="soc-card p-3 d-flex flex-column gap-2">
            <button
              className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 border-0 ${
                activeTab === 'account' ? 'soc-btn-primary text-dark fw-bold' : 'text-muted hover-bg-dark'
              }`}
              onClick={() => setActiveTab('account')}
            >
              <FiUser size={18} /> Admin Profile
            </button>
            <button
              className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 border-0 ${
                activeTab === 'notifications' ? 'soc-btn-primary text-dark fw-bold' : 'text-muted hover-bg-dark'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <FiBell size={18} /> Notifications
            </button>
            <button
              className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 border-0 ${
                activeTab === 'thresholds' ? 'soc-btn-primary text-dark fw-bold' : 'text-muted hover-bg-dark'
              }`}
              onClick={() => setActiveTab('thresholds')}
            >
              <FiSliders size={18} /> Threat Thresholds
            </button>
            <button
              className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 border-0 ${
                activeTab === 'theme' ? 'soc-btn-primary text-dark fw-bold' : 'text-muted hover-bg-dark'
              }`}
              onClick={() => setActiveTab('theme')}
            >
              <FiShield size={18} /> Appearance & Theme
            </button>
          </div>
        </div>

        {/* Content Column */}
        <div className="col-12 col-md-9">
          <div className="soc-card p-4 p-md-5">
            {activeTab === 'account' && (
              <form onSubmit={handleSaveAccount}>
                <h4 className="fw-bold text-bright mb-4 border-bottom border-secondary pb-3">
                  Account Credentials & Info
                </h4>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <Input
                      label="Full Name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <Input
                      label="Administrator Email"
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <Input
                      label="New Password (Optional)"
                      id="password"
                      type="password"
                      placeholder="Leave blank to keep unchanged"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <Input
                      label="Confirm Password"
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top border-secondary">
                  <Button type="submit" variant="primary" icon={FiSave} isLoading={saving}>
                    Save Account Changes
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'notifications' && (
              <form onSubmit={handleSaveNotifications}>
                <h4 className="fw-bold text-bright mb-4 border-bottom border-secondary pb-3">
                  Alert Notification Dispatch
                </h4>
                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="p-3 bg-dark rounded border border-secondary d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="fw-bold text-bright mb-1">Email Alert Notifications</h6>
                      <p className="small text-muted mb-0">Receive instant email digests when Critical or High alerts are triggered.</p>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input bg-dark border-secondary fs-5"
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-dark rounded border border-secondary d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="fw-bold text-bright mb-1">Slack / Webhook Alert Dispatch</h6>
                      <p className="small text-muted mb-0">Dispatch live incident payloads to #soc-alerts Slack channel.</p>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input bg-dark border-secondary fs-5"
                        checked={slackAlerts}
                        onChange={(e) => setSlackAlerts(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-dark rounded border border-secondary d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="fw-bold text-bright mb-1">Critical Threat SMS Pager</h6>
                      <p className="small text-muted mb-0">PagerDuty emergency SMS dispatch for P0/P1 incidents.</p>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input bg-dark border-secondary fs-5"
                        checked={criticalSms}
                        onChange={(e) => setCriticalSms(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="primary" icon={FiSave}>
                  Save Notification Preferences
                </Button>
              </form>
            )}

            {activeTab === 'thresholds' && (
              <div>
                <h4 className="fw-bold text-bright mb-4 border-bottom border-secondary pb-3">
                  Detection Engine Thresholds
                </h4>
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">
                      SSH / Login Failed Attempts Limit
                    </label>
                    <select
                      className="form-select soc-input"
                      value={bruteForceThreshold}
                      onChange={(e) => setBruteForceThreshold(e.target.value)}
                    >
                      <option value="3">3 Failures / min (Aggressive)</option>
                      <option value="5">5 Failures / min (Standard)</option>
                      <option value="10">10 Failures / min (Permissive)</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">
                      Web Application Firewall (WAF) Mode
                    </label>
                    <select
                      className="form-select soc-input"
                      value={wafBlockMode}
                      onChange={(e) => setWafBlockMode(e.target.value)}
                    >
                      <option value="strict">Strict Auto-Block & Blackhole</option>
                      <option value="challenge">Cloudflare Challenge Mode</option>
                      <option value="log_only">Log-Only (Passive Audit)</option>
                    </select>
                  </div>
                </div>

                <Button variant="primary" icon={FiSave} onClick={() => setSuccessMsg('Detection thresholds updated.')}>
                  Update Detection Rules
                </Button>
              </div>
            )}

            {activeTab === 'theme' && (
              <div>
                <h4 className="fw-bold text-bright mb-4 border-bottom border-secondary pb-3">
                  User Interface Theme
                </h4>
                <div className="p-4 bg-dark rounded border border-secondary d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    {isDark ? <FiMoon size={28} className="text-cyan" /> : <FiSun size={28} className="text-warning" />}
                    <div>
                      <h6 className="fw-bold text-bright mb-1">
                        Current Theme Mode: {isDark ? 'Dark Mode (Cyber SOC)' : 'Light Mode'}
                      </h6>
                      <p className="small text-muted mb-0">Toggle between enterprise SOC dark cyber theme and high-contrast light theme.</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={toggleTheme}>
                    Switch to {isDark ? 'Light Theme' : 'Dark Theme'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
