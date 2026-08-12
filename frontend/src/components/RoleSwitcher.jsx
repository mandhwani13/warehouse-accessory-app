import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, Package, Scissors, Sparkles } from 'lucide-react';

export const RoleSwitcher = () => {
  const { user, switchRole, DEMO_USERS } = useAuth();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Shield size={14} className="text-amber-600" />;
      case 'warehouse_manager': return <UserCheck size={14} className="text-blue-600" />;
      case 'accessory_picker': return <Package size={14} className="text-purple-600" />;
      case 'job_work_stitching': return <Scissors size={14} className="text-emerald-600" />;
      case 'job_work_finishing': return <Sparkles size={14} className="text-rose-600" />;
      default: return null;
    }
  };

  return (
    <div className="no-print" style={{
      background: '#f1f5f9',
      borderBottom: '1px solid #e2e8f0',
      padding: '8px 24px',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
        <span style={{ fontWeight: 700, color: '#0f172a' }}>Quick Role Switcher:</span>
        <span>Active User: <strong style={{ color: '#2563eb' }}>{user?.name}</strong> ({user?.role})</span>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {DEMO_USERS.map((u) => {
          const isActive = user?.username === u.username;
          return (
            <button
              key={u.username}
              onClick={() => switchRole(u.username)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
                background: isActive ? '#ffffff' : '#f8fafc',
                color: isActive ? '#2563eb' : '#475569',
                boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.15)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {getRoleIcon(u.role)}
              {u.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
