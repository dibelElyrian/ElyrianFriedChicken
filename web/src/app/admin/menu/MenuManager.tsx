'use client'

import { useState } from 'react'
import { createMenuItem, updateMenuItem, deleteMenuItem } from './actions'
import { Pencil, Trash2, Plus, X, Save } from 'lucide-react'

type MenuItem = {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  is_available: boolean | null
}

export default function MenuManager({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Form states
  const [formData, setFormData] = useState<Partial<MenuItem>>({})

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id)
    setFormData(item)
    setIsAdding(false)
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Meals',
      image_url: '',
      is_available: true
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({})
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    await deleteMenuItem(id)
    setItems(items.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Menu Items</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-bold mb-4">{isAdding ? 'Add New Item' : 'Edit Item'}</h3>
          <form action={async (formData) => {
            if (isAdding) {
              await createMenuItem(formData)
            } else if (editingId) {
              await updateMenuItem(editingId, formData)
            }
            handleCancel()
            // In a real app we'd re-fetch or update optimistic state better, 
            // but for now a page refresh or router.refresh() would happen via server action revalidatePath
            // We can also manually update the local state if we returned the new item from the action
            window.location.reload() 
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  name="name" 
                  defaultValue={formData.name} 
                  required 
                  className="w-full p-2 rounded-md bg-muted border-transparent focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  defaultValue={formData.price} 
                  required 
                  className="w-full p-2 rounded-md bg-muted border-transparent focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  name="category" 
                  defaultValue={formData.category || 'Meals'} 
                  className="w-full p-2 rounded-md bg-muted border-transparent focus:border-primary"
                >
                  <option value="Meals">Meals</option>
                  <option value="Sides">Sides</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input 
                  name="image_url" 
                  defaultValue={formData.image_url || ''} 
                  placeholder="https://..."
                  className="w-full p-2 rounded-md bg-muted border-transparent focus:border-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  name="description" 
                  defaultValue={formData.description || ''} 
                  className="w-full p-2 rounded-md bg-muted border-transparent focus:border-primary"
                  rows={3}
                />
              </div>
              {!isAdding && (
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    name="is_available" 
                    id="is_available"
                    defaultChecked={formData.is_available || false}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium">Available</label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg hover:bg-muted transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Save size={18} />
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-4">
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
              )}
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.category} • ₱{item.price}</p>
                {!item.is_available && (
                  <span className="inline-block px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full mt-1">Unavailable</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleEdit(item)}
                className="p-2 hover:bg-muted rounded-lg transition text-blue-600"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-2 hover:bg-muted rounded-lg transition text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
