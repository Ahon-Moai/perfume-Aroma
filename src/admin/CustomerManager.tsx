import React, { useState, useEffect } from 'react';
import { Search, UserCheck, ShoppingBag, Phone, Mail, MapPin } from 'lucide-react';

interface CustomerOrder {
  id: number;
  order_number: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city_zone: string;
  order_count: number;
  total_spent: number;
  created_at: string;
  orders?: CustomerOrder[];
}

interface CustomerManagerProps {
  csrfToken: string;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ csrfToken }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/customers.php';
      if (search) url += '?search=' + encodeURIComponent(search);

      const res = await fetch(url, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCustomers(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSelectCustomer = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/customers.php?id=${id}`, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedCustomer(data.data);
      }
    } catch (e) {
      console.error('Error fetching customer details', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-white font-normal">Customer Directory</h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            View customer contact records, purchase history, and total lifetime spend
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, phone number or email..."
          className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
            <tr>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Phone Number</th>
              <th className="py-3.5 px-4">Delivery Zone</th>
              <th className="py-3.5 px-4">Orders Placed</th>
              <th className="py-3.5 px-4">Total Spent</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-serif font-medium text-white">{c.name}</td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">{c.phone}</td>
                  <td className="py-3.5 px-4 capitalize text-zinc-400">{(c.city_zone || 'inside_dhaka').replace('_', ' ')}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-zinc-200">{c.order_count || 0}</td>
                  <td className="py-3.5 px-4 font-serif font-semibold text-amber-300">৳ {c.total_spent || 0}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSelectCustomer(c.id)}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] uppercase tracking-wider transition-colors"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 text-white my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">Customer Profile</span>
                <h3 className="font-serif text-2xl font-normal text-white">{selectedCustomer.name}</h3>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs font-sans bg-zinc-950 p-4 border border-zinc-800 text-zinc-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-white">{selectedCustomer.phone}</span>
              </div>
              {selectedCustomer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedCustomer.email}</span>
                </div>
              )}
              {selectedCustomer.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{selectedCustomer.address}</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs uppercase font-sans tracking-widest text-zinc-400 mb-2">Order History</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(selectedCustomer.orders || []).length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">No previous orders on record.</p>
                ) : (
                  (selectedCustomer.orders || []).map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 text-xs font-sans">
                      <div>
                        <p className="font-mono font-semibold text-white">{o.order_number}</p>
                        <p className="text-[10px] text-zinc-500">{o.created_at}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif font-medium text-amber-300">৳ {o.total_amount}</p>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-400">{o.order_status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="text-right pt-4 border-t border-zinc-800">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
