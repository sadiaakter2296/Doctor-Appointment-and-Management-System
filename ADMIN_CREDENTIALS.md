## 🔐 Admin Panel Access

### Fixed Admin Account
**Only this account has admin privileges:**

**Email:** `admin@hospital.com`  
**Password:** `admin123456`  
**Role:** System Administrator

### User Registration
- All new user registrations are automatically assigned **"patient"** role
- Only patients can book appointments
- Only the fixed admin account can:
  - Add/Edit/Delete doctors
  - Manage patient records  
  - Update appointment status
  - Access reports and billing
  - Manage system notifications

### Security Features
- Admin access is restricted to the specific email: `admin@hospital.com`
- Backend API routes are protected with admin-only middleware
- Frontend components hide admin features from non-admin users
- Role cannot be changed through registration - only fixed admin exists

### Usage Instructions
1. **For Admin Access:** Login with the credentials above
2. **For Patient Registration:** Use any email/password - will automatically become patient
3. **Patient Features:** Can book appointments and view doctor information
4. **Admin Features:** Full system management and control