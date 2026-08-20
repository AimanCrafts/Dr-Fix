# Database ER Diagram

## Tables

### Users
- id (PK)
- name
- email
- password
- role (customer/provider/admin)
- phone
- address
- created_at
- updated_at

### Services
- id (PK)
- name
- category
- description
- price
- provider_id (FK -> users)
- rating
- created_at
- updated_at

### Bookings
- id (PK)
- user_id (FK -> users)
- service_id (FK -> services)
- status (pending/in_progress/completed/cancelled)
- scheduled_date
- address
- notes
- created_at
- updated_at

### Reviews
- id (PK)
- booking_id (FK -> bookings)
- rating
- comment
- created_at
- updated_at
