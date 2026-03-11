export type UserRole =
  | 'customer'
  | 'business_owner'
  | 'courier'
  | 'operations_admin'
  | 'platform_admin'
  | 'super_admin'

export type SubRole = 'retailer' | 'supplier' | 'merchant'

export type PlanType = 'basic' | 'pro' | 'ultra'

export type WorkspaceType = 'shop' | 'warehouse'

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'under_review'

export type ConnectionStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'terminated'

export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  sub_roles: SubRole[]
  is_active: boolean
  assigned_at: string
}

export interface Workspace {
  id: string
  owner_id: string
  name: string
  slug: string
  type: WorkspaceType
  plan: PlanType
  description: string | null
  logo_url: string | null
  banner_url: string | null
  address: string | null
  city: string | null
  country: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoleUpgradeRequest {
  id: string
  user_id: string
  requested_role: UserRole
  requested_sub_role: SubRole | null
  reason: string | null
  documents_url: string[]
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
}

export interface RiderConnection {
  id: string
  rider_id: string
  workspace_id: string
  initiated_by: 'rider' | 'store'
  status: ConnectionStatus
  connected_at: string | null
  terminated_at: string | null
  notes: string | null
  created_at: string
}