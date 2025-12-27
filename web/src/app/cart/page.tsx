'use client'

import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Trash2, Minus, Plus, ArrowLeft, CheckCircle, CalendarClock, Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { placeOrder } from './actions'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [lastOrderTotal, setLastOrderTotal] = useState(0)
  const [activeQr, setActiveQr] = useState('ub')
  const [timestamp, setTimestamp] = useState(0)
  const [isPreorder, setIsPreorder] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const router = useRouter()

  // Auto-fill name if logged in
  useEffect(() => {
    if (profile?.full_name) {
      setName(profile.full_name)
    } else if (user?.email) {
      setName(user.email)
    }
  }, [user, profile])

  useEffect(() => {
    setTimestamp(Date.now())
    
    const now = new Date()
    const day = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const cutoff = new Date(now)
    cutoff.setHours(8, 30, 0, 0)
    
    const isAfterCutoff = now > cutoff
    const isWeekend = day === 0 || day === 6
    const isFridayAfternoon = day === 5 && isAfterCutoff

    if (isWeekend || isFridayAfternoon) {
      // Schedule for next Monday
      setIsPreorder(true)
      const nextMonday = new Date(now)
      // Calculate days to add to reach Monday: Sunday(0)->1, Saturday(6)->2, Friday(5)->3
      const daysToAdd = day === 0 ? 1 : (8 - day)
      nextMonday.setDate(now.getDate() + daysToAdd)
      setScheduledDate(nextMonday)
    } else if (isAfterCutoff) {
      // Mon-Thu after cutoff -> Schedule for tomorrow
      setIsPreorder(true)
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      setScheduledDate(tomorrow)
    } else {
      // Before cutoff on weekday -> Today
      setScheduledDate(now)
    }
  }, [])

  const paymentMethods = [
    { id: 'ub', name: 'UnionBank', image: '/payments/ub-qr.jpg', color: 'text-orange-600', border: 'border-orange-500' },
    { id: 'gotyme', name: 'GoTyme', image: '/payments/gotyme-qr.jpg', color: 'text-blue-600', border: 'border-blue-500' },
    { id: 'gcash', name: 'GCash', image: '/payments/gcash-qr.jpg', color: 'text-blue-500', border: 'border-blue-400' },
  ]

  const activeMethod = paymentMethods.find(m => m.id === activeQr) || paymentMethods[0]
  const finalTotal = Math.max(0, cartTotal - pointsToRedeem)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    try {
      const result = await placeOrder(
        cart,
        name,
        user?.id || null,
        pointsToRedeem,
        scheduledDate?.toISOString().split('T')[0] || null
      )

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.success && result.orderUuid) {
        if (pointsToRedeem > 0) {
          await refreshProfile()
        }
        setLastOrderTotal(cartTotal)
        setIsRedirecting(true)
        clearCart()
        router.push(`/order/${result.orderUuid}`)
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(error.message || 'Failed to place order. Please try again.')
      setLoading(false)
    }
  }

  if (isRedirecting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h2>
        <p className="text-muted-foreground">Redirecting you to your order...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🍗</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any chicken yet.</p>
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
          <ArrowLeft size={20} />
          Go back to menu
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Checkout</h1>
      
      {isPreorder && scheduledDate && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-8 flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-200">
            <CalendarClock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-100">Pre-order Scheduled</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Orders are closed for today (8:30 AM cutoff) or it is a weekend. This order will be scheduled for <strong>{scheduledDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="font-bold text-lg text-foreground">Order Summary</h2>
            </div>
            <div className="divide-y divide-border">
              {cart.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-6">
                  <div className="flex-grow">
                    <h3 className="font-medium text-foreground mb-1">{item.name}</h3>
                    <p className="text-primary font-medium">₱{item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-card shadow-sm hover:bg-border text-foreground transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-card shadow-sm hover:bg-border text-foreground transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted-foreground hover:text-red-500 transition p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payment Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Loyalty Points Section */}
          {user && (profile?.points || 0) > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full text-orange-600 dark:text-orange-200">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-orange-900 dark:text-orange-100">Redeem Points</h3>
                  <p className="text-xs text-orange-700 dark:text-orange-300">You have {profile?.points} points</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Redeem:</span>
                  <span className="font-bold">{pointsToRedeem} pts = ₱{pointsToRedeem} off</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={Math.min(profile?.points || 0, Math.ceil(cartTotal))} 
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(parseInt(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{Math.min(profile?.points || 0, Math.ceil(cartTotal))}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sticky top-24">
            <h2 className="font-bold text-lg text-foreground mb-6">Payment Details</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₱{cartTotal.toFixed(2)}</span>
              </div>
              {pointsToRedeem > 0 && (
                <div className="flex justify-between text-orange-600 font-medium">
                  <span>Points Discount</span>
                  <span>-₱{pointsToRedeem.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-foreground font-bold text-lg pt-4 border-t border-border">
                <span>Total</span>
                <span>₱{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-foreground placeholder:text-muted-foreground"
                  // Allow editing even if logged in, so they can correct it if needed, but it defaults to profile name
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : `Pay ₱${finalTotal.toFixed(2)}`}
              </button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                By placing this order, you agree to pay via Cash or GCash upon pickup.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
