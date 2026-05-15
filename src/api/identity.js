import api from './client';

// GET /identity/status/ -> { has_document, status, document_type, rejection_reason }
// Used by the client portal to gate access: only users whose status === 'approved'
// can create or manage a Client. Everyone else is sent to the
// 'Verify your identity in the mobile app' screen.
export const getIdentityStatus = () =>
  api.get('/identity/status/').then(res => res.data);
