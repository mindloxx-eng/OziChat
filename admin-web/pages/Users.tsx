import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ApiError,
  changeUserRole,
  deleteUser,
  getUser,
  getSession,
  listUsers,
  resetUserPassword,
  restoreUser,
  verifyUser,
  type ApiUser,
  type ListUsersParams,
  type PageResponse,
  type Role,
  type SortKey,
  type StatusFilter,
} from '../services/adminApi';
import Card from '../components/Card';
import Badge from '../components/Badge';
import {
  SearchIcon,
  CheckIcon,
  ShieldIcon,
  LockIcon,
  XIcon,
  DotsIcon,
  TrashIcon,
  UsersIcon,
} from '../icons';

interface UsersProps {
  search: string;
}

type RoleFilter = 'ALL' | Role;
type VerifiedFilter = 'ALL' | 'true' | 'false';

type DialogState =
  | { kind: 'none' }
  | { kind: 'verify' | 'restore' | 'delete' | 'promote' | 'demote'; user: ApiUser }
  | { kind: 'password'; user: ApiUser }
  | { kind: 'detail'; userId: number };

const PAGE_SIZES = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_MS = 300;

const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const fmtRel = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  if (diff < 30 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

const accountStatus = (u: ApiUser): { label: string; tone: 'green' | 'gray' | 'red' } => {
  if (u.deletedAt) return { label: 'Deleted', tone: 'red' };
  if (!u.isActive) return { label: 'Inactive', tone: 'gray' };
  return { label: 'Active', tone: 'green' };
};

const Users: React.FC<UsersProps> = ({ search }) => {
  const session = getSession();
  const meId = session?.user.id;

  // Filters
  const [role, setRole] = useState<RoleFilter>('ALL');
  const [verified, setVerified] = useState<VerifiedFilter>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<SortKey>('NEWEST');

  // Paging (0-indexed for the API)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);

  // Debounced search
  const [debouncedQ, setDebouncedQ] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  // Data
  const [data, setData] = useState<PageResponse<ApiUser> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const [actionRow, setActionRow] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const params = useMemo<ListUsersParams>(
    () => ({
      q: debouncedQ || undefined,
      role: role === 'ALL' ? undefined : role,
      verified: verified === 'ALL' ? undefined : verified === 'true',
      status,
      from: from || undefined,
      to: to || undefined,
      sort,
      page,
      size,
    }),
    [debouncedQ, role, verified, status, from, to, sort, page, size]
  );

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const res = await listUsers({ ...params, signal });
      setData(res);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError(e instanceof ApiError ? e.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Refetch whenever params change, aborting in-flight request.
  useEffect(() => {
    abortRef.current?.abort();
    const c = new AbortController();
    abortRef.current = c;
    fetchUsers(c.signal);
    return () => c.abort();
  }, [fetchUsers]);

  // Reset to page 0 whenever filters/search change (but not when page itself changes).
  useEffect(() => {
    setPage(0);
  }, [debouncedQ, role, verified, status, from, to, sort, size]);

  const showToast = (msg: string, tone: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2600);
  };

  const handleConfirm = async () => {
    if (dialog.kind === 'none' || dialog.kind === 'password' || dialog.kind === 'detail') return;
    const { kind, user } = dialog;
    try {
      if (kind === 'delete') {
        await deleteUser(user.id);
        showToast('User soft-deleted · sessions revoked');
      } else if (kind === 'restore') {
        await restoreUser(user.id);
        showToast('User restored');
      } else if (kind === 'verify') {
        await verifyUser(user.id);
        showToast('User force-verified');
      } else if (kind === 'promote') {
        await changeUserRole(user.id, 'ADMIN');
        showToast(`${user.displayName} promoted to admin`);
      } else if (kind === 'demote') {
        await changeUserRole(user.id, 'USER');
        showToast(`${user.displayName} demoted to user`);
      }
      setDialog({ kind: 'none' });
      fetchUsers();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : (e as Error).message, 'err');
    }
  };

  const resetFilters = () => {
    setRole('ALL');
    setVerified('ALL');
    setStatus('ALL');
    setFrom('');
    setTo('');
    setSort('NEWEST');
  };

  const filtersActive =
    role !== 'ALL' ||
    verified !== 'ALL' ||
    status !== 'ALL' ||
    !!from ||
    !!to ||
    sort !== 'NEWEST';

  const items = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const showingFrom = total === 0 ? 0 : page * size + 1;
  const showingTo = total === 0 ? 0 : Math.min((page + 1) * size, total);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <Card padded={false}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <Select label="Role" value={role} onChange={v => setRole(v as RoleFilter)} className="md:col-span-2"
            options={[
              { v: 'ALL', l: 'All roles' },
              { v: 'USER', l: 'User' },
              { v: 'ADMIN', l: 'Admin' },
            ]} />

          <Select label="Verification" value={verified} onChange={v => setVerified(v as VerifiedFilter)} className="md:col-span-2"
            options={[
              { v: 'ALL', l: 'Any' },
              { v: 'true', l: 'Verified' },
              { v: 'false', l: 'Unverified' },
            ]} />

          <Select label="Account status" value={status} onChange={v => setStatus(v as StatusFilter)} className="md:col-span-2"
            options={[
              { v: 'ALL', l: 'All' },
              { v: 'ACTIVE', l: 'Active' },
              { v: 'DELETED', l: 'Deleted' },
            ]} />

          <DateField label="Registered from" value={from} onChange={setFrom} max={to || undefined} className="md:col-span-2" />
          <DateField label="Registered to" value={to} onChange={setTo} min={from || undefined} className="md:col-span-2" />

          <Select label="Sort" value={sort} onChange={v => setSort(v as SortKey)} className="md:col-span-2"
            options={[
              { v: 'NEWEST', l: 'Newest registered' },
              { v: 'OLDEST', l: 'Oldest' },
              { v: 'LAST_SEEN', l: 'Last seen' },
              { v: 'NAME_ASC', l: 'Name A–Z' },
            ]} />
        </div>

        {filtersActive && (
          <div className="px-5 pb-4 -mt-1">
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold uppercase tracking-widest text-[#7cb8ff] hover:text-white transition-colors"
            >
              ✕ Reset all filters
            </button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card padded={false}>
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
          <div className="text-sm flex items-center gap-3">
            <span>
              <span className="font-bold">{total}</span>
              <span className="text-white/40 ml-1.5">{total === 1 ? 'user' : 'users'}</span>
            </span>
            {loading && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/40">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Refreshing…
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-widest font-bold text-white/40">Per page</span>
            <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
              {PAGE_SIZES.map(n => (
                <button
                  key={n}
                  onClick={() => setSize(n)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    size === n ? 'bg-[#3F9BFF]/20 text-[#7cb8ff]' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="px-5 py-3 border-b border-red-500/30 bg-red-500/10 text-sm text-red-200 flex items-center justify-between">
            <span>⚠ {error}</span>
            <button onClick={() => fetchUsers()} className="text-xs font-bold uppercase tracking-widest text-red-200 hover:text-white">Retry</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5">
              <tr>
                <th className="py-3 px-5 font-bold">User</th>
                <th className="py-3 px-5 font-bold">Contact</th>
                <th className="py-3 px-5 font-bold">Role</th>
                <th className="py-3 px-5 font-bold">Status</th>
                <th className="py-3 px-5 font-bold">Registered</th>
                <th className="py-3 px-5 font-bold">Last seen</th>
                <th className="py-3 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => {
                const s = accountStatus(u);
                const isSelf = u.id === meId;
                return (
                  <tr key={u.id} className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] ${u.deletedAt ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-5">
                      <button
                        onClick={() => setDialog({ kind: 'detail', userId: u.id })}
                        className="flex items-center gap-3 min-w-0 text-left group/row"
                      >
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3F9BFF] to-[#8a5bff] border border-white/10 flex items-center justify-center text-sm font-black">
                            {u.displayName.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold truncate group-hover/row:text-[#7cb8ff] transition-colors flex items-center gap-2">
                            {u.displayName}
                            {isSelf && <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10">You</span>}
                          </div>
                          <div className="text-[11px] text-white/40 truncate">{u.email}</div>
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-5 font-mono text-xs text-white/60">{u.phone}</td>
                    <td className="py-3 px-5">
                      <Badge tone={u.role === 'ADMIN' ? 'violet' : 'gray'}>{u.role}</Badge>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={s.tone}>{s.label}</Badge>
                        {u.isVerified ? <Badge tone="blue">Verified</Badge> : <Badge tone="amber">Unverified</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-white/60 text-xs whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                    <td className="py-3 px-5 text-white/60 text-xs whitespace-nowrap">{fmtRel(u.lastSeenAt)}</td>
                    <td className="py-3 px-5 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionRow(actionRow === u.id ? null : u.id)}
                          className="p-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-colors"
                          title="Actions"
                        >
                          <DotsIcon className="w-4 h-4" />
                        </button>
                        {actionRow === u.id && (
                          <>
                            <button className="fixed inset-0 z-30 cursor-default" onClick={() => setActionRow(null)} aria-label="Close menu" />
                            <div className="absolute right-0 mt-2 w-60 z-40 rounded-2xl border border-white/10 bg-[#0E1320] shadow-2xl shadow-black/40 overflow-hidden">
                              <MenuItem
                                onClick={() => { setDialog({ kind: 'detail', userId: u.id }); setActionRow(null); }}
                                icon={<UsersIcon className="w-4 h-4 text-white/60" />}
                                label="View profile"
                              />
                              {!u.isVerified && !u.deletedAt && (
                                <MenuItem
                                  onClick={() => { setDialog({ kind: 'verify', user: u }); setActionRow(null); }}
                                  icon={<ShieldIcon className="w-4 h-4 text-emerald-300" />}
                                  label="Force verify"
                                />
                              )}
                              {!u.deletedAt && (
                                u.role === 'USER' ? (
                                  <MenuItem
                                    onClick={() => { setDialog({ kind: 'promote', user: u }); setActionRow(null); }}
                                    icon={<ShieldIcon className="w-4 h-4 text-[#a98bff]" />}
                                    label="Promote to admin"
                                  />
                                ) : !isSelf ? (
                                  <MenuItem
                                    onClick={() => { setDialog({ kind: 'demote', user: u }); setActionRow(null); }}
                                    icon={<ShieldIcon className="w-4 h-4 text-amber-300" />}
                                    label="Demote to user"
                                  />
                                ) : null
                              )}
                              {!u.deletedAt && (
                                <MenuItem
                                  onClick={() => { setDialog({ kind: 'password', user: u }); setActionRow(null); }}
                                  icon={<LockIcon className="w-4 h-4 text-[#7cb8ff]" />}
                                  label="Reset password"
                                />
                              )}
                              {!u.deletedAt && !isSelf && (
                                <MenuItem
                                  onClick={() => { setDialog({ kind: 'delete', user: u }); setActionRow(null); }}
                                  icon={<TrashIcon className="w-4 h-4 text-red-300" />}
                                  label="Soft-delete account"
                                  danger
                                />
                              )}
                              {u.deletedAt && (
                                <MenuItem
                                  onClick={() => { setDialog({ kind: 'restore', user: u }); setActionRow(null); }}
                                  icon={<CheckIcon className="w-4 h-4 text-emerald-300" />}
                                  label="Restore account"
                                />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && !error && !items.length && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-white/40 text-sm">
                    <SearchIcon className="w-6 h-6 mx-auto mb-2 text-white/30" />
                    No users match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-white/40">
            {total === 0 ? 'No results' : `Showing ${showingFrom}–${showingTo} of ${total}`}
          </div>
          <div className="flex items-center gap-1">
            <PageBtn disabled={page === 0} onClick={() => setPage(0)}>«</PageBtn>
            <PageBtn disabled={!data?.hasPrevious} onClick={() => setPage(p => Math.max(0, p - 1))}>‹</PageBtn>
            <div className="px-3 text-xs font-bold tabular-nums">
              {totalPages === 0 ? '0' : page + 1} <span className="text-white/40">/ {totalPages || 1}</span>
            </div>
            <PageBtn disabled={!data?.hasNext} onClick={() => setPage(p => p + 1)}>›</PageBtn>
            <PageBtn disabled={totalPages === 0 || page >= totalPages - 1} onClick={() => setPage(Math.max(0, totalPages - 1))}>»</PageBtn>
          </div>
        </div>
      </Card>

      {(dialog.kind === 'delete' || dialog.kind === 'restore' || dialog.kind === 'verify' ||
        dialog.kind === 'promote' || dialog.kind === 'demote') && (
        <ConfirmDialog
          user={dialog.user}
          kind={dialog.kind}
          onCancel={() => setDialog({ kind: 'none' })}
          onConfirm={handleConfirm}
        />
      )}

      {dialog.kind === 'password' && (
        <PasswordDialog
          user={dialog.user}
          onCancel={() => setDialog({ kind: 'none' })}
          onSubmit={async pw => {
            try {
              await resetUserPassword(dialog.user.id, pw);
              setDialog({ kind: 'none' });
              showToast('Temporary password set · sessions revoked');
              fetchUsers();
            } catch (e) {
              showToast(e instanceof ApiError ? e.message : (e as Error).message, 'err');
            }
          }}
        />
      )}

      {dialog.kind === 'detail' && (
        <DetailDialog
          userId={dialog.userId}
          onClose={() => setDialog({ kind: 'none' })}
          onAction={(kind, user) => setDialog({ kind, user })}
          meId={meId}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60]">
          <div className={`px-4 py-2.5 rounded-xl border backdrop-blur shadow-2xl text-sm font-semibold ${
            toast.tone === 'ok'
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
              : 'bg-red-500/15 border-red-400/30 text-red-200'
          }`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
};

// ───────────────────── small UI helpers ─────────────────────

const Select: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
  className?: string;
}> = ({ label, value, onChange, options, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">{label}</span>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 pr-8 text-sm font-semibold outline-none focus:border-[#3F9BFF]/60 focus:bg-white/[0.07] transition-colors"
      >
        {options.map(o => (
          <option key={o.v} value={o.v} className="bg-[#0E1320]">{o.l}</option>
        ))}
      </select>
      <svg viewBox="0 0 24 24" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
    </div>
  </label>
);

const DateField: React.FC<{
  label: string; value: string; onChange: (v: string) => void; min?: string; max?: string; className?: string;
}> = ({ label, value, onChange, min, max, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">{label}</span>
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#3F9BFF]/60 focus:bg-white/[0.07] transition-colors [color-scheme:dark]"
    />
  </label>
);

const PageBtn: React.FC<{ disabled?: boolean; onClick: () => void; children: React.ReactNode }> = ({
  disabled, onClick, children,
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 text-sm font-bold disabled:opacity-30 disabled:hover:bg-white/[0.03] transition-colors"
  >
    {children}
  </button>
);

const MenuItem: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}> = ({ onClick, icon, label, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
      danger ? 'text-red-300 hover:bg-red-500/10' : 'text-white/80 hover:bg-white/5'
    }`}
  >
    {icon}
    {label}
  </button>
);

// ───────────────────── dialogs ─────────────────────

type ConfirmKind = 'delete' | 'restore' | 'verify' | 'promote' | 'demote';

const ConfirmDialog: React.FC<{
  user: ApiUser;
  kind: ConfirmKind;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ user, kind, onCancel, onConfirm }) => {
  const meta: Record<ConfirmKind, { title: string; body: string; cta: string; tone: 'red' | 'emerald' | 'violet'; icon: React.ReactNode }> = {
    delete: {
      title: 'Soft-delete account?',
      body: `Immediately prevents ${user.displayName} from signing in and hides their public profile. All active sessions are revoked. The account can be restored later from the Deleted filter.`,
      cta: 'Soft-delete',
      tone: 'red',
      icon: <TrashIcon className="w-5 h-5" />,
    },
    restore: {
      title: 'Restore account?',
      body: `Clear the deletion mark and allow ${user.displayName} to sign in again. This action is only possible from the admin panel.`,
      cta: 'Restore',
      tone: 'emerald',
      icon: <CheckIcon className="w-5 h-5" />,
    },
    verify: {
      title: 'Force-verify account?',
      body: `Skip the OTP flow and mark ${user.displayName} as verified immediately.`,
      cta: 'Force verify',
      tone: 'emerald',
      icon: <ShieldIcon className="w-5 h-5" />,
    },
    promote: {
      title: 'Promote to ADMIN?',
      body: `${user.displayName} will gain full access to the admin console, including user management. Make sure this person is trusted.`,
      cta: 'Promote',
      tone: 'violet',
      icon: <ShieldIcon className="w-5 h-5" />,
    },
    demote: {
      title: 'Demote to USER?',
      body: `${user.displayName} will lose admin access. They keep their regular account and history.`,
      cta: 'Demote',
      tone: 'red',
      icon: <ShieldIcon className="w-5 h-5" />,
    },
  };

  const m = meta[kind];
  const ctaCls =
    m.tone === 'red' ? 'from-red-500 to-red-600 shadow-red-500/30' :
    m.tone === 'violet' ? 'from-[#8a5bff] to-[#a98bff] shadow-[#8a5bff]/30' :
    'from-emerald-500 to-emerald-600 shadow-emerald-500/30';
  const iconCls =
    m.tone === 'red' ? 'bg-red-500/15 border-red-500/30 text-red-300' :
    m.tone === 'violet' ? 'bg-[#8a5bff]/15 border-[#8a5bff]/30 text-[#a98bff]' :
    'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0E1320] shadow-2xl shadow-black/60 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border ${iconCls}`}>
              {m.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{m.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed mt-1">{m.body}</p>
            </div>
          </div>
          <div className="mt-6 flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2 rounded-xl text-sm font-bold shadow-lg bg-gradient-to-r ${ctaCls} hover:brightness-110`}
            >
              {m.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordDialog: React.FC<{
  user: ApiUser;
  onCancel: () => void;
  onSubmit: (pw: string) => void;
}> = ({ user, onCancel, onSubmit }) => {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (pw.length < 8) return setErr('Password must be at least 8 characters.');
    if (pw !== confirm) return setErr('Passwords do not match.');
    setSubmitting(true);
    try {
      await onSubmit(pw);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0E1320] shadow-2xl shadow-black/60 overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3F9BFF]/15 border border-[#3F9BFF]/30 text-[#7cb8ff] flex items-center justify-center">
              <LockIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Reset password</h3>
              <p className="text-white/40 text-xs mt-0.5">For {user.displayName} · {user.email}</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 flex items-center justify-center">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs text-amber-200">
            <span className="font-bold">⚠ Heads-up:</span> The new password will be BCrypt-hashed on the server. All active sessions for this user will be revoked immediately.
          </div>

          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">Temporary password</span>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-[#3F9BFF]/60 focus:bg-white/[0.07] font-mono"
              autoFocus
            />
          </label>
          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-[#3F9BFF]/60 focus:bg-white/[0.07] font-mono"
            />
          </label>

          {err && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 font-semibold">{err}</div>}

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-sm font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#3F9BFF] to-[#5b8bff] hover:brightness-110 text-sm font-bold shadow-lg shadow-[#3F9BFF]/30 disabled:opacity-50"
            >
              {submitting ? 'Setting…' : 'Set password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const DetailDialog: React.FC<{
  userId: number;
  onClose: () => void;
  onAction: (kind: ConfirmKind | 'password', user: ApiUser) => void;
  meId?: number;
}> = ({ userId, onClose, onAction, meId }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getUser(userId)
      .then(u => { if (!cancelled) setUser(u); })
      .catch(e => { if (!cancelled) setError(e instanceof ApiError ? e.message : 'Failed to load user.'); });
    return () => { cancelled = true; };
  }, [userId]);

  const isSelf = user?.id === meId;
  const s = user ? accountStatus(user) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0E1320] shadow-2xl shadow-black/60 overflow-hidden">
        <div className="relative h-28 bg-gradient-to-br from-[#3F9BFF]/30 via-[#8a5bff]/20 to-transparent">
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-lg border border-white/10 bg-black/30 hover:bg-black/50 flex items-center justify-center">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 -mt-10">
          {!user && !error && (
            <div className="py-10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#3F9BFF] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
          {user && s && (
            <>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border-4 border-[#0E1320] bg-white/10" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3F9BFF] to-[#8a5bff] border-4 border-[#0E1320] flex items-center justify-center text-2xl font-black">
                  {user.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black tracking-tight">{user.displayName}</h3>
                {isSelf && <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10">You</span>}
                <Badge tone={user.role === 'ADMIN' ? 'violet' : 'gray'}>{user.role}</Badge>
                <Badge tone={s.tone}>{s.label}</Badge>
                {user.isVerified ? <Badge tone="blue">Verified</Badge> : <Badge tone="amber">Unverified</Badge>}
              </div>
              {user.about && <p className="text-sm text-white/55 mt-2 leading-relaxed">{user.about}</p>}

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <DetailField label="ID" value={String(user.id)} mono />
                <DetailField label="Phone" value={user.phone} mono />
                <DetailField label="Email" value={user.email} />
                <DetailField label="Last seen" value={fmtRel(user.lastSeenAt)} />
                <DetailField label="Registered" value={fmtDate(user.createdAt)} />
                <DetailField label="Updated" value={fmtDate(user.updatedAt)} />
                {user.deletedAt && <DetailField label="Deleted" value={fmtDate(user.deletedAt)} />}
              </dl>

              <div className="mt-6 flex flex-wrap gap-2 justify-end">
                {!user.isVerified && !user.deletedAt && (
                  <button
                    onClick={() => onAction('verify', user)}
                    className="px-3 py-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-xs font-bold hover:bg-emerald-400/20"
                  >
                    Force verify
                  </button>
                )}
                {!user.deletedAt && (
                  user.role === 'USER' ? (
                    <button
                      onClick={() => onAction('promote', user)}
                      className="px-3 py-2 rounded-xl border border-[#8a5bff]/30 bg-[#8a5bff]/10 text-[#a98bff] text-xs font-bold hover:bg-[#8a5bff]/20"
                    >
                      Promote to admin
                    </button>
                  ) : !isSelf ? (
                    <button
                      onClick={() => onAction('demote', user)}
                      className="px-3 py-2 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-bold hover:bg-amber-400/20"
                    >
                      Demote to user
                    </button>
                  ) : null
                )}
                {!user.deletedAt && (
                  <button
                    onClick={() => onAction('password', user)}
                    className="px-3 py-2 rounded-xl border border-[#3F9BFF]/30 bg-[#3F9BFF]/10 text-[#7cb8ff] text-xs font-bold hover:bg-[#3F9BFF]/20"
                  >
                    Reset password
                  </button>
                )}
                {!user.deletedAt && !isSelf && (
                  <button
                    onClick={() => onAction('delete', user)}
                    className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-bold hover:bg-red-500/20"
                  >
                    Soft-delete
                  </button>
                )}
                {user.deletedAt && (
                  <button
                    onClick={() => onAction('restore', user)}
                    className="px-3 py-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-xs font-bold hover:bg-emerald-400/20"
                  >
                    Restore
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailField: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
    <dt className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</dt>
    <dd className={`mt-1 text-xs ${mono ? 'font-mono' : ''}`}>{value}</dd>
  </div>
);

export default Users;
