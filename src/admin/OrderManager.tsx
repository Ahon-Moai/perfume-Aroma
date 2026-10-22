import React, { useState, useEffect } from 'react';
import { Search, Printer, Eye, Truck, CheckCircle2, Clock, XCircle, ShieldAlert } from 'lucide-react';

interface OrderItem {
  id: number;
  product_name: string;
  brand_name: string;
  selected_size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  city_zone: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  internal_notes?: string;
  created_at: string;
  items?: OrderItem[];
}

interface OrderManagerProps {
  csrfToken: string;
}

export const OrderManager: React.FC<OrderManagerProps> = ({ csrfToken }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printableOrder, setPrintableOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/orders.php';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += '?' + params.toString();

      const res = await fetch(url, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSelectOrder = async (orderId: number) => {
    try {
      const res = await fetch(`/api/admin/orders.php?id=${orderId}`, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedOrder(data.data);
      }
    } catch (e) {
      console.error('Error loading order details', e);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders.php?id=${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ order_status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: newStatus as any });
        }
      }
    } catch (e) {
      alert('Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  const statusBadges: Record<string, string> = {
    pending: 'bg-amber-950/80 text-[#111111] border-amber-800',
    confirmed: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
    processing: 'bg-blue-950/80 text-blue-300 border-blue-800',
    shipped: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
    delivered: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    cancelled: 'bg-red-950/80 text-red-300 border-red-800'
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-[#EAEAEA] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-[#111111] font-normal">Customer Orders & Fulfillment</h2>
          <p className="text-xs text-[#737373] font-sans mt-0.5">
            Process orders, manage delivery status, inspect items, and generate invoices
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-[10px] uppercase font-sans tracking-wider border transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#111111] text-white text-black border-[#111111] font-semibold'
                  : 'bg-[#F8F8F8] text-[#737373] border-[#EAEAEA] hover:text-[#111111]'
              }`}
            >
              {st === '' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#EAEAEA] overflow-x-auto">
        <table className="w-full text-left text-xs text-[#111111]">
          <thead className="bg-[#F8F8F8] text-[#737373] uppercase tracking-wider text-[10px] border-b border-[#EAEAEA]">
            <tr>
              <th className="py-3.5 px-4">Order #</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Zone</th>
              <th className="py-3.5 px-4">Total Amount</th>
              <th className="py-3.5 px-4">Order Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#737373]">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#737373]">
                  No orders match the selected filter.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#111111]">{o.order_number}</td>
                  <td className="py-3.5 px-4 text-[#111111]">{o.customer_name}</td>
                  <td className="py-3.5 px-4 text-[#737373] font-mono">{o.customer_phone}</td>
                  <td className="py-3.5 px-4 capitalize text-[#737373]">{o.city_zone.replace('_', ' ')}</td>
                  <td className="py-3.5 px-4 font-serif font-medium text-[#111111]">৳ {o.total_amount}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase font-mono tracking-wider border rounded ${statusBadges[o.order_status] || 'bg-[#F4F4F4]'}`}>
                      {o.order_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#737373] text-[10px]">{o.created_at}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleSelectOrder(o.id)}
                      className="p-1.5 text-[#737373] hover:text-[#111111] bg-[#F4F4F4] hover:bg-zinc-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        await handleSelectOrder(o.id);
                        setPrintableOrder(o);
                      }}
                      className="p-1.5 text-[#737373] hover:text-[#111111] bg-[#F4F4F4] hover:bg-zinc-700 transition-colors"
                      title="Print Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && !printableOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white border border-[#EAEAEA] p-6 sm:p-8 space-y-6 text-[#111111] my-8">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#111111] uppercase">Order Details</span>
                <h3 className="font-serif text-2xl font-normal text-[#111111]">{selectedOrder.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-[#737373] hover:text-[#111111]">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans bg-[#F8F8F8] p-4 border border-[#EAEAEA]">
              <div>
                <p className="text-[10px] uppercase text-[#737373] tracking-wider">Customer Info</p>
                <p className="font-medium text-[#111111] mt-0.5">{selectedOrder.customer_name}</p>
                <p className="text-[#737373] font-mono">{selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && <p className="text-[#737373]">{selectedOrder.customer_email}</p>}
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#737373] tracking-wider">Shipping Address</p>
                <p className="text-[#111111] mt-0.5">{selectedOrder.shipping_address}</p>
                <p className="text-[#111111] capitalize text-[10px] mt-1">Zone: {selectedOrder.city_zone.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Change Status Controls */}
            <div className="flex items-center justify-between bg-[#F8F8F8] p-4 border border-[#EAEAEA]">
              <span className="text-xs text-[#737373] uppercase tracking-wider font-medium">Update Fulfillment Status:</span>
              <select
                value={selectedOrder.order_status}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                disabled={updating}
                className="bg-white border border-[#EAEAEA] text-[#111111] text-xs px-3 py-1.5 focus:border-[#111111] uppercase font-mono"
              >
                <option value="pending">PENDING</option>
                <option value="confirmed">CONFIRMED</option>
                <option value="processing">PROCESSING</option>
                <option value="shipped">SHIPPED</option>
                <option value="delivered">DELIVERED</option>
                <option value="cancelled">CANCELLED (RESTORE STOCK)</option>
              </select>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-xs uppercase font-sans tracking-widest text-[#737373] mb-2">Decants Ordered</h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((it) => (
                  <div key={it.id} className="flex items-center justify-between p-3 bg-[#F8F8F8] border border-[#EAEAEA] text-xs">
                    <div>
                      <p className="font-serif text-sm text-[#111111]">{it.brand_name} - {it.product_name}</p>
                      <p className="text-[10px] text-[#737373] font-mono">{it.selected_size} Atomizer × {it.quantity}</p>
                    </div>
                    <p className="font-mono text-[#111111] font-semibold">৳ {it.line_total}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-[#EAEAEA] space-y-1.5 text-xs text-right font-sans">
              <div className="flex justify-between text-[#737373]"><span>Subtotal:</span><span>৳ {selectedOrder.subtotal}</span></div>
              <div className="flex justify-between text-[#737373]"><span>Delivery Fee:</span><span>৳ {selectedOrder.delivery_fee}</span></div>
              {selectedOrder.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount:</span><span>-৳ {selectedOrder.discount}</span></div>}
              <div className="flex justify-between text-sm font-semibold text-[#111111] pt-2 border-t border-[#EAEAEA]"><span>Total Payable:</span><span className="font-serif text-lg text-[#111111]">৳ {selectedOrder.total_amount}</span></div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#EAEAEA]">
              <button
                onClick={() => setPrintableOrder(selectedOrder)}
                className="px-4 py-2 bg-[#111111] text-white hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#F4F4F4] hover:bg-zinc-700 text-[#111111] text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {printableOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white text-zinc-950 p-8 max-w-xl w-full shadow-2xl font-sans space-y-6">
            <div className="flex items-start justify-between border-b pb-4 border-zinc-200">
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight">AROMATICA ONE</h1>
                <p className="text-[10px] text-[#737373] uppercase tracking-widest mt-0.5">Signature Decants Edition · ARRINA ATELIER</p>
                <p className="text-[10px] text-[#737373]">Banani High Street, Block 11, Dhaka 1213, Bangladesh</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold uppercase bg-zinc-100 px-2 py-1">INVOICE</span>
                <p className="font-mono text-sm font-bold mt-1 text-zinc-900">{printableOrder.order_number}</p>
                <p className="text-[10px] text-[#737373]">{printableOrder.created_at}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-[#737373] uppercase font-semibold">Bill & Deliver To:</p>
                <p className="font-bold text-zinc-900">{printableOrder.customer_name}</p>
                <p className="font-mono text-zinc-700">{printableOrder.customer_phone}</p>
                <p className="text-zinc-600">{printableOrder.shipping_address}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#737373] uppercase font-semibold">Payment Info:</p>
                <p className="font-semibold uppercase text-zinc-900">{printableOrder.payment_method} (Cash on Delivery)</p>
                <p className="text-emerald-700 font-medium capitalize">Status: {printableOrder.order_status}</p>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-300 text-[10px] uppercase text-[#737373]">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Size</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {(printableOrder.items || []).map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2 font-medium">{it.brand_name} - {it.product_name}</td>
                    <td className="py-2 text-center">{it.selected_size}</td>
                    <td className="py-2 text-center">{it.quantity}</td>
                    <td className="py-2 text-right">৳ {it.unit_price}</td>
                    <td className="py-2 text-right font-semibold">৳ {it.line_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-zinc-300 pt-3 text-xs space-y-1 text-right">
              <div className="flex justify-between"><span>Subtotal:</span><span>৳ {printableOrder.subtotal}</span></div>
              <div className="flex justify-between"><span>Delivery Fee:</span><span>৳ {printableOrder.delivery_fee}</span></div>
              {printableOrder.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount:</span><span>-৳ {printableOrder.discount}</span></div>}
              <div className="flex justify-between font-bold text-sm text-zinc-950 pt-2 border-t border-zinc-400"><span>Amount Payable:</span><span>৳ {printableOrder.total_amount}</span></div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 text-xs">
              <button onClick={() => window.print()} className="px-4 py-2 bg-black text-[#111111] text-xs font-semibold uppercase tracking-wider">
                Print Official Copy
              </button>
              <button onClick={() => setPrintableOrder(null)} className="px-4 py-2 bg-zinc-200 text-zinc-800 text-xs uppercase">
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
