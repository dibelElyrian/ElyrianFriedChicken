'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Clock, X, RefreshCw } from 'lucide-react'

export default function AdminOrderList({ 
  initialOrders, 
  updateStatus, 
  updatePayment 
}: { 
  initialOrders: any[], 
  updateStatus: (id: number, status: string) => Promise<void>,
  updatePayment: (id: number, status: string) => Promise<void>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (id: number, status: string) => {
    setLoading(true)
    await updateStatus(id, status)
    setLoading(false)
    router.refresh()
  }

  const handlePaymentChange = async (id: number, status: string) => {
    setLoading(true)
    await updatePayment(id, status)
    setLoading(false)
    router.refresh()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'ready': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <p className="text-sm text-gray-500">{initialOrders.length} orders found</p>
        </div>
        <button 
          onClick={() => router.refresh()} 
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono text-gray-500">#{order.id}</td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{order.user_email}</div>
                  <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  {order.scheduled_for && (
                    <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(order.scheduled_for).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="text-gray-700">
                        <span className="font-bold">{item.quantity}x</span> {item.menu_item?.name}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-900">₱{order.total_amount.toFixed(2)}</td>
                <td className="p-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={loading}
                    className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status === 'paid' ? <Check size={12} /> : <Clock size={12} />}
                    {order.payment_status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  {order.payment_status !== 'paid' && (
                    <button 
                      onClick={() => handlePaymentChange(order.id, 'paid')}
                      disabled={loading}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
