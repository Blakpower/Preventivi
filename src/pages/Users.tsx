import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type User, hashPassword } from '../db';
import { Plus, Trash2 } from 'lucide-react';

export const Users: React.FC = () => {
  const users = useLiveQuery(async () => {
    return await db.table<User>('users').toArray();
  }, []);

  const [form, setForm] = useState({ username: '', displayName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const createUser = async () => {
    setError(null);
    try {
      if (!form.username || !form.password || !form.displayName) {
        setError('Compila username, nome visualizzato e password');
        return;
      }
      const exists = await db.table<User>('users').where('username').equals(form.username).first();
      if (exists) {
        setError('Username già esistente');
        return;
      }
      const passwordHash = await hashPassword(form.password);
      await db.table<User>('users').add({
        username: form.username,
        displayName: form.displayName,
        email: form.email,
        passwordHash
      });
      setForm({ username: '', displayName: '', email: '', password: '' });
    } catch (err) {
      console.error(err);
      setError('Errore durante la creazione utente');
    }
  };

  const deleteUser = async (id: number) => {
    await db.table<User>('users').delete(id);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Crea Utente</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border"
            placeholder="Username"
          />
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border"
            placeholder="Nome visualizzato"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border"
            placeholder="Email"
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border"
            placeholder="Password"
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button
          onClick={createUser}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold flex items-center space-x-1"
        >
          <Plus size={18} />
          <span>Crea Utente</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Utenti</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(users || []).map(u => (
                <tr key={u.id}>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">{u.displayName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteUser(u.id!)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {(users || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">Nessun utente registrato.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
