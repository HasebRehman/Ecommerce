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
    LIST:     `${BASE}/products`,
    CREATE:   `${BASE}/products`,
    DETAIL:   (id: string) => `${BASE}/products/${id}`,
    UPDATE:   (id: string) => `${BASE}/products/${id}`,
    DELETE:   (id: string) => `${BASE}/products/${id}`,
    BY_WORKSPACE: (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/products`,
  },

  // ── INVENTORY ─────────────────────────────
  INVENTORY: {
    LIST:       (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/inventory`,
    UPDATE:     (workspaceId: string, productId: string) => `${BASE}/workspaces/${workspaceId}/inventory/${productId}`,
    LOW_STOCK:  (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/inventory/low-stock`,
    MOVEMENTS:  (workspaceId: string) => `${BASE}/workspaces/${workspaceId}/inventory/movements`,
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
  STATS:          `${BASE}/admin/stats`,
  USERS:          `${BASE}/admin/users`,
  USER_DETAIL:    (id: string) => `${BASE}/admin/users/${id}`,
  ROLE_REQUESTS:  `${BASE}/admin/role-requests`,
  ROLE_REQUEST:   (id: string) => `${BASE}/admin/role-requests/${id}`,
  WORKSPACES:     `${BASE}/admin/workspaces`,
  PLANS:          `${BASE}/admin/plans`,
},

} as const