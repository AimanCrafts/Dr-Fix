---

## Provider Approval Flow

Providers (technicians) don't verify via email OTP like customers. Instead, they upload a National ID document at signup, and an admin manually reviews and approves or rejects the application.

### Sequence

```
Provider                   Backend                    Admin
   |                          |                          |
   | POST /technician/register|                          |
   |------------------------->|                          |
   |  (NID upload, status=pending)                       |
   |<-------------------------|                          |
   |                          |  GET /admin/technicians  |
   |                          |<-------------------------|
   |                          |  POST .../approve        |
   |                          |<-------------------------|
   |   ProviderApprovedMail   |                          |
   |<-------------------------|                          |
   |  GET /technician/me      |                          |
   |------------------------->|                          |
   | { approval_status: 'approved' }                     |
   |<-------------------------|                          |
```

### Endpoints

#### `POST /technician/register`

Public. Multipart form-data (includes NID file).

| Field | Type | Notes |
|---|---|---|
| `fullName` | string | max 100 |
| `email` | string | unique in users table |
| `phone` | string | nullable, max 20 |
| `password` | string | min 8, confirmed |
| `serviceCategory` | string | electric / plumbing / ac_repair / carpentry / painting / cleaning |
| `yearsOfExperience` | integer | 0–60 |
| `workArea` | string | max 150 |
| `nidFile` | file | jpg/jpeg/png/pdf, max 5MB |

**Response 201:**
```json
{
  "message": "Account created. Your application is now pending admin review.",
  "email": "provider@example.com"
}
```

#### `POST /technician/login`

Public.

**Request:** `{ "identifier": "provider@example.com", "password": "secret123" }`

**Response 200:** JWT + `approval_status` field.

#### `GET /technician/me`

Behind `jwt.auth:provider`. Returns name, email, service_category, years_of_experience, work_area, approval_status.

#### `GET /admin/technicians?status=pending`

Behind `admin.auth` (session). Returns list with `nid_url` for NID viewing.

#### `GET /admin/technicians/{id}`

Behind `admin.auth`. Single applicant detail.

#### `POST /admin/technicians/{id}/approve`

Behind `admin.auth`. Sets `approval_status = 'approved'`, sends `ProviderApprovedMail`.

**Response 200:** `{ "message": "Provider approved.", "approval_status": "approved" }`

#### `POST /admin/technicians/{id}/reject`

Behind `admin.auth`. Body: `{ "reason": "optional string" }`. Sets `approval_status = 'rejected'`, sends `ProviderRejectedMail`.

**Response 200:** `{ "message": "Provider rejected.", "approval_status": "rejected" }`

### Email Templates

- Approved: `packages/Backend/resources/views/emails/provider-approved.blade.php` — variable: `$name`
- Rejected: `packages/Backend/resources/views/emails/provider-rejected.blade.php` — variables: `$name`, `$reason`

### Storage Requirement

`nid_path` is stored on the `public` disk. The `nid_url` returned by the admin endpoints requires **`php artisan storage:link`** to have been run once on the backend, or the URL will 404.