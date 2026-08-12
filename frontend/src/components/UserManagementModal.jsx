import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Key } from 'lucide-react';

export const UserManagementModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('job_work_stitching');
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('kaypee_token');
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.warn('Unable to load users:', err);
    }
  };

  useEffect(() => {
    if (isOpen) fetchUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = localStorage.getItem('kaypee_token');
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password, name, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setMsg('User created successfully!');
      setUsername('');
      setPassword('');
      setName('');
      fetchUsers();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} className="text-amber-400" /> User Rights & Login Management
          </h3>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {msg && (
          <div style={{
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '16px',
            background: msg.startsWith('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: msg.startsWith('Error') ? '#fca5a5' : '#6ee7b7',
            fontSize: '0.85rem'
          }}>
            {msg}
          </div>
        )}

        {/* Create User Form */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus size={16} /> Create New User Account
          </h4>
          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Role Rights</label>
                <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="owner">Master Owner (Full Rights + Valuation)</option>
                  <option value="warehouse_manager">Warehouse Manager (Stock & Approval, NO Valuation)</option>
                  <option value="accessory_picker">Accessory Picker (Ready & Picked Up Queue)</option>
                  <option value="job_work_stitching">Job Work (Stitching Unit)</option>
                  <option value="job_work_finishing">Job Work (Finishing Unit)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ramesh_stitch"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Key size={16} /> Create User Account
            </button>
          </form>
        </div>

        {/* Existing Users List */}
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>Active System Users</h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {users.map(u => (
            <div key={u.id} className="glass-card" style={{ padding: '10px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{u.name}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '8px' }}>@{u.username}</span>
              </div>
              <span className="badge badge-manager">{u.role}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
