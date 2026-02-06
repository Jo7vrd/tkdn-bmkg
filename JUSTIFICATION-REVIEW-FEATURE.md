# Justification Document Review Feature

## Overview

Fitur ini memungkinkan admin untuk me-review (approve/reject) dokumen justifikasi yang diunggah oleh user untuk barang import.

## Database Schema

### Table: evaluation_documents

Kolom baru yang ditambahkan:

```sql
- justification_status VARCHAR(50) DEFAULT 'pending'
  - Values: 'pending', 'approved', 'rejected'
- justification_reviewed_at TIMESTAMP
- justification_reviewed_by VARCHAR(255)
- justification_rejection_reason TEXT
```

## API Endpoints

### Review Justification Document

**PATCH** `/api/evaluations/:id/justification/review`

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "approved|rejected",
  "reason": "Alasan penolakan (wajib jika rejected)"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Dokumen justifikasi berhasil disetujui/ditolak",
  "data": {
    "id": 1,
    "justification_status": "approved",
    "justification_reviewed_at": "2024-01-15T10:30:00Z",
    "justification_reviewed_by": "Admin Name"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "Error message"
}
```

## User Flow

### For Admin:

1. Buka halaman review evaluasi: `/admin/review/[id]`
2. Scroll ke section "Dokumen Justifikasi Barang Import"
3. Klik "Preview Dokumen" untuk melihat isi dokumen
4. Klik "Setujui" atau "Tolak"
5. Jika tolak, masukkan alasan penolakan
6. Confirm untuk menyimpan review

### For User (Submitter):

1. Upload dokumen justifikasi di dashboard
2. Status awal: "Menunggu Review" (pending)
3. Setelah admin review:
   - **Approved**: Badge hijau "Disetujui" muncul
   - **Rejected**: Badge merah "Ditolak" + alasan penolakan ditampilkan
4. Jika ditolak, user bisa upload ulang dokumen baru

## UI Components

### Admin Review Page

- **Status Badge**: Menampilkan status review (Pending/Approved/Rejected)
- **Preview Button**: Tombol untuk preview dokumen PDF
- **Review Buttons**:
  - Tombol "Setujui" (hijau)
  - Tombol "Tolak" (merah)
- **Review Modal**: Modal konfirmasi dengan textarea untuk alasan penolakan
- **Reviewer Info**: Menampilkan nama reviewer dan tanggal review

### User Dashboard

- **Upload Button**: Muncul jika status evaluasi = "accepted" dan belum ada dokumen
- **Status Badge**: Menampilkan status review dokumen
- **Rejection Notice**: Kotak merah dengan alasan penolakan jika ditolak
- **Re-upload Button**: Tombol untuk upload ulang jika dokumen ditolak

## File Changes

### Backend:

1. `backend/migrations/003_add_justification_review_columns.sql` - Database migration
2. `backend/src/controllers/evaluationController.js` - Added `reviewJustificationDocument` function
3. `backend/src/routes/evaluationRoutes.js` - Added review route

### Frontend:

1. `lib/api-server.js` - Added review status fields to transformation
2. `lib/api.js` - Added review status fields to transformation
3. `app/admin/review/[id]/page.js` - Added review UI and handlers
4. `components/DashboardSubmissions.jsx` - Updated to show review status

## Security

- Only admin can review documents (role check in backend)
- Token-based authentication required
- Document belongs to evaluation check
- Rejection reason required when rejecting

## Testing

### Manual Test Steps:

1. **Upload Document** (as user):
   - Login as regular user
   - Go to dashboard
   - Find an "accepted" evaluation
   - Click "Upload Dokumen Justifikasi"
   - Upload a PDF file
   - Verify success message

2. **Approve Document** (as admin):
   - Login as admin
   - Go to admin review page for that evaluation
   - Preview the justification document
   - Click "Setujui"
   - Confirm approval
   - Verify success message
   - Check status badge shows "Disetujui"

3. **Reject Document** (as admin):
   - Find another evaluation with justification document
   - Click "Tolak"
   - Enter rejection reason
   - Confirm rejection
   - Verify status badge shows "Ditolak"
   - Verify rejection reason displayed

4. **Re-upload** (as user):
   - Login as user who got rejected document
   - Go to dashboard
   - See rejection reason
   - Click "Upload Ulang Dokumen"
   - Upload new document
   - Verify old status replaced

## Notes

- Default status for new uploads: `pending`
- Review is final - no edit/undo feature (admin must reject and ask for re-upload)
- Only the latest justification document is considered (replaces previous uploads)
- Rejection reason is mandatory when rejecting
- Approval doesn't require reason
