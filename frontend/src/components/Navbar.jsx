import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Warehouse, ClipboardList, DollarSign, Users, PlusCircle, Tags } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenAddStock, onOpenRequestModal, onOpenBrandModal, onOpenUserModal, pendingCount }) => {
  const { user } = useAuth();

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'owner': return 'badge-owner';
      case 'warehouse_manager': return 'badge-manager';
      case 'accessory_picker': return 'badge-picker';
      case 'job_work_stitching': return 'badge-stitching';
      case 'job_work_finishing': return 'badge-finishing';
      default: return 'badge-manager';
    }
  };

  const formatRoleName = (role) => {
    switch (role) {
      case 'owner': return 'Master Owner';
      case 'warehouse_manager': return 'Warehouse Manager';
      case 'accessory_picker': return 'Accessory Picker';
      case 'job_work_stitching': return 'Job Work (Stitching)';
      case 'job_work_finishing': return 'Job Work (Finishing)';
      default: return role;
    }
  };

  return (
    <header className="no-print" style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e293b',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <Warehouse size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
              KAYPEE <span style={{ color: '#60a5fa' }}>ACCESSORIES</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Warehouse Stock & Requisition Pass System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Warehouse size={16} />
            Stock Inventory
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem', position: 'relative' }}
          >
            <ClipboardList size={16} />
            Requisitions
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          {user?.role === 'owner' && (
            <button
              onClick={() => setActiveTab('valuation')}
              className={`btn ${activeTab === 'valuation' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <DollarSign size={16} className="text-amber-400" />
              Master Valuation
            </button>
          )}
        </nav>

        {/* User Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {['owner', 'warehouse_manager'].includes(user?.role) && (
            <>
              <button onClick={onOpenBrandModal} className="btn btn-outline btn-sm">
                <Tags size={14} />
                Brands
              </button>
              <button onClick={onOpenAddStock} className="btn btn-primary btn-sm">
                <PlusCircle size={14} />
                + Add Stock
              </button>
            </>
          )}

          {['job_work_stitching', 'job_work_finishing', 'warehouse_manager', 'owner'].includes(user?.role) && (
            <button onClick={onOpenRequestModal} className="btn btn-success btn-sm">
              <ClipboardList size={14} />
              + Request Accessories
            </button>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{user?.name}</span>
            <span className={`badge ${getRoleBadgeClass(user?.role)}`}>
              {formatRoleName(user?.role)}
            </span>
          </div>

          {user?.role === 'owner' && (
            <button onClick={onOpenUserModal} title="Manage User Logins" className="btn btn-outline btn-sm" style={{ padding: '6px' }}>
              <Users size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
