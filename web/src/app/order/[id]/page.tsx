import { getOrder } from '../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, ChefHat, Package, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import PaymentQR from '@/components/PaymentQR'

export const revalidate = 0

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const steps = [
    { status: 'pending', label: 'Order Placed', icon: Clock, color: 'text-gray-500' },
    { status: 'preparing', label: 'Preparing', icon: ChefHat, color: 'text-orange-500' },
    { status: 'ready', label: 'Ready for Pickup', icon: CheckCircle, color: 'text-green-500' },
    { status: 'completed', label: 'Completed', icon: Package, color: 'text-blue-500' },
  ]

  const currentStepIndex = steps.findIndex(s => s.status === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition">
        <ArrowLeft size={18} />
        Back to Menu
      </Link>

      <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden mb-8">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-1">Order #{order.id}</h1>
              <p className="text-muted-foreground text-sm">
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
              {order.scheduled_for && (
                 <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-1 flex items-center gap-1">
                   <Clock size={14} />
                   Scheduled for: {new Date(order.scheduled_for).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                 </p>
              )}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              isCancelled ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'
            }`}>
              {order.status}
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        {!isCancelled && (
          <div className="p-6 border-b border-border">
            <div className="relative flex justify-between">
              {/* Progress Bar Background */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0" />
              
              {/* Active Progress Bar */}
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.status} className="relative z-10 flex flex-col items-center bg-card px-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive 
                        ? 'bg-primary border-primary text-white' 
                        : 'bg-card border-muted text-muted-foreground'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-xs font-medium mt-2 ${
                      isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="p-6">
          <h2 className="font-bold mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden relative flex-shrink-0">
                  {item.menu_item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={item.menu_item.image_url} 
                      alt={item.menu_item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{item.menu_item.name}</h3>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">₱{(item.price_at_time * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
            <span className="font-bold text-lg">Total Amount</span>
            <span className="font-bold text-2xl text-primary">₱{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info (if unpaid) */}
      {order.payment_status === 'unpaid' && !isCancelled && (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-200">
                <Clock size={20} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100">Payment Pending</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please pay ₱{order.total_amount.toFixed(2)} via QR code below. 
                Show your payment screenshot when picking up.
              </p>
            </div>
          </div>
          
          <PaymentQR amount={order.total_amount} />
        </>
      )}
    </div>
  )
}
