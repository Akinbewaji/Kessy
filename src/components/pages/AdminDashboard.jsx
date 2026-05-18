import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Role Creation State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerms, setNewRolePerms] = useState({
    canBypassCredits: false,
    canManageUsers: false,
    canManageRoles: false
  });

  useEffect(() => {
    if (!userData || (userData.role !== 'admin' && !userData.permissions?.canManageUsers)) {
      navigate('/');
      return;
    }
    fetchData();
  }, [userData, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList = [];
      usersSnap.forEach(doc => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);

      const rolesSnap = await getDocs(collection(db, 'roles'));
      const rolesList = [];
      rolesSnap.forEach(doc => {
        rolesList.push({ id: doc.id, ...doc.data() });
      });
      setRoles(rolesList);
    } catch (e) {
      console.error("Error fetching admin data:", e);
    }
    setLoading(false);
  };

  const handleUpdateCredits = async (userId, newCredits) => {
    try {
      await updateDoc(doc(db, 'users', userId), { credits: Number(newCredits) });
      fetchData();
    } catch (e) {
      console.error("Error updating credits", e);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      fetchData();
    } catch (e) {
      console.error("Error updating role", e);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      const roleId = newRoleName.toLowerCase().replace(/\s+/g, '_');
      await setDoc(doc(db, 'roles', roleId), {
        name: newRoleName,
        ...newRolePerms
      });
      setNewRoleName('');
      setNewRolePerms({ canBypassCredits: false, canManageUsers: false, canManageRoles: false });
      fetchData();
    } catch (e) {
      console.error("Error creating role", e);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (roleId === 'admin' || roleId === 'user') return;
    try {
      await deleteDoc(doc(db, 'roles', roleId));
      fetchData();
    } catch (e) {
      console.error("Error deleting role", e);
    }
  };

  if (loading) return <div className="loading-title dk-title" style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Portal...</div>;

  return (
    <div className="animate-in standard-section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="dk-title premium-gradient-text" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'btn-accent dk-body' : 'btn-ghost dk-body'}>User Management</button>
        <button onClick={() => setActiveTab('roles')} className={activeTab === 'roles' ? 'btn-accent dk-body' : 'btn-ghost dk-body'}>Role Management</button>
      </div>

      {activeTab === 'users' && (
        <div>
          <h2 className="dk-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>All Users ({users.length})</h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-light)' }} className="dk-body">
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Credits</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem' }} className="dk-body">{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="number" 
                        defaultValue={u.credits || 0} 
                        className="dk-input" 
                        style={{ width: '80px', padding: '0.2rem 0.5rem' }}
                        onBlur={(e) => handleUpdateCredits(u.id, e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        defaultValue={u.role || 'user'} 
                        className="dk-input" 
                        style={{ padding: '0.2rem 0.5rem', appearance: 'auto' }}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }} className="dk-body">
                      {u.role === 'admin' ? <span style={{ color: 'var(--accent)' }}>Superuser</span> : 'Managed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div>
          <h2 className="dk-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Custom Roles</h2>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Create New Role Form */}
            <div className="glass-card" style={{ padding: '2rem', flex: '1', minWidth: '300px' }}>
              <h3 className="dk-title" style={{ marginBottom: '1rem' }}>Create New Role</h3>
              <form onSubmit={handleCreateRole}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="field-label">Role Name</label>
                  <input type="text" className="dk-input" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g. Moderator" required />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} className="dk-body">
                    <input type="checkbox" checked={newRolePerms.canBypassCredits} onChange={e => setNewRolePerms({...newRolePerms, canBypassCredits: e.target.checked})} />
                    Can Bypass Credits (Free Generations)
                  </label>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} className="dk-body">
                    <input type="checkbox" checked={newRolePerms.canManageUsers} onChange={e => setNewRolePerms({...newRolePerms, canManageUsers: e.target.checked})} />
                    Can Manage Users
                  </label>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} className="dk-body">
                    <input type="checkbox" checked={newRolePerms.canManageRoles} onChange={e => setNewRolePerms({...newRolePerms, canManageRoles: e.target.checked})} />
                    Can Manage Roles
                  </label>
                </div>
                <button type="submit" className="btn-accent dk-body">Create Role</button>
              </form>
            </div>

            {/* List Existing Roles */}
            <div style={{ flex: '2', minWidth: '300px' }}>
              {roles.map(r => (
                <div key={r.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 className="dk-title" style={{ margin: 0, color: 'var(--accent-light)' }}>{r.name} <span style={{ fontSize: '0.8rem', color: '#666' }}>({r.id})</span></h4>
                    <div className="dk-body" style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                      <span style={{ color: r.canBypassCredits ? '#10b981' : '#ef4444' }}>Bypass Credits</span>
                      <span style={{ color: r.canManageUsers ? '#10b981' : '#ef4444' }}>Manage Users</span>
                      <span style={{ color: r.canManageRoles ? '#10b981' : '#ef4444' }}>Manage Roles</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteRole(r.id)} className="btn-ghost" style={{ color: '#ef4444' }}>Delete</button>
                </div>
              ))}
              {roles.length === 0 && <p className="dk-body" style={{ color: '#666' }}>No custom roles created yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
