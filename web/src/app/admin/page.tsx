import { getOrders, updateOrderStatus, updatePaymentStatus, logout, getSalesSummary } from './actions'
import AdminOrderList from './AdminOrderList'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, UtensilsCrossed, DollarSign, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'

export const revalidate = 0

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ filter?: string, page?: string }> }) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get('admin_session')?.value === 'true'
  const { filter, page } = await searchParams

  if (!isLoggedIn) {
    redirect('/admin/login')
  }

  try {
    const currentFilter = (filter as 'today' | 'upcoming' | 'all') || 'today'
    const currentPage = parseInt(page || '1')
    const pageSize = 20
    
    const { data: orders, count } = await getOrders(currentFilter, currentPage, pageSize)
    const { totalSales, orderCount } = await getSalesSummary()
    
    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return (
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/menu" 
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
            >
              <UtensilsCrossed size={18} />
              Manage Menu
            </Link>
            <form action={logout}>
              <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-red-500 transition">
                <LogOut size={18} />
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Sales Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales (Today)</p>
              <p className="text-2xl font-bold">₱{totalSales.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Orders (Today)</p>
              <p className="text-2xl font-bold">{orderCount}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <Link 
            href="/admin?filter=today" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              currentFilter === 'today' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-gray-200'
            }`}
          >
            Today&apos;s Orders
          </Link>
          <Link 
            href="/admin?filter=upcoming" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              currentFilter === 'upcoming' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-gray-200'
            }`}
          >
            Upcoming (Pre-orders)
          </Link>
          <Link 
            href="/admin?filter=all" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              currentFilter === 'all' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-gray-200'
            }`}
          >
            All History
          </Link>
        </div>

        <AdminOrderList 
          initialOrders={orders || []} 
          updateStatus={updateOrderStatus}
          updatePayment={updatePaymentStatus}
        />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Link
              href={`/admin?filter=${currentFilter}&page=${currentPage - 1}`}
              className={`p-2 rounded-lg border border-border ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
            >
              <ChevronLeft size={20} />
            </Link>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={`/admin?filter=${currentFilter}&page=${currentPage + 1}`}
              className={`p-2 rounded-lg border border-border ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
            >
              <ChevronRight size={20} />
            </Link>
          </div>
        )}
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
