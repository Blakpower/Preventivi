import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, verifyPassword, setCurrentUserId } from '../db';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await db.table('users').where('username').equals(username).first();
      if (!user) {
        setError('Utente non trovato');
        return;
      }
      const ok = await verifyPassword(password, user.passwordHash);
      if (!ok) {
        setError('Password errata');
        return;
      }
      setCurrentUserId(user.id!);
      navigate('/');
    } catch (err) {
      setError('Errore di accesso');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Accedi</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-semibold active:scale-95"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}
