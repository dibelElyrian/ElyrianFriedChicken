'use client'

import { useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react'

export default function OrderCutoffLabel() {
  const [status, setStatus] = useState<{ text: string, isPreorder: boolean } | null>(null)

  useEffect(() => {
    const now = new Date()
    const day = now.getDay() // 0 = Sun, 6 = Sat
    const cutoff = new Date(now)
    cutoff.setHours(8, 30, 0, 0)

    if (day === 0 || day === 6) {
      setStatus({
        text: "Pre-ordering for Monday",
        isPreorder: true
      })
    } else if (now > cutoff) {
      if (day === 5) { // Friday
        setStatus({
          text: "Pre-ordering for Monday",
          isPreorder: true
        })
      } else {
        setStatus({
          text: "Pre-ordering for Tomorrow",
          isPreorder: true
        })
      }
    } else {
      setStatus({
        text: "Order before 8:30 AM for Today",
        isPreorder: false
      })
    }
  }, [])

  // Render nothing on server/initial render to avoid hydration mismatch
  if (!status) return <span className="text-sm text-muted-foreground">Order before 8:30 AM</span>

  return (
    <span className={`text-sm flex items-center gap-1.5 ${
      status.isPreorder ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-muted-foreground'
    }`}>
      {status.isPreorder && <CalendarClock size={16} />}
      {status.text}
    </span>
  )
}
