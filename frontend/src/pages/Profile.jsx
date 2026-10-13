import { useState } from 'react';
import { FiUser, FiMail, FiShield, FiClock, FiEdit2, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Buttons/Button';
import { Modal } from '../components/Modal/Modal';
import { Input } from '../components/Inputs/Input';
import { AlertBanner } from '../components/Alerts/AlertBanner';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.name || 'Cyber Security Admin');
  const [email, setEmail] = useState(user?.email || 'admin@securityloganalyzer.io');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ name, email });
      setSuccessMsg('Profile details updated successfully!');
      setShowEditModal(false);
    } catch {
      console.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const userActivityLogs = [
    { action: 'Updated WAF SQL Injection Rule #942100', timestamp: '2026-07-30 21:40:00' },
    { action: 'Marked Alert ALT-805 as Resolved', timestamp: '2026-07-30 21:18:11' },
    { action: 'Ingested audit_log_2026_07.log (+15 records)', timestamp: '2026-07-30 20:30:00' },
    { action: 'Authenticated SOC Admin Session via 2FA', timestamp: '2026-07-30 19:45:00' }
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div>
        <h2 className="fw-bold text-bright mb-1">Administrator Profile</h2>
        <p className="small text-muted mb-0">SOC Operator Credentials & Security Activity Trail</p>
      </div>

      {successMsg && <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-12 col-lg-4">
          <div className="soc-card p-4 text-center">
            <div className="position-relative d-inline-block mb-3">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt="Profile Avatar"
                className="rounded-circle border border-cyan p-1 shadow-lg"
                width="120"
                height="120"
              />
              <span
                className="position-absolute bottom-0 end-0 p-2 bg-success border border-dark rounded-circle"
                title="Status: Online & Verified"
              ></span>
            </div>

            <h4 className="fw-bold text-bright mb-1">{user?.name || 'Cyber Security Admin'}</h4>
            <span className="soc-badge soc-badge-low mb-3 font-monospace">
              {user?.role || 'Lead SOC Commander'}
            </span>

            <div className="d-flex flex-column gap-2 text-start pt-3 border-top border-secondary small">
              <div className="d-flex align-items-center gap-2 text-muted">
                <FiMail className="text-cyan" /> <span>{user?.email || 'admin@securityloganalyzer.io'}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <FiShield className="text-cyan" /> <span>Department: Cyber Threat Intelligence</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <FiClock className="text-cyan" /> <span>Last Login: {user?.lastLogin || '2026-07-30 21:45:00'}</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                icon={FiEdit2}
                className="w-100"
                onClick={() => setShowEditModal(true)}
              >
                Edit Profile Info
              </Button>
            </div>
          </div>
        </div>

        {/* Audit Log Trail Column */}
        <div className="col-12 col-lg-8">
          <div className="soc-card p-4">
            <h5 className="fw-bold text-bright mb-1">Operator Activity Trail</h5>
            <p className="small text-muted mb-4">Recent administrative actions performed in the SIEM workspace</p>

            <div className="d-flex flex-column gap-3">
              {userActivityLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-dark rounded border border-secondary d-flex align-items-center justify-content-between gap-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <FiCheckCircle className="text-success flex-shrink-0" size={18} />
                    <span className="small text-bright fw-semibold">{log.action}</span>
                  </div>
                  <span className="font-monospace text-muted small">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile Information"
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" isLoading={saving} onClick={handleSaveProfile}>
              Save Profile
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveProfile}>
          <Input
            label="Full Name"
            id="profileName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={FiUser}
            required
          />
          <Input
            label="Email Address"
            id="profileEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={FiMail}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
