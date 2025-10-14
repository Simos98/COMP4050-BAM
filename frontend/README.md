## Features 

- ** Authentication system ** 
  - Login form (mocked for now — accepts any email/password)
  - Role-based users (`admin` / `user`)
  - Session persistence using `localStorage`
  - Logout button in header

- ** Dashboard ** 
  - Displays quick system stats (bookings overview)

- ** Bookings Management ** 
  - View, create, approve, reject, cancel, and delete bookings
  - Filter by device and status
  - Mocked data stored locally (via `localStorage`)
  - Activity log (audit trail) of recent booking actions

- ** Protected Routes **
  - Only logged-in users can access `/bookings`, `/devices`, `/admin`
  - `/admin` visible only to `admin` role

## Quick startup
1. Clone the repo
2. Install dependencies 'npm install'
3. Run app locally 'npm run dev' 
4. Open browser

## Login
right now, login accepts any form of email and password. To test admin privileges and protected routes, 
simply add admin to any part of the email.