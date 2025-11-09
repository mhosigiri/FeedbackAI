import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (user) {
      setEmpId(user.uid);
      setName(user.displayName || '');
      setEmail(user.email || '');
    } else {
      setEmpId('');
      setName('');
      setEmail('');
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch(`${BASE_URL}/employees/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emp_id: empId.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          new_password: newPassword ? newPassword : undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      if (auth.currentUser && name.trim()) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      setStatus('Saved.');
      setNewPassword('');
    } catch (e: any) {
      setStatus(`Error: ${e?.message || 'Failed'}`);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      {!isLoggedIn ? (
        <div className="space-y-4">
          <p className="text-gray-600">You’re not signed in.</p>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-[#E20074] text-white rounded"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="px-4 py-2 border rounded"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Employee ID</label>
            <input className="w-full border rounded px-3 py-2 bg-gray-100" value={empId} readOnly />
          </div>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input className="w-full border rounded px-3 py-2" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-[#E20074] text-white rounded">Save</button>
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={() => {
                logout();
                setStatus('Logged out.');
                navigate('/');
              }}
            >
              Logout
            </button>
          </div>
          {status && <p className="text-sm text-gray-600">{status}</p>}
        </form>
      )}
    </div>
  );
};

export default Settings;


