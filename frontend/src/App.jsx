import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Navbar } from './components/Navbar';
import { InventoryTable } from './components/InventoryTable';
import { RequisitionsList } from './components/RequisitionsList';
import { ValuationDashboard } from './components/ValuationDashboard';
import { AddStockModal } from './components/AddStockModal';
import { RequestModal } from './components/RequestModal';
import { RequestDetailsModal } from './components/RequestDetailsModal';
import { BrandManagerModal } from './components/BrandManagerModal';
import { UserManagementModal } from './components/UserManagementModal';
import { PrintableChallan } from './components/PrintableChallan';

import './styles/index.css';
import './styles/print.css';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');

  const [accessories, setAccessories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);

  // Modals state
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [editingStockItem, setEditingStockItem] = useState(null);

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [editingPendingRequest, setEditingPendingRequest] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [printRequest, setPrintRequest] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('kaypee_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [accRes, brandRes, catRes, reqRes] = await Promise.all([
        fetch('/api/accessories', { headers }),
        fetch('/api/brands', { headers }),
        fetch('/api/categories', { headers }),
        fetch('/api/requests', { headers })
      ]);

      if (accRes.ok) setAccessories(await accRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (reqRes.ok) setRequests(await reqRes.json());
    } catch (err) {
      console.warn('API fetch error, using local state:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Stock CRUD
  const handleSaveStock = async (stockData) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const method = stockData.id ? 'PUT' : 'POST';
      const url = stockData.id ? `/api/accessories/${stockData.id}` : '/api/accessories';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stockData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save stock item');
        return;
      }
      fetchData();
    } catch (err) {
      console.error('Save stock error:', err);
      alert('Error saving stock: ' + err.message);
    }
  };

  const handleSaveBatch = async (batchItems) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch('/api/accessories/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: batchItems })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to add variation items');
        return;
      }
      fetchData();
      alert(`Successfully added ${batchItems.length} variation items inward!`);
    } catch (err) {
      console.error('Batch save error:', err);
      alert('Error saving batch variations: ' + err.message);
    }
  };

  // Requisition CRUD
  const handleCreateRequest = async (reqData) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const url = reqData.id ? `/api/requests/${reqData.id}` : '/api/requests';
      const method = reqData.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reqData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to submit requisition request');
        return;
      }
      fetchData();
      alert(`Requisition Pass ${data.req_no || ''} submitted successfully!`);
    } catch (err) {
      console.error('Request creation error:', err);
      alert('Error creating request: ' + err.message);
    }
  };

  // Approval & Workflow Actions
  const handleApproveRequest = async (id, approvePayload) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch(`/api/requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(approvePayload)
      });
      if (res.ok) {
        fetchData();
        setIsDetailsOpen(false);
      }
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleMarkReady = async (id) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch(`/api/requests/${id}/ready`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        setIsDetailsOpen(false);
      }
    } catch (err) {
      console.error('Mark ready error:', err);
    }
  };

  const handleMarkPicked = async (id) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch(`/api/requests/${id}/picked`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        setIsDetailsOpen(false);
      }
    } catch (err) {
      console.error('Mark picked error:', err);
    }
  };

  // Brand / Category Creation
  const handleAddBrand = async (brandData) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(brandData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to add brand');
        return;
      }
      setBrands(prev => [...prev, data]);
      fetchData();
      alert(`Brand "${data.name}" added successfully!`);
    } catch (err) {
      console.error('Add brand error:', err);
      alert('Error adding brand: ' + err.message);
    }
  };

  const handleAddCategory = async (catData) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(catData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to add accessory type');
        return;
      }
      setCategories(prev => [...prev, data]);
      fetchData();
      alert(`Accessory Type "${data.name}" added successfully!`);
    } catch (err) {
      console.error('Add category error:', err);
      alert('Error adding accessory type: ' + err.message);
    }
  };

  const handleEditBrand = async (id, brandData) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch(`/api/brands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(brandData)
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Failed to edit brand');
      fetchData();
      alert(`Brand updated successfully!`);
    } catch (err) {
      alert('Error updating brand: ' + err.message);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch(`/api/brands/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Failed to delete brand');
      fetchData();
      alert(`Brand deleted successfully!`);
    } catch (err) {
      alert('Error deleting brand: ' + err.message);
    }
  };

  const handleEditCategory = async (id, catData) => {
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(catData)
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Failed to edit accessory type');
      fetchData();
      alert(`Accessory type updated successfully!`);
    } catch (err) {
      alert('Error updating accessory type: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this accessory type?')) return;
    try {
      const token = localStorage.getItem('kaypee_token') || 'owner';
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Failed to delete accessory type');
      fetchData();
      alert(`Accessory type deleted successfully!`);
    } catch (err) {
      alert('Error deleting accessory type: ' + err.message);
    }
  };

  // Print A6 Challan
  const handlePrint = (req) => {
    setPrintRequest(req);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Top Demo Role Switcher Bar */}
      <RoleSwitcher />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddStock={() => { setEditingStockItem(null); setIsAddStockOpen(true); }}
        onOpenRequestModal={() => setIsRequestOpen(true)}
        onOpenBrandModal={() => setIsBrandModalOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        pendingCount={pendingRequestsCount}
      />

      {/* View Content */}
      <main>
        {activeTab === 'inventory' && (
          <InventoryTable
            accessories={accessories}
            brands={brands}
            categories={categories}
            onEditStock={(item) => { setEditingStockItem(item); setIsAddStockOpen(true); }}
            onOpenBrandModal={() => setIsBrandModalOpen(true)}
            onOpenAddStock={() => { setEditingStockItem(null); setIsAddStockOpen(true); }}
          />
        )}

        {activeTab === 'requests' && (
          <RequisitionsList
            requests={requests}
            onSelectRequest={(req) => { setSelectedRequest(req); setIsDetailsOpen(true); }}
            onEditPending={(req) => { setEditingPendingRequest(req); setIsRequestOpen(true); }}
            onPrint={handlePrint}
          />
        )}

        {activeTab === 'valuation' && user?.role === 'owner' && (
          <ValuationDashboard />
        )}
      </main>

      {/* Modals */}
      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        onSave={handleSaveStock}
        onSaveBatch={handleSaveBatch}
        editingItem={editingStockItem}
        brands={brands}
        categories={categories}
      />

      <RequestModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        accessories={accessories}
        onCreateRequest={handleCreateRequest}
      />

      <RequestDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        onApprove={handleApproveRequest}
        onMarkReady={handleMarkReady}
        onMarkPicked={handleMarkPicked}
        onPrint={handlePrint}
      />

      <BrandManagerModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        brands={brands}
        categories={categories}
        onAddBrand={handleAddBrand}
        onEditBrand={handleEditBrand}
        onDeleteBrand={handleDeleteBrand}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />

      {/* Hidden Printable A6 Gate Pass Document */}
      <PrintableChallan request={printRequest} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
