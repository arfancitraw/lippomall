import React, { useState, useEffect, useCallback } from "react";
import '../app.css';

const API_BASE_URL = 'http://localhost:5000';
const CATEGORIES = ['F&B', 'Fashion', 'Elektronik', 'Jasa'];

export default function Home() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [debounceQuery, setDebounceQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterLantai, setFilterLantai] = useState('');

  const [newNama, setNewNama] = useState('');
  const [newKategori, setNewKategori] = useState(CATEGORIES[0]);

  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [editNama, setEditNama] = useState('');
  const [editKategori, setEditKategori] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceQuery(searchInput)
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  const fetchUnits = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/units`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memuat data unit');
      }
      const data = await res.json();
      setUnits(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat Unit');
    }
  }, []);
  
  const fetchTenants = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (debounceQuery) params.append('q', debounceQuery);
      if (filterKategori) params.append('kategori', filterKategori);
      if (filterLantai) params.append('lantai', filterLantai);

      const res = await fetch(`${API_BASE_URL}/tenants?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memuat data tenant');
      }

      const data = await res.json();
      setTenants(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat tenant');
    }
  }, [debounceQuery, filterKategori, filterLantai],
  );
  
  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTenants(), fetchUnits()]);
    setLoading(false);
  },
    [fetchTenants, fetchUnits],
  );

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const terisiCount = units.filter((u) => u.tenant && u.tenant.id).length;
  const kosongCount = units.filter((u) => !u.tenant || !u.tenant.id).length;

  const handleAddTenant = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newNama.trim()) {
      setErrorMessage('Nama Tenant Wajib diisi.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: newNama.trim(), kategori: newKategori }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambah tenant');
      }
      setNewNama('');
      setNewKategori(CATEGORIES[0]);
      await refreshAll();
    } catch (err: any) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  }

  const openEditModal = (tenant: any) => {
    setEditingTenant(tenant);
    setEditNama(tenant.nama);
    setEditKategori(tenant.kategori);
    setErrorMessage('');
  };


  const handleSaveEdit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    if (!editNama.trim()) {
      setErrorMessage('Nama tenant tidak boleh kosong');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/tenants/${editingTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: editNama.trim(), kategori: editKategori }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah tenant');
      }
      setEditingTenant(null);
      await refreshAll();
    } catch (err: any) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus tenant "${nama}"? Unit yang ditempatinya akan otomatis kosong.`)) {
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/tenants/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus tenant');
      }
      await refreshAll();
    } catch (err: any) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  const handleUnitChange = async (tenantId: number, newUnitIdValue: string) => {
    setLoading(true);
    setErrorMessage('');
    const targetUnitId = !newUnitIdValue || newUnitIdValue === 'null' ? null : parseInt(newUnitIdValue, 10);
    try {
      const res = await fetch(`${API_BASE_URL}/tenants/${tenantId}/unit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit_id: targetUnitId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah penempatan unit');
      }
      await refreshAll();
    } catch (err: any) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Tenant Directory + Unit</h1>
        <p>Sistem Manajemen Tenant Mall & Penempatan Unit Toko</p>
      </header>
      {errorMessage && (
        <div className="alert-error">
          <span><strong>Perhatian:</strong> {errorMessage}</span>
          <button onClick={() => setErrorMessage('')}>&times;</button>
        </div>
      )}

      <div className="summary-grid">
        <div className="card">
          <h3>Unit Terisi</h3>
          <div className="value terisi">{terisiCount}</div>
        </div>
        <div className="card">
          <h3>Unit Kosong</h3>
          <div className="value kosong">{kosongCount}</div>
        </div>
        <div className="card">
          <h3>Total Unit Mall</h3>
          <div className="value total">{units.length}</div>
        </div>
      </div>

      <div className="form-card">
        <h2>Tambah Tenant Baru</h2>
        <form onSubmit={handleAddTenant} className="form-inline">
          <input
            type="text"
            placeholder="Nama Tenant"
            value={newNama}
            onChange={(e) => setNewNama(e.target.value)}
            disabled={loading}
            required
          />
          <select
            value={newKategori}
            onChange={(e) => setNewKategori(e.target.value)}
            disabled={loading}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Tambah Tenant'}
          </button>
        </form>
      </div>
      
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Cari nama tenant..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          disabled={loading}
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterLantai}
          onChange={(e) => setFilterLantai(e.target.value)}
          disabled={loading}
        >
          <option value="">Semua Lantai</option>
          <option value="GF">Lantai GF</option>
          <option value="L1">Lantai L1</option>
          <option value="L2">Lantai L2</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Tenant</th>
              <th>Kategori</th>
              <th>Unit Saat Ini</th>
              <th>Penempatan Unit</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>
                  {loading ? 'Memuat data...' : 'Tidak ada data tenant'}
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => {
                const selectableUnits = units.filter(
                  (u) => u.tenant === null || (tenant.unit && u.id === tenant.unit.id)
                );
                return (
                  <tr key={tenant.id}>
                    <td>{tenant.id}</td>
                    <td><strong>{tenant.nama}</strong></td>
                    <td><span className="badge">{tenant.kategori}</span></td>
                    <td>
                      {tenant.unit
                        ? `${tenant.unit.nomor} (Lantai ${tenant.unit.lantai})`
                        : <span style={{ color: '#9ca3af' }}>-</span>}
                    </td>
                    <td>
                      <select
                        className="unit-select"
                        value={tenant.unit && tenant.unit.id ? tenant.unit.id : ''}
                        onChange={(e) => handleUnitChange(tenant.id, e.target.value)}
                        disabled={loading}
                      >
                        <option value="">-- Belum Ada Unit / Lepas --</option>
                        {selectableUnits.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nomor} (Lantai {u.lantai}) - {u.luas_m2} m²
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-edit"
                        onClick={() => openEditModal(tenant)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteTenant(tenant.id, tenant.nama)}
                        disabled={loading}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingTenant && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Tenant</h3>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Nama Tenant</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select
                  value={editKategori}
                  onChange={(e) => setEditKategori(e.target.value)}
                  disabled={loading}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingTenant(null)}
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}