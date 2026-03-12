import { create } from 'zustand'

interface WishlistState {
  productIds:    Set<string>
  count:         number
  setWishlist:   (ids: string[]) => void
  addItem:       (id: string) => void
  removeItem:    (id: string) => void
}

export const useWishlistStore = create<WishlistState>((set) => ({
  productIds: new Set(),
  count:      0,

  setWishlist: (ids) => set({
    productIds: new Set(ids),
    count:      ids.length,
  }),

  addItem: (id) => set((state) => {
    const next = new Set(state.productIds)
    next.add(id)
    return { productIds: next, count: next.size }
  }),

  removeItem: (id) => set((state) => {
    const next = new Set(state.productIds)
    next.delete(id)
    return { productIds: next, count: next.size }
  }),
}))