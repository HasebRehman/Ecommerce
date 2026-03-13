import { create } from 'zustand'

interface NewOrdersStore {
  count:          number
  increment:      () => void
  clearNewOrders: () => void
}

export const useNewOrdersStore = create<NewOrdersStore>((set) => ({
  count:          0,
  increment:      () => set(s => ({ count: s.count + 1 })),
  clearNewOrders: () => set({ count: 0 }),
}))