# Complaints Page Implementation

## Overview
A Complaints page for Super Admin and Operations Admin to view and manage all contact form submissions from users.

## Features Implemented

### 1. **Complaints Page**
- **Location**: `Ecommerce/app/(admin)/admin/complaints/page.tsx`
- **Route**: `/admin/complaints`
- **Access**: Super Admin and Operations Admin only

### 2. **Sidebar Integration**
- **Updated**: `Ecommerce/components/layout/AdminSidebar.tsx`
- Added "Complaints" menu item with Mail icon
- Visible to: `super_admin` and `operations_admin`
- Positioned after "Announcements"

### 3. **Page Features**

#### Header Section
- **Title**: "Complaints"
- **Description**: "View and manage contact form submissions from users"

#### Statistics Badges
- **Total**: Shows total number of complaints
- **Unread**: Shows count of unread complaints (red badge)
- **Read**: Shows count of read complaints (green badge)

#### Complaint Cards
Each complaint is displayed in a card showing:
- **User Avatar**: Purple gradient circle with user icon
- **User Name**: Full name from contact form
- **User Email**: Email address from contact form
- **Status Badge**: "Read" (green) or "Unread" (red)
- **Message**: Full message text from user
- **Timestamp**: Date and time of submission
- **Action Button**: "Mark Read" or "Mark Unread"

#### Card Styling
- **Unread Cards**: Purple gradient background with stronger border
- **Read Cards**: Light purple/white gradient background
- **Hover Effect**: Slight elevation with shadow
- **Responsive Grid**: 2 columns on desktop, 1 column on mobile

### 4. **API Endpoint**
- **Location**: `Ecommerce/app/api/admin/complaints/route.ts`

#### GET Endpoint
- **Route**: `GET /api/admin/complaints`
- **Access**: Super Admin and Operations Admin only
- **Response**:
  ```json
  {
    "complaints": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello, I have a question...",
        "created_at": "2026-05-09T10:30:00Z",
        "read": false,
        "replied": false
      }
    ],
    "total": 10
  }
  ```

#### PATCH Endpoint
- **Route**: `PATCH /api/admin/complaints`
- **Access**: Super Admin and Operations Admin only
- **Request Body**:
  ```json
  {
    "id": "uuid",
    "read": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```

### 5. **User Flow**

#### For Users (Contact Form)
1. User fills contact form on `/contact` page
2. User clicks "Send Message"
3. Form data submitted to `/api/contact`
4. Success message shown: "Thank you for contacting us! We will get back to you soon."
5. Form fields cleared
6. Message stored in `contact_messages` table

#### For Admins (Complaints Page)
1. Admin logs in as super_admin or operations_admin
2. Admin clicks "Complaints" in sidebar
3. Page loads showing all contact form submissions
4. Admin sees statistics (Total, Unread, Read)
5. Admin views complaint cards with user details
6. Admin can click "Mark Read" to mark as read
7. Admin can click "Mark Unread" to mark as unread
8. Card appearance changes based on read status

## Design & Styling

### Theme
- **Primary Color**: Purple (#7C3AED)
- **Fonts**: 
  - Headers: Montserrat (600-900 weight)
  - Body: Open Sans (400-600 weight)
- **Cards**: Frosted glass effect with purple borders

### Card States
- **Unread**: Purple gradient background, stronger border, red "Unread" badge
- **Read**: Light gradient background, softer border, green "Read" badge

### Responsive Design

#### Desktop (>1024px)
- 2-column grid layout
- Full-width cards with all details visible
- Hover effects enabled

#### Tablet (768px - 1024px)
- 2-column grid with smaller gap
- Adjusted padding

#### Mobile (<768px)
- Single-column layout
- Full-width cards
- Touch-friendly buttons
- Stacked elements

## Security

- ✅ Role-based access control (super_admin and operations_admin only)
- ✅ Authentication required
- ✅ Returns 401 for unauthenticated requests
- ✅ Returns 403 for unauthorized roles
- ✅ Uses admin Supabase client for data access

## Database

### Table: `contact_messages`
Already created in previous implementation. Fields used:
- `id` - Unique identifier
- `name` - User's full name
- `email` - User's email address
- `message` - User's message
- `created_at` - Submission timestamp
- `read` - Read status (boolean)
- `replied` - Replied status (boolean, not used yet)

## Files Created

1. `Ecommerce/app/(admin)/admin/complaints/page.tsx` - Complaints page component
2. `Ecommerce/app/api/admin/complaints/route.ts` - API endpoint for complaints

## Files Modified

1. `Ecommerce/components/layout/AdminSidebar.tsx` - Added "Complaints" menu item

## Testing Checklist

### User Side (Contact Form)
- [ ] Go to `/contact` page
- [ ] Fill out contact form with name, email, message
- [ ] Click "Send Message"
- [ ] Verify success message appears
- [ ] Verify form fields are cleared

### Admin Side (Complaints Page)
- [ ] Log in as super_admin or operations_admin
- [ ] Verify "Complaints" appears in sidebar
- [ ] Click "Complaints" menu item
- [ ] Verify page loads with statistics
- [ ] Verify complaint cards show user details
- [ ] Verify unread cards have purple background
- [ ] Click "Mark Read" on unread complaint
- [ ] Verify card changes to read state (green badge)
- [ ] Verify statistics update (unread count decreases)
- [ ] Click "Mark Unread" on read complaint
- [ ] Verify card changes to unread state (red badge)
- [ ] Verify statistics update (unread count increases)
- [ ] Test responsive design on mobile/tablet
- [ ] Verify hover effects work on desktop

### Access Control
- [ ] Verify platform_admin cannot see "Complaints" in sidebar
- [ ] Verify business_owner cannot access `/admin/complaints`
- [ ] Verify customer cannot access `/admin/complaints`

## Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Complaints                                             │
│  View and manage contact form submissions from users    │
└─────────────────────────────────────────────────────────┘

[Total: 10] [Unread: 3] [Read: 7]

┌──────────────────────┬──────────────────────────────────┐
│  [👤] John Doe       │  [👤] Jane Smith                 │
│  john@example.com    │  jane@example.com                │
│  [Unread Badge]      │  [Read Badge]                    │
│                      │                                  │
│  MESSAGE             │  MESSAGE                         │
│  Hello, I have a...  │  Thank you for...                │
│                      │                                  │
│  📅 May 9, 10:30 AM  │  📅 May 8, 2:15 PM               │
│  [Mark Read]         │  [Mark Unread]                   │
└──────────────────────┴──────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  [👤] Bob Johnson    │  [👤] Alice Brown                │
│  bob@example.com     │  alice@example.com               │
│  [Unread Badge]      │  [Read Badge]                    │
│  ...                 │  ...                             │
└──────────────────────┴──────────────────────────────────┘
```

## Features Summary

### Complaint Cards Show:
- ✅ User avatar (purple gradient circle)
- ✅ User full name
- ✅ User email address
- ✅ Read/Unread status badge
- ✅ Full message text
- ✅ Submission date and time
- ✅ Mark Read/Unread button

### Page Features:
- ✅ Statistics badges (Total, Unread, Read)
- ✅ Responsive grid layout (2 columns desktop, 1 column mobile)
- ✅ Visual distinction between read/unread
- ✅ Hover effects on cards
- ✅ Loading state with spinner
- ✅ Empty state message
- ✅ Toast notifications for actions

### Styling:
- ✅ Purple theme matching website design
- ✅ Montserrat + Open Sans fonts
- ✅ Frosted glass card effect
- ✅ Smooth transitions and animations
- ✅ Touch-friendly on mobile
- ✅ Professional and clean design

## No Other Changes

- No other UI or functionality has been modified
- Contact form continues to work as before
- Only added new Complaints page for admins

## Future Enhancements (Optional)

- Reply functionality directly from complaints page
- Delete/archive complaints
- Filter by read/unread status
- Search complaints by name/email
- Export complaints to CSV
- Email notifications for new complaints
- Pagination for large number of complaints
