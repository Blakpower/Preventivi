import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Customer, ensureDbOpen, logDexieError } from '../db';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import { CustomerForm } from '../components/CustomerForm';

export const Customers: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [search, setSearch] = useState('');

  const customers = useLiveQuery(async () => {
    try {
      await ensureDbOpen();
      if (search) {
        return await db.customers
          .filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase()) || 
            c.vat.includes(search)
          )
          .toArray();
      }
      return await db.customers.toArray();
    } catch (error) {
      logDexieError('Dexie customers query failed:', error);
      return [];
    }
  }, [search]);

  const handleSubmit = async (data: Omit<Customer, 'id'>) => {
    if (editingCustomer && editingCustomer.id) {
      await db.customers.update(editingCustomer.id, data);
    } else {
      await db.customers.add(data as Customer);
    }
    setIsFormOpen(false);
    setEditingCustomer(undefined);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
      await db.customers.delete(id);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingCustomer(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestione Clienti</h1>
          <p className="text-slate-500 mt-1">Gestisci l'anagrafica dei tuoi clienti.</p>
        </div>
        <button
          onClick={handleNew}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} />
          <span className="font-medium">Nuovo Cliente</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cerca per nome o P.IVA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            {customers?.length || 0} Clienti
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Indirizzo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contatti</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers?.map((customer) => (
                <tr key={customer.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                        <Users size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">{customer.name}</div>
                        <div className="text-xs text-slate-500">{customer.vat}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 line-clamp-1">{customer.address}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">
                      {customer.email && <div className="flex items-center gap-1">{customer.email}</div>}
                      {customer.phone && <div className="text-xs text-slate-400">{customer.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifica"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => customer.id && handleDelete(customer.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Users size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium text-slate-500">Nessun cliente trovato</p>
                      <p className="text-sm text-slate-400 mt-1">Inizia aggiungendo un nuovo cliente alla tua anagrafica.</p>
                      <button
                        onClick={handleNew}
                        className="mt-4 text-blue-600 font-medium hover:underline"
                      >
                        Crea cliente
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <CustomerForm
          initialData={editingCustomer}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};
