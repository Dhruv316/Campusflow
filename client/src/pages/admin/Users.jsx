import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

import { getAllUsers, toggleUserStatus } from '../../api/users.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'STUDENT', label: 'Students' },
  { value: 'ADMIN', label: 'Admins' },
];

const AdminUsers = () => {
  const queryClient  = useQueryClient();
  const [search,       setSearch]       = useState('');
  const [role,         setRole]         = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [toggleTarget, setToggleTarget] = useState(null);

  const queryKey = ['users', { search, role, page: currentPage }];
  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => getAllUsers({ search: search || undefined, role: role || undefined, page: currentPage, limit: 20 }),
    keepPreviousData: true,
  });
  const users      = data?.data?.users ?? [];
  const pagination = data?.pagination;

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleUserStatus(id),
    onSuccess: (res) => { const user = res?.data?.user; toast.success(`${user?.name} ${user?.isActive ? 'activated' : 'deactivated'}.`); queryClient.invalidateQueries({ queryKey: ['users'] }); setToggleTarget(null); },
    onError: (err) => { toast.error(getErrorMessage(err)); setToggleTarget(null); },
  });

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage all registered students and administrators" />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search by name, email or roll number…" className="w-full sm:w-72" />
        <select
          value={role} onChange={(e) => { setRole(e.target.value); setCurrentPage(1); }}
          className="text-sm rounded-lg px-3 py-2.5 bg-black/50 backdrop-blur-sm border border-border text-white focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all"
        >
          {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-black/50 backdrop-blur-sm">{o.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="bg-pink/10 border border-pink/30 rounded-xl p-6 text-center"><p className="text-sm text-pink">{getErrorMessage(error)}</p></div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description={search ? 'No users match your search.' : 'Users will appear here once they register.'} />
      ) : (
        <>
          <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-raised bg-raised/40">
                    {['Student', 'Roll No.', 'Department', 'Year', 'Role', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[1.5px] text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-raised hover:bg-raised/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} src={user.avatar} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-muted truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-muted">{user.rollNumber ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-secondary">{user.department ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-secondary">{user.year ? `Year ${user.year}` : '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'ADMIN' ? 'warning' : 'info'}>{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setToggleTarget(user)}
                          className={`text-xs font-bold uppercase tracking-[0.5px] transition-colors ${user.isActive ? 'text-pink hover:text-pink/70' : 'text-lime hover:text-lime/70'}`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {pagination && pagination.totalPages > 1 && <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={setCurrentPage} />}
        </>
      )}

      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => toggleMutation.mutate(toggleTarget?.id)}
        isLoading={toggleMutation.isPending}
        title={toggleTarget?.isActive ? 'Deactivate User' : 'Activate User'}
        message={toggleTarget?.isActive ? `Deactivate "${toggleTarget?.name}"? They will not be able to log in.` : `Activate "${toggleTarget?.name}"? They will be able to log in again.`}
        confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.isActive ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default AdminUsers;
