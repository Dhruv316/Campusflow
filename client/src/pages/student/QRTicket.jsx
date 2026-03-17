import { format, parseISO } from 'date-fns';
import { Download, Printer, Calendar, MapPin, User } from 'lucide-react';
import Modal from '../../components/ui/Modal.jsx';
import Badge, { registrationStatusVariant, registrationStatusLabel } from '../../components/ui/Badge.jsx';
import useAuth from '../../hooks/useAuth.js';

const QRTicket = ({ isOpen, onClose, registration }) => {
  const { user } = useAuth();
  if (!registration) return null;

  const { event, qrCode, qrCodeImage, status } = registration;
  const formatDate = (d) => d ? format(typeof d === 'string' ? parseISO(d) : d, 'EEEE, MMMM d, yyyy · h:mm a') : '—';

  const handleDownload = () => {
    if (!qrCodeImage) return;
    const link = document.createElement('a');
    link.href     = qrCodeImage;
    link.download = `campusflow-ticket-${qrCode ?? 'ticket'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('qr-ticket-printable');
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=420,height=640');
    if (!win) { window.print(); return; }
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CampusFlow Ticket</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:white;padding:24px;display:flex;justify-content:center}
      .ticket{max-width:340px;width:100%;border:2px solid #4A1080;border-radius:12px;overflow:hidden}.header{background:#1A0A2E;color:#AAFF00;text-align:center;padding:16px;font-size:14px;font-weight:700;letter-spacing:2px}
      .body{padding:20px;display:flex;flex-direction:column;align-items:center;gap:14px}.qr-img{width:180px;height:180px;background:white;padding:8px}.qr-code{font-family:monospace;font-size:9px;color:#8B6BA8;word-break:break-all;text-align:center}
      .info{background:#0D0D0D;border:1px solid #2D1050;border-radius:8px;padding:12px;width:100%}.title{font-size:13px;font-weight:700;color:white;text-align:center;margin-bottom:8px}
      .meta{font-size:11px;color:#8B6BA8;margin-bottom:4px}@media print{body{padding:0}}</style></head>
      <body><div class="ticket"><div class="header">🎓 CAMPUSFLOW ENTRY TICKET</div>
      <div class="body">${qrCodeImage ? `<img class="qr-img" src="${qrCodeImage}" alt="QR">` : '<div style="width:180px;height:180px;background:#1E0A3C;display:flex;align-items:center;justify-content:center;color:#8B6BA8;font-size:11px">QR not available</div>'}
      <div class="qr-code">${qrCode ?? ''}</div>
      <div class="info"><div class="title">${event?.title ?? ''}</div>
      <div class="meta">📅 ${formatDate(event?.startDate)}</div><div class="meta">📍 ${event?.venue ?? '—'}</div>
      <div class="meta">👤 ${user?.name ?? ''}${user?.rollNumber ? ` · ${user.rollNumber}` : ''}</div></div>
      <span style="padding:4px 16px;border-radius:99px;background:#AAFF0022;color:#AAFF00;border:1px solid #AAFF0066;font-size:11px;font-weight:700;text-transform:uppercase">${status === 'ATTENDED' ? '✓ Checked In' : registrationStatusLabel(status)}</span>
      </div></div></body></html>`);
    win.document.close();
    win.focus();
    win.onload = () => {
      win.print();
      let closed = false;
      const closeWin = () => { if (!closed) { closed = true; win.close(); } };
      win.onafterprint = closeWin;
      setTimeout(closeWin, 30_000);
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="YOUR QR TICKET" size="sm">
      <div className="p-6 flex flex-col items-center gap-5">
        <div id="qr-ticket-printable" className="flex flex-col items-center gap-4 w-full">
          {/* QR with white padding for scannability */}
          <div className="p-4 bg-white rounded-2xl shadow-[0_0_24px_#AAFF0022]">
            {qrCodeImage
              ? <img src={qrCodeImage} alt="QR Code" className="w-[180px] h-[180px] block rounded-lg" />
              : <div className="w-[180px] h-[180px] bg-ink rounded-lg flex items-center justify-center"><p className="text-xs text-muted text-center px-4">QR code not available</p></div>
            }
          </div>

          <p className="text-xs font-mono text-muted tracking-widest text-center break-all px-2">{qrCode}</p>

          <div className="w-full bg-raised border border-border rounded-xl p-4 space-y-2.5">
            <h3 className="text-display text-xl text-white tracking-[2px] text-center leading-snug">{event?.title?.toUpperCase()}</h3>
            <div className="space-y-1.5 text-xs text-muted">
              <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-lime/60 shrink-0" /><span>{formatDate(event?.startDate)}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-lime/60 shrink-0" /><span className="truncate">{event?.venue ?? '—'}</span></div>
              <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-lime/60 shrink-0" /><span>{user?.name}</span>{user?.rollNumber && <span className="font-mono text-muted">· {user.rollNumber}</span>}</div>
            </div>
          </div>

          <Badge variant={registrationStatusVariant(status)}>
            {status === 'ATTENDED' ? '✓ Checked In' : registrationStatusLabel(status)}
          </Badge>
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-cyan/60 text-cyan font-bold uppercase text-xs tracking-[1px] rounded-full hover:bg-cyan hover:text-ink transition-all">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleDownload} disabled={!qrCodeImage}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-lime text-ink font-bold uppercase text-xs tracking-[1px] rounded-full hover:shadow-lime disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>

        <p className="text-xs text-muted text-center">Present this QR code at the venue for entry check-in.</p>
      </div>
    </Modal>
  );
};

export default QRTicket;
