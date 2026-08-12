import React, { useState, useEffect } from 'react';
import { Shield, DollarSign, PieChart, Layers, Tag, ArrowUpRight } from 'lucide-react';

export const ValuationDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValuation = async () => {
      try {
        const token = localStorage.getItem('kaypee_token');
        const res = await fetch('/api/reports/valuation', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error('Valuation fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchValuation();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '40px auto', textAlign: 'center', color: '#94a3b8' }}>
        Loading Master Valuation Metrics...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(30, 41, 59, 0.95))',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.25)', padding: '16px', borderRadius: '16px', color: '#fbbf24' }}>
            <Shield size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>Master Owner Valuation Center</h2>
              <span className="badge badge-owner">RESTRICTED TO OWNER</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
              Real-time audit of capital locked in warehouse accessories across all brands & categories
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            Total Capital Blocked
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            ₹ {data.total_monetary_valuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Across {data.total_quantity.toLocaleString()} pcs of accessories</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Brand Capital Breakdown */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={18} className="text-amber-400" /> Capital Locked by Brand
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(data.brand_breakdown || {}).map(([brandName, val]) => {
              const pct = data.total_monetary_valuation > 0 ? (val / data.total_monetary_valuation) * 100 : 0;
              return (
                <div key={brandName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <strong style={{ color: '#f8fafc' }}>{brandName}</strong>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹ {val.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Capital Breakdown */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} className="text-blue-400" /> Capital Locked by Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(data.category_breakdown || {}).map(([catName, val]) => {
              const pct = data.total_monetary_valuation > 0 ? (val / data.total_monetary_valuation) * 100 : 0;
              return (
                <div key={catName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <strong style={{ color: '#f8fafc' }}>{catName}</strong>
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>₹ {val.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
