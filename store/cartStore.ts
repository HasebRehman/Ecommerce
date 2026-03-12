import { create } from 'zustand'

interface CartItem {
  id:       string
  quantity: number
  products: {
    id:             string
    name:           string
    price:          number
    discount_price: number | null
    images:         string[]
    stock:          number
  }
}

interface CartState {
  items:     CartItem[]
  count:     number
  total:     number
  setCart:   (items: CartItem[]) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items:  [],
  count:  0,
  total:  0,

  setCart: (items) => set({
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.reduce((s, i) => {
      const price = i.products.discount_price ?? i.products.price
      return s + price * i.quantity
    }, 0),
  }),

  clearCart: () => set({ items: [], count: 0, total: 0 }),
}))