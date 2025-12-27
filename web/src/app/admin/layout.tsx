import AdminOrderNotifier from '@/components/AdminOrderNotifier'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4">
      {children}
      <AdminOrderNotifier />
    </div>
  )
}
