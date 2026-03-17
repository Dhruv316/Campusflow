import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Award, Download, Calendar, Loader2 } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import PageError from '../../components/ui/PageError.jsx';

import { getMyCertificates, downloadCertificate } from '../../api/certificates.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const StudentCertificates = () => {
  const [downloadingId, setDownloadingId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-certificates'],
    queryFn:  getMyCertificates,
  });
  const certificates = data?.data?.certificates ?? [];

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    try {
      const blob = await downloadCertificate(cert.id);
      const ext  = blob.type === 'application/pdf' ? 'pdf' : 'html';
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `certificate-${cert.certificateNumber}.${ext}`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success('Certificate downloaded!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div>
      <PageHeader title="My Certificates" subtitle="Download your participation certificates" />

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : isError ? (
        <PageError error={error} title="Failed to load certificates" />
      ) : certificates.length === 0 ? (
        <EmptyState icon={Award} title="No certificates yet" description="Attend events to earn participation certificates. They'll appear here after the event is completed." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-black/50 backdrop-blur-sm border border-yellow/30 rounded-2xl overflow-hidden hover:border-yellow hover:shadow-[0_0_20px_#F5E64222] transition-all duration-200">
              {/* Header gradient */}
              <div className="h-24 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2A1A00 0%, #F5E64222 100%)' }}>
                <div className="w-14 h-14 rounded-full bg-yellow/20 border border-yellow/40 flex items-center justify-center">
                  <Award className="w-8 h-8 text-yellow" />
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">{cert.event?.title}</h3>

                <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                  <Calendar className="w-3.5 h-3.5 text-yellow/60" />
                  {cert.issuedAt ? format(typeof cert.issuedAt === 'string' ? parseISO(cert.issuedAt) : cert.issuedAt, 'MMM d, yyyy') : '—'}
                </div>

                <p className="text-xs font-mono font-bold text-yellow mb-4 tracking-[1px]">{cert.certificateNumber}</p>

                <button
                  onClick={() => handleDownload(cert)}
                  disabled={downloadingId === cert.id}
                  className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 bg-lime text-ink font-bold uppercase text-xs tracking-[1px] rounded-full hover:shadow-lime disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {downloadingId === cert.id ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />Downloading…</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" />Download</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
