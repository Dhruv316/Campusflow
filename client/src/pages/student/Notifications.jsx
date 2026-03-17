import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Bell, Clock, ClipboardList, CalendarPlus, Megaphone, Award, CheckCheck } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Button from '../../components/ui/Button.jsx';

import { getMyNotifications, markRead, markAllRead } from '../../api/notifications.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const TYPE_CONFIG = {
  EVENT_REMINDER:      { icon: Clock,        color: 'text-cyan',   bg: 'bg-cyan/10'   },
  REGISTRATION_UPDATE: { icon: ClipboardList, color: 'text-yellow', bg: 'bg-yellow/10' },
  NEW_EVENT:           { icon: CalendarPlus,  color: 'text-lime',   bg: 'bg-lime/10'   },
  ANNOUNCEMENT:        { icon: Megaphone,     color: 'text-pink',   bg: 'bg-pink/10'   },
  CERTIFICATE_READY:   { icon: Award,         color: 'text-yellow', bg: 'bg-yellow/10' },
};

const groupByDate = (notifications) => {
  const groups = {};
  notifications.forEach((n) => {
    const d = typeof n.createdAt === 'string' ? parseISO(n.createdAt) : n.createdAt;
    const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
};

const StudentNotifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-notifications', { page: 1 }],
    queryFn:  () => getMyNotifications({ page: 1, limit: 50 }),
  });
  const notifications = data?.data?.notifications ?? [];
  const unreadCount   = data?.data?.unreadCount ?? 0;
  const grouped       = groupByDate(notifications);

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifications'] }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => { toast.success('All notifications marked as read.'); queryClient.invalidateQueries({ queryKey: ['my-notifications'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'Stay up to date with your events'}
        actions={unreadCount > 0 ? [{ label: 'Mark all as read', variant: 'secondary', icon: CheckCheck, onClick: () => markAllMutation.mutate() }] : []}
      />

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You'll be notified about event updates, registrations, and certificates here." />
      ) : (
        <div className="space-y-6 max-w-2xl">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted mb-3">{dateLabel}</p>
              <div className="space-y-2">
                {items.map((n) => {
                  const { icon: Icon, color, bg } = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.ANNOUNCEMENT;
                  return (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.isRead) markReadMutation.mutate(n.id); }}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150 hover:border-lime/40 ${
                        !n.isRead ? 'bg-black/50 backdrop-blur-sm border-l-4 border-l-lime border-border' : 'bg-black/50 backdrop-blur-sm border-border hover:bg-raised/40'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-white' : 'font-semibold text-secondary'}`}>{n.title}</p>
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-lime shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-muted/60 mt-1.5">
                          {n.createdAt ? format(typeof n.createdAt === 'string' ? parseISO(n.createdAt) : n.createdAt, 'h:mm a') : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
