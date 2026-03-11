export const ROLE_HOME: Record<string, string> = {
  super_admin:       '/admin/dashboard',
  platform_admin:    '/admin/dashboard',
  operations_admin:  '/admin/dashboard',
  business_owner:    '/dashboard',
  courier:           '/rider/dashboard',
  customer:          '/account',
}

export const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  super_admin:       ['/admin'],
  platform_admin:    ['/admin'],
  operations_admin:  ['/admin'],
  business_owner:    ['/dashboard', '/workspaces', '/account'],
  courier:           ['/rider'],
  customer:          ['/account', '/cart', '/wishlist'],
}