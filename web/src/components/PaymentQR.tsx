'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function PaymentQR({ amount }: { amount: number }) {
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

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm mt-6">
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
        <div className={`relative w-80 h-80 bg-white rounded-lg overflow-hidden mb-3 border-2 ${activeMethod.border}`}>
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

      <div className="text-sm text-muted-foreground text-center bg-muted p-4 rounded-lg border border-border">
        <p className="mb-1">Amount Due:</p>
        <p className="font-bold text-2xl text-foreground mb-2">₱{amount.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">Please take a screenshot of your payment and send it to me.</p>
      </div>
    </div>
  )
}
