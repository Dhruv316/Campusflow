import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Award } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';

import { getAdminCertificates, issueCertificate } from '../../api/certificates.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const AdminCertificates = () => {
  const queryClient  = useQueryClient();
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const queryKey = ['certificates-admin', { search, page: currentPage }];
  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => getAdminCertificates({ search: search || undefined, page: currentPage, limit: 20 }),
    keepPreviousData: true,
  });
  const certificates = data?.data?.certificates ?? [];
  const pagination   = data?.pagination;

  const issueMutation = useMutation({
    mutationFn: issueCertificate,
    onSuccess: (res) => { toast.success(`Certificate issued: ${res?.data?.certificate?.certificateNumber}`); queryClient.invalidateQueries({ queryKey: ['certificates-admin'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader title="Certificates" subtitle="Issue and manage participation certificates" />

      <div className="mb-6">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search by student, event, or cert number…" className="w-full sm:w-80" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="bg-pink/10 border border-pink/30 rounded-xl p-6 text-center"><p className="text-sm text-pink">{getErrorMessage(error)}</p></div>
      ) : certificates.length === 0 ? (
        <EmptyState icon={Award} title="No certificates issued yet" description={search ? 'No certificates match your search.' : 'Issue certificates to students who have attended events.'} />
      ) : (
        <>
          <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-raised bg-raised/40">
                    {['Student', 'Event', 'Certificate No.', 'Issued On', 'Download'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[1.5px] text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="border-b border-raised hover:bg-raised/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={cert.student?.name} src={cert.student?.avatar} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{cert.student?.name}</p>
                            <p className="text-xs text-muted truncate">{cert.student?.rollNumber ?? cert.student?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-white truncate max-w-[200px]">{cert.event?.title}</p>
                        <Badge variant="default" className="mt-0.5">{cert.event?.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-bold text-yellow tracking-widest">{cert.certificateNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                        {cert.issuedAt ? format(typeof cert.issuedAt === 'string' ? parseISO(cert.issuedAt) : cert.issuedAt, 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {cert.downloadUrl ? (
                          <a href={cert.downloadUrl} target="_blank" rel="noreferrer"
                            className="text-xs font-bold text-lime hover:text-lime/70 uppercase tracking-[0.5px] transition-colors">
                            Download
                          </a>
                        ) : <span className="text-xs text-muted">—</span>}
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
    </div>
  );
};

export default AdminCertificates;
