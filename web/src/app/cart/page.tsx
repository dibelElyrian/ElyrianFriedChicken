'use client'

import { useCart } from '@/context/CartContext'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Trash2, Minus, Plus, ArrowLeft, CheckCircle } from 'lucide-react'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [lastOrderTotal, setLastOrderTotal] = useState(0)
  const [activeQr, setActiveQr] = useState('ub')
  const [timestamp, setTimestamp] = useState(0)

  useEffect(() => {
    setTimestamp(Date.now())
  }, [])

  const paymentMethods = [
    { id: 'ub', name: 'UnionBank', image: '/payments/ub-qr.jpg', color: 'text-orange-600', border: 'border-orange-500' },
    { id: 'gotyme', name: 'GoTyme', image: '/payments/gotyme-qr.jpg', color: 'text-blue-600', border: 'border-blue-500' },
    { id: 'gcash', name: 'GCash', image: '/payments/gcash-qr.jpg', color: 'text-blue-500', border: 'border-blue-400' },
  ]

  const activeMethod = paymentMethods.find(m => m.id === activeQr) || paymentMethods[0]

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    try {
      // Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_email: name, // Using name as identifier for now
          total_amount: cartTotal,
          status: 'pending',
          payment_method: 'cash',
          payment_status: 'unpaid'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create Order Items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      setLastOrderTotal(cartTotal)
      setOrderPlaced(true)
      clearCart()
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-lg w-full p-8 bg-card rounded-2xl shadow-lg text-center border border-border">
          <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-foreground">Order Placed!</h2>
          <p className="text-muted-foreground mb-8">Thanks {name}, we've received your order.</p>
          
          <div className="bg-muted p-6 rounded-xl mb-8 border border-border shadow-sm">
            <h3 className="font-bold text-foreground mb-4 text-center">Scan to Pay</h3>
            
            {/* Payment Method Tabs */}
            <div className="flex justify-center gap-2 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setActiveQr(method.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeQr === method.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-card text-muted-foreground hover:bg-border'
                  }`}
                >
                  {method.name}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className={`relative w-96 h-96 bg-white rounded-lg overflow-hidden mb-3 border-2 ${activeMethod.border}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`${activeMethod.image}?t=${timestamp}`}
                  alt={`${activeMethod.name} QR Code`}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className={`font-bold text-lg ${activeMethod.color}`}>{activeMethod.name}</p>
              <p className="text-sm text-muted-foreground">Ryan Fudolig Serdan</p>
            </div>

            <div className="text-sm text-muted-foreground text-center bg-card p-4 rounded-lg border border-border">
              <p className="mb-1">Amount Due:</p>
              <p className="font-bold text-2xl text-foreground mb-2">₱{lastOrderTotal.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Please take a screenshot of your payment and send it to me.</p>
            </div>
          </div>
          
          <Link href="/" className="block w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-red-700 transition">
            Back to Menu
          </Link>
        </div>
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
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sticky top-24">
            <h2 className="font-bold text-lg text-foreground mb-6">Payment Details</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₱{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground font-bold text-lg pt-4 border-t border-border">
                <span>Total</span>
                <span>₱{cartTotal.toFixed(2)}</span>
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
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : `Pay ₱${cartTotal.toFixed(2)}`}
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
