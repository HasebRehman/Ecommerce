export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'VendoSphere'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const ROLES = {
  CUSTOMER: 'customer',
  BUSINESS_OWNER: 'business_owner',
  COURIER: 'courier',
  OPERATIONS_ADMIN: 'operations_admin',
  PLATFORM_ADMIN: 'platform_admin',
  SUPER_ADMIN: 'super_admin',
} as const

export const SUB_ROLES = {
  RETAILER: 'retailer',
  SUPPLIER: 'supplier',
  MERCHANT: 'merchant',
} as const

export const PLANS = {
  BASIC: 'basic',
  PRO: 'pro',
  ULTRA: 'ultra',
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ACCOUNT: '/account',
  CART: '/cart',
  WISHLIST: '/wishlist',
  BUSINESS_DASHBOARD: '/dashboard',
  WORKSPACES: '/workspaces',
  RIDER_DASHBOARD: '/rider/dashboard',
  SUPER_ADMIN: '/super-admin/dashboard',
  PLATFORM_ADMIN: '/platform-admin/dashboard',
  OPERATIONS_ADMIN: '/operations-admin/dashboard',
} as const