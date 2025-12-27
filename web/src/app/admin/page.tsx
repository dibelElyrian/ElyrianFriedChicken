import { getOrders, updateOrderStatus, updatePaymentStatus } from './actions'
import AdminOrderList from './AdminOrderList'

export const revalidate = 0

export default async function AdminPage() {
  try {
    const orders = await getOrders()
    return (
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <AdminOrderList 
          initialOrders={orders} 
          updateStatus={updateOrderStatus}
          updatePayment={updatePaymentStatus}
        />
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Admin Access Error</h2>
        <p className="text-gray-600">
          Could not load orders. Please ensure <code>SUPABASE_SERVICE_ROLE_KEY</code> is set in your environment variables.
        </p>
      </div>
    )
  }
}
