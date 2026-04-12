const BASE = '/api'

export const API = {

  // ── AUTH ──────────────────────────────────
  AUTH: {
    SIGNUP:  `${BASE}/auth/signup`,
    LOGIN:   `${BASE}/auth/login`,
    LOGOUT:  `${BASE}/auth/logout`,
    ME:      `${BASE}/auth/me`,
    REFRESH: `${BASE}/auth/refresh`,
  },

  // ── USERS ─────────────────────────────────
USERS: {
  LIST:       `${BASE}/users`,
  DETAIL:     (id: string) => `${BASE}/users/${id}`,
  UPDATE:     (id: string) => `${BASE}/users/${id}`,
  DELETE:     (id: string) => `${BASE}/users/${id}`,
  ROLES:      (id: string) => `${BASE}/users/${id}/roles`,
  PROFILE:    `${BASE}/users/profile`,
  AVATAR:     `${BASE}/users/profile/avatar`,
},

  // ── ROLES ─────────────────────────────────
  ROLES: {
    REQUESTS:       `${BASE}/roles/requests`,
    REQUEST_DETAIL: (id: string) => `${BASE}/roles/requests/${id}`,
    APPROVE:        (id: string) => `${BASE}/roles/requests/${id}/approve`,
    REJECT:         (id: string) => `${BASE}/roles/requests/${id}/reject`,
  },

  // ── WORKSPACES ────────────────────────────
  WORKSPACES: {
    LIST:     `${BASE}/workspaces`,
    CREATE:   `${BASE}/workspaces`,
    DETAIL:   (id: string) => `${BASE}/workspaces/${id}`,
    UPDATE:   (id: string) => `${BASE}/workspaces/${id}`,
    DELETE:   (id: string) => `${BASE}/workspaces/${id}`,
  },

  // ── PRODUCTS ──────────────────────────────
  PRODUCTS: {
    LIST:   `${BASE}/products`,
    DETAIL: (id: string) => `${BASE}/products/${id}`,
},

  // ── INVENTORY ─────────────────────────────
  INVENTORY: {
    LIST:       (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/inventory`,
    UPDATE:     (workspaceId: string, productId: string) => `${BASE}/workspaces/${workspaceId}/inventory/${productId}`,
    LOW_STOCK:  (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/inventory/low-stock`,
    MOVEMENTS:  (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/inventory/movements`,
  },

  // ── CATEGORIES ────────────────────────────
CATEGORIES: {
  LIST:   `${BASE}/categories`,
  CREATE: `${BASE}/categories`,
},

  // ── ORDERS ────────────────────────────────
  ORDERS: {
    LIST:     `${BASE}/orders`,
    CREATE:   `${BASE}/orders`,
    DETAIL:   (id: string) => `${BASE}/orders/${id}`,
    UPDATE:   (id: string) => `${BASE}/orders/${id}`,
    CANCEL:   (id: string) => `${BASE}/orders/${id}/cancel`,
  },

  // ── RIDERS ────────────────────────────────
  RIDERS: {
    LIST:        `${BASE}/riders`,
    DETAIL:      (id: string) => `${BASE}/riders/${id}`,
    CONNECTIONS: `${BASE}/riders/connections`,
    CONNECT:     `${BASE}/riders/connections/request`,
    RESPOND:     (id: string) => `${BASE}/riders/connections/${id}/respond`,
  },

  // ── POS ───────────────────────────────────
  POS: {
    SESSIONS:    (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/pos/sessions`,
    TRANSACTION: (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/pos/transactions`,
    REPORTS:     (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/pos/reports`,
  },

  // ── MEDIA ─────────────────────────────────
  MEDIA: {
    UPLOAD: `${BASE}/media/upload`,
    DELETE: `${BASE}/media/delete`,
  },

  // ── ADMIN ─────────────────────────────────
ADMIN: {
  STATS:         `${BASE}/admin/stats`,
  USERS:         `${BASE}/admin/users`,
  USER_DETAIL:   (id: string) => `${BASE}/admin/users/${id}`,
  ROLE_REQUESTS: `${BASE}/admin/role-requests`,
  ROLE_REQUEST:  (id: string) => `${BASE}/admin/role-requests/${id}`,
  WORKSPACES:    `${BASE}/admin/workspaces`,
  REPORTS:       `${BASE}/admin/reports`,
  REPORT_DETAIL: (id: string) => `${BASE}/admin/reports/${id}`,
},

// ── BUSINESS ──────────────────────────────
BUSINESS: {
  STATS:     `${BASE}/business/stats`,
  ORDERS:    `${BASE}/business/orders`,
  ORDER:     (id: string) => `${BASE}/business/orders/${id}`,
  INVENTORY: `${BASE}/business/inventory`,
},

// ── SHOPS ─────────────────────────────────
SHOPS: {
  LIST:     `${BASE}/shops`,
  DETAIL:   (id: string) => `${BASE}/shops/${id}`,
  PRODUCTS: (id: string) => `${BASE}/shops/${id}/products`,
  STATUS:   (id: string) => `${BASE}/shops/${id}/status`,
},

STORE: {
  PRODUCTS:       `${BASE}/store/products`,
  FEATURED:       `${BASE}/store/products/featured`,
  DISCOUNTED:     `${BASE}/store/products/discounted`,
  TOP_SHOPS:      `${BASE}/store/shops/top`,
  SHOPS:          `${BASE}/store/shops`,
  SHOP_PRODUCTS:  (id: string) => `${BASE}/store/shops/${id}/products`,
  WISHLIST:       `${BASE}/store/wishlist`,
  WISHLIST_ITEM:  (id: string) => `${BASE}/store/wishlist/${id}`,
  CART:           `${BASE}/store/cart`,
  CART_ITEM:      (id: string) => `${BASE}/store/cart/${id}`,
  ORDERS:         `${BASE}/store/orders`,
  ROLE_REQUEST:   `${BASE}/store/role-request`,
  ORDER:       (id: string) => `${BASE}/store/orders/${id}`,
},

// ── REPORTS ───────────────────────────────
REPORTS: {
  LIST:   `${BASE}/reports`,
  CREATE: `${BASE}/reports`,
  DETAIL: (id: string) => `${BASE}/reports/${id}`,
},

} as const