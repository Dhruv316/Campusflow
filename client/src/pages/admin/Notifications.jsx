import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Bell, Send, Megaphone } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';

import { sendAnnouncement, getAdminNotifications } from '../../api/notifications.api.js';
import { getEvents } from '../../api/events.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const notifSchema = z.object({
  title:      z.string().min(3, 'Title must be at least 3 characters'),
  message:    z.string().min(10, 'Message must be at least 10 characters'),
  targetType: z.enum(['ALL', 'EVENT'], { required_error: 'Please select an audience' }),
  eventId:    z.string().optional(),
});
const TARGET_OPTIONS = [{ value: 'ALL', label: 'All Students' }, { value: 'EVENT', label: 'Specific Event Attendees' }];

const NOTIF_COLORS = {
  ANNOUNCEMENT:        'text-lime',
  EVENT_REMINDER:      'text-cyan',
  REGISTRATION_UPDATE: 'text-yellow',
  NEW_EVENT:           'text-cyan',
  CERTIFICATE_READY:   'text-yellow',
};

const AdminNotifications = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(notifSchema),
    defaultValues: { title: '', message: '', targetType: 'ALL', eventId: '' },
  });
  const targetType = watch('targetType');

  const { data: eventsData } = useQuery({ queryKey: ['events-all'], queryFn: () => getEvents({ limit: 100 }) });
  const eventOptions = (eventsData?.data?.events ?? []).map((ev) => ({ value: ev.id, label: ev.title }));

  const { data: notifData, isLoading: loadingNotifs } = useQuery({ queryKey: ['admin-notifications'], queryFn: getAdminNotifications });
  const notifications = notifData?.data?.notifications ?? [];

  const sendMutation = useMutation({
    mutationFn: sendAnnouncement,
    onSuccess: (res) => { const count = res?.data?.sentCount ?? 0; toast.success(`Sent to ${count} student${count !== 1 ? 's' : ''}!`); reset(); queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data) => {
    sendMutation.mutate({ title: data.title, message: data.message, targetType: data.targetType, ...(data.targetType === 'EVENT' && data.eventId ? { eventId: data.eventId } : {}) });
  };

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send announcements and view notification history" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send form */}
        <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-6">
          <h2 className="text-display text-xl text-white tracking-[2px] mb-5 flex items-center gap-2">
            <Send className="w-4 h-4 text-lime" /> SEND ANNOUNCEMENT
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input label="Title" name="title" placeholder="e.g. Registration open for TechSprint 2025" register={register} error={errors.title?.message} required />
            <Textarea label="Message" name="message" placeholder="Write your announcement…" register={register} error={errors.message?.message} rows={4} required />
            <Select label="Send To" name="targetType" options={TARGET_OPTIONS} register={register} error={errors.targetType?.message} required />
            {targetType === 'EVENT' && (
              <Select label="Select Event" name="eventId" options={eventOptions} register={register} error={errors.eventId?.message} placeholder="Choose an event…" required />
            )}
            <Button type="submit" variant="primary" isLoading={sendMutation.isPending} className="w-full">
              <Send className="w-4 h-4" /> Send Notification
            </Button>
          </form>
        </div>

        {/* History */}
        <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-6">
          <h2 className="text-display text-xl text-white tracking-[2px] mb-5 flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted" /> SENT NOTIFICATIONS
          </h2>
          {loadingNotifs ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications sent" description="Announcements you send will appear here." />
          ) : (
            <ul className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-raised border border-border">
                  <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center shrink-0">
                    <Megaphone className={`w-4 h-4 ${NOTIF_COLORS[n.type] ?? 'text-lime'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{n.title}</p>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="default">{n.type.replace('_', ' ')}</Badge>
                      <span className="text-xs text-muted">
                        {n.createdAt ? formatDistanceToNow(typeof n.createdAt === 'string' ? parseISO(n.createdAt) : n.createdAt, { addSuffix: true }) : ''}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
