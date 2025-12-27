'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { User, Save, ArrowLeft, Clock, RotateCcw, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth()
  const { addToCart, clearCart } = useCart()
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (profile?.full_name) {
      setFullName(profile.full_name)
    }
  }, [user, profile, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(quantity, menu_item:menu_items(*))')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleReorder = (order: any) => {
    if (!confirm('This will clear your current cart and add items from this order. Continue?')) return

    clearCart()
    
    order.items.forEach((item: any) => {
      // We need to add the item multiple times based on quantity because addToCart adds 1
      // Or better, we can just loop.
      // Ideally addToCart should accept quantity, but based on context it doesn't seem to.
      // Let's check CartContext again. It checks existing and adds 1.
      // So we loop quantity times.
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.menu_item)
      }
    })

    router.push('/cart')
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition">
        <ArrowLeft size={18} />
        Back to Menu
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Settings */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <User size={40} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">My Profile</h1>
                  <p className="text-xs text-muted-foreground break-all">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-orange-800 dark:text-orange-200 font-medium">Chicken Points</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{profile?.points || 0}</p>
                </div>
                <div className="text-2xl">🍗</div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-xs mb-6 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Display Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock size={20} />
            Recent Orders
          </h2>
          
          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={24} className="text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start ordering to earn points!</p>
              <Link href="/" className="text-primary font-medium hover:underline">
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/order/${order.order_uuid}`} className="font-bold text-lg hover:underline hover:text-primary transition">
                          Order #{order.id}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString(undefined, { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <p className="font-bold text-primary">₱{order.total_amount.toFixed(2)}</p>
                  </div>

                  <div className="space-y-1 mb-4">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="text-sm text-muted-foreground flex justify-between">
                        <span>{item.quantity}x {item.menu_item?.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <button 
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:text-red-700 transition bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg"
                    >
                      <RotateCcw size={16} />
                      Order Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
