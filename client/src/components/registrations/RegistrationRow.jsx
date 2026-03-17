import { format, parseISO } from 'date-fns';
import { CheckSquare, X, QrCode } from 'lucide-react';
import Badge, { registrationStatusVariant, registrationStatusLabel } from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';

const RegistrationRow = ({ registration, onApprove, onReject, onCheckin, selected, onSelect }) => {
  const { student, event, status, registeredAt, checkedInAt } = registration;

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return format(typeof d === 'string' ? parseISO(d) : d, 'MMM d, HH:mm'); }
    catch { return '—'; }
  };

  return (
    <tr className="border-b border-raised hover:bg-raised/60 transition-colors">
      {/* Checkbox */}
      <td className="px-4 py-3 w-10">
        {onSelect && (
          <input
            type="checkbox"
            checked={selected ?? false}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-ink text-lime focus:ring-lime/40 accent-lime"
          />
        )}
      </td>

      {/* Student */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={student?.name} src={student?.avatar} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{student?.name}</p>
            <p className="text-xs text-muted truncate">{student?.email}</p>
          </div>
        </div>
      </td>

      {/* Event */}
      <td className="px-4 py-3">
        <p className="text-sm text-white truncate max-w-[160px]">{event?.title ?? '—'}</p>
        {student?.rollNumber && (
          <p className="text-xs font-mono text-muted">{student.rollNumber}</p>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge variant={registrationStatusVariant(status)}>{registrationStatusLabel(status)}</Badge>
      </td>

      {/* Registered */}
      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
        {fmtDate(registeredAt)}
        {checkedInAt && (
          <span className="block text-lime text-[10px] font-bold uppercase mt-0.5">
            ✓ Checked in {fmtDate(checkedInAt)}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {onApprove && status === 'PENDING' && (
            <button
              onClick={onApprove}
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.5px] border border-lime/60 text-lime hover:bg-lime hover:text-ink transition-all duration-150"
            >
              Approve
            </button>
          )}
          {onReject && ['PENDING','APPROVED','WAITLISTED'].includes(status) && (
            <button
              onClick={onReject}
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.5px] border border-pink/60 text-pink hover:bg-pink hover:text-white transition-all duration-150"
            >
              Reject
            </button>
          )}
          {onCheckin && status === 'APPROVED' && (
            <button
              onClick={onCheckin}
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.5px] border border-cyan/60 text-cyan hover:bg-cyan hover:text-ink transition-all duration-150"
            >
              Check In
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default RegistrationRow;
