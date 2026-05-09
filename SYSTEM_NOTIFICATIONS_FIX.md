# System Notifications - Issue Fix

## Problem
The System Notifications page was not showing any notifications for the operations admin.

## Root Cause
The API endpoint was using a Supabase join syntax that wasn't working correctly:
```typescript
.select(`
  *,
  user:user_id (
    id,
    full_name,
    email,
    avatar_url
  )
`)
```

This join syntax was failing to properly fetch user data from the `profiles` table.

## Solution
Changed the approach to fetch data separately:

1. **Fetch notifications** from the `notifications` table
2. **For each notification**, fetch user profile from `profiles` table
3. **For each notification**, fetch user role from `user_roles` table
4. **Combine all data** into a single response

### Updated Code Flow:
```typescript
// 1. Get notifications
const { data: notifications } = await adminClient
  .from('notifications')
  .select('*')
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1)

// 2. Get user data for each notification
const notificationsWithUserData = await Promise.all(
  notifications.map(async (notif) => {
    // Get user profile
    const { data: userProfile } = await adminClient
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('id', notif.user_id)
      .single()

    // Get user role
    const { data: userRole } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', notif.user_id)
      .single()

    return {
      ...notif,
      user: userProfile || { /* fallback */ },
      user_role: userRole?.role || 'customer',
    }
  })
)
```

## What This Fixes
- ✅ Operations admin can now see all notifications from all users
- ✅ Shows notifications for Super Admin, Platform Admin, Operations Admin, Sellers, and Customers
- ✅ Properly displays user names, avatars, and role badges
- ✅ Handles missing user data gracefully with fallback values

## Files Modified
- `Ecommerce/app/api/admin/all-notifications/route.ts`

## Testing
1. Log in as operations_admin
2. Navigate to "System Notifications" in the sidebar
3. You should now see all notifications from all users across the platform
4. Each notification should show:
   - User avatar/name
   - Role badge (Super Admin, Platform Admin, Operations Admin, Seller, Customer)
   - Notification type icon
   - Title and message
   - Timestamp
   - Order ID (if applicable)
   - Read/Unread status

## No Other Changes
- No other UI or functionality has been modified
- Only the API endpoint was fixed to properly fetch and display notifications
