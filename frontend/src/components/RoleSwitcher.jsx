import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, Package, Scissors, Sparkles } from 'lucide-react';

export const RoleSwitcher = () => {
  const { user, switchRole, DEMO_USERS } = useAuth();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Shield size={16} className="text-amber-400" />;
      case 'warehouse_manager': return <UserCheck size={16} className="text-blue-400" />;
      case 'accessory_picker': return <Package size={16} className="text-purple-400" />;
      case 'job_work_stitching': return <Scissors size={16} className="text-emerald-400" />;
      case 'job_work_finishing': return <Sparkles size={16} className="text-pink-400" />;
      default: return null;
    }
  };

  return (
    <div className="no-print" style={{
      background: 'linear-gradient(90deg, #1e1b4b, #0f172a, #1e1b4b)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
        <span style={{ fontWeight: 600, color: '#f8fafc' }}>Demo Quick Switcher:</span>
        <span>Active User: <strong style={{ color: '#60a5fa' }}>{user?.name}</strong> ({user?.role})</span>
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
                border: isActive ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                background: isActive ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                color: isActive ? '#60a5fa' : '#cbd5e1',
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
