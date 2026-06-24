import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientTeam, inviteTeamMember, removeTeamMember } from '../api/organisation';
import LoadingSpinner from '../components/common/LoadingSpinner';

const S = {
  page: { padding: '32px 32px', minHeight: '100vh' },
  heading: { fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  card: { background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB', padding: '24px', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 },
  label: { fontSize: 13, color: '#374151', fontWeight: 500, marginBottom: 6, display: 'block' },
  input: {
    flex: 1, height: 42, padding: '0 12px', borderRadius: 8, fontSize: 14, color: '#111827',
    border: '1px solid #D1D5DB', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    height: 42, padding: '0 12px', borderRadius: 8, fontSize: 14, color: '#111827',
    border: '1px solid #D1D5DB', background: '#FFFFFF', outline: 'none', cursor: 'pointer',
  },
  btnPrimary: {
    padding: '0 20px', height: 42, borderRadius: 8, background: '#2563EB', color: '#FFFFFF',
    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', flexShrink: 0,
  },
  btnRemove: {
    padding: '5px 12px', borderRadius: 6, background: 'none', color: '#EF4444',
    fontSize: 13, fontWeight: 600, border: '1px solid #FCA5A5', cursor: 'pointer',
  },
  memberRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0', borderBottom: '1px solid #F3F4F6',
  },
  roleBadge: (role) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
    background: role === 'admin' ? '#EFF6FF' : '#F9FAFB',
    color: role === 'admin' ? '#1D4ED8' : '#6B7280',
    marginLeft: 8,
  }),
};

const ClientTeamPage = ({ currentUserId }) => {
  const { clientId, client } = useOutletContext();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [role, setRole] = useState('member');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['clientTeam', clientId],
    queryFn: () => getClientTeam(clientId),
    enabled: !!clientId,
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }) => inviteTeamMember(clientId, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientTeam', clientId]);
      setInviteEmail('');
      setInviteError('');
      setInviteSuccess('Member added successfully.');
      setTimeout(() => setInviteSuccess(''), 3000);
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || 'Failed to add member. Check that the email is registered on NovaGard.';
      setInviteError(msg);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => removeTeamMember(clientId, userId),
    onSuccess: () => queryClient.invalidateQueries(['clientTeam', clientId]),
    onError: (err) => {
      const msg = err?.response?.data?.error || 'Failed to remove member.';
      alert(msg);
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    setInviteError('');
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate({ email: inviteEmail.trim(), role });
  };

  const handleRemove = (member) => {
    if (!window.confirm(`Remove ${member.user_email} from this organization?`)) return;
    removeMutation.mutate(member.user);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div style={S.page}>
      <div style={S.heading}>Team</div>
      <div style={S.sub}>Manage your organization members and their roles.</div>

      {/* Invite form */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Invite a member</div>
        <form onSubmit={handleInvite}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={S.input}
              required
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} style={S.select}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" style={S.btnPrimary} disabled={inviteMutation.isLoading}>
              {inviteMutation.isLoading ? 'Adding…' : 'Add Member'}
            </button>
          </div>
          {inviteError && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#B91C1C', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 6, padding: '8px 12px' }}>
              {inviteError}
            </div>
          )}
          {inviteSuccess && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#15803D', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '8px 12px' }}>
              {inviteSuccess}
            </div>
          )}
        </form>
      </div>

      {/* Members list */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Members ({(members || []).length})</div>
        {(members || []).length === 0 ? (
          <div style={{ color: '#9CA3AF', fontSize: 14 }}>No members yet.</div>
        ) : (
          (members || []).map((m, i) => (
            <div key={m.id} style={{ ...S.memberRow, borderBottom: i < members.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', display: 'flex', alignItems: 'center' }}>
                  {m.user_email}
                  <span style={S.roleBadge(m.role)}>{m.role}</span>
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                  Joined {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : '—'}
                </div>
              </div>
              {m.role !== 'admin' || (members || []).filter(x => x.role === 'admin').length > 1 ? (
                <button
                  style={S.btnRemove}
                  onClick={() => handleRemove(m)}
                  disabled={removeMutation.isLoading}
                >
                  Remove
                </button>
              ) : (
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Owner</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientTeamPage;
