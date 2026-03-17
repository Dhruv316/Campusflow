import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

import { getEventById, createEvent, updateEvent } from '../../api/events.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const optionalInt = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().min(1).optional()
);
const requiredInt = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number({ required_error: 'This field is required' }).int().min(1, 'Must be at least 1')
);

const eventSchema = z
  .object({
    title:                z.string().min(3, 'At least 3 characters').max(150),
    description:          z.string().min(20, 'At least 20 characters'),
    category:             z.string().min(1, 'Category is required'),
    venue:                z.string().min(3, 'Venue is required'),
    startDate:            z.string().min(1, 'Start date is required'),
    endDate:              z.string().min(1, 'End date is required'),
    registrationDeadline: z.string().min(1, 'Deadline is required'),
    maxCapacity:          requiredInt,
    isTeamEvent:          z.boolean().default(false),
    teamMinSize:          optionalInt,
    teamMaxSize:          optionalInt,
    bannerImage:          z.string().url('Must be a valid URL').optional().or(z.literal('')),
    status:               z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End must be after start', path: ['endDate'] });
    }
    if (data.registrationDeadline && data.startDate && new Date(data.registrationDeadline) > new Date(data.startDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Deadline must be before start date', path: ['registrationDeadline'] });
    }
    if (data.isTeamEvent) {
      if (!data.teamMinSize) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Min size required', path: ['teamMinSize'] });
      if (!data.teamMaxSize) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Max size required', path: ['teamMaxSize'] });
      if (data.teamMinSize && data.teamMaxSize && data.teamMaxSize < data.teamMinSize) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Max must be ≥ min', path: ['teamMaxSize'] });
      }
    }
  });

const CATEGORY_OPTIONS = [
  { value: 'TECHNICAL', label: 'Technical' }, { value: 'CULTURAL', label: 'Cultural' },
  { value: 'SPORTS', label: 'Sports' }, { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SEMINAR', label: 'Seminar' }, { value: 'GUEST_LECTURE', label: 'Guest Lecture' },
  { value: 'CLUB', label: 'Club' }, { value: 'PLACEMENT', label: 'Placement' },
  { value: 'AWARD_CEREMONY', label: 'Award Ceremony' }, { value: 'COMPETITION', label: 'Competition' },
  { value: 'OTHER', label: 'Other' },
];

const EMPTY_DEFAULTS = {
  title: '', description: '', category: '', venue: '',
  startDate: '', endDate: '', registrationDeadline: '',
  maxCapacity: '', isTeamEvent: false,
  teamMinSize: '', teamMaxSize: '', bannerImage: '', status: 'DRAFT',
};

const toDatetimeLocal = (d) => {
  if (!d) return '';
  try { return format(typeof d === 'string' ? new Date(d) : d, "yyyy-MM-dd'T'HH:mm"); }
  catch { return ''; }
};

const SectionCard = ({ title, children }) => (
  <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-5">
    <h2 className="text-display text-xl text-white tracking-[2px] border-b border-raised pb-3">{title}</h2>
    {children}
  </div>
);

const EventForm = () => {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const isEdit      = Boolean(id);
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState('');
  const [tagList,  setTagList]  = useState([]);

  const { register, handleSubmit, watch, control, reset, formState: { errors } } = useForm({
    resolver:      zodResolver(eventSchema),
    defaultValues: EMPTY_DEFAULTS,
    mode:          'onTouched',
  });

  const isTeamEvent = watch('isTeamEvent');

  useEffect(() => {
    if (!isEdit) { reset(EMPTY_DEFAULTS); setTagList([]); setTagInput(''); }
  }, [id, isEdit, reset]);

  const { data: existingData, isLoading: loadingEvent } = useQuery({
    queryKey: ['event', id],
    queryFn:  () => getEventById(id),
    enabled:  isEdit,
  });

  useEffect(() => {
    if (isEdit && existingData?.data?.event) {
      const ev = existingData.data.event;
      reset({
        title: ev.title, description: ev.description, category: ev.category, venue: ev.venue,
        startDate: toDatetimeLocal(ev.startDate), endDate: toDatetimeLocal(ev.endDate),
        registrationDeadline: toDatetimeLocal(ev.registrationDeadline),
        maxCapacity: String(ev.maxCapacity), isTeamEvent: ev.isTeamEvent,
        teamMinSize: ev.teamMinSize ? String(ev.teamMinSize) : '',
        teamMaxSize: ev.teamMaxSize ? String(ev.teamMaxSize) : '',
        bannerImage: ev.bannerImage ?? '', status: ev.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      });
      setTagList(ev.tags ?? []);
    }
  }, [isEdit, existingData, reset]);

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => { toast.success('Event created!'); queryClient.invalidateQueries({ queryKey: ['events'] }); navigate('/admin/events'); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateEvent(id, data),
    onSuccess: () => { toast.success('Event updated!'); queryClient.invalidateQueries({ queryKey: ['events'] }); queryClient.invalidateQueries({ queryKey: ['event', id] }); navigate('/admin/events'); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (tag && !tagList.includes(tag)) setTagList((p) => [...p, tag]);
      setTagInput('');
    }
  };
  const removeTag = (tag) => setTagList((p) => p.filter((t) => t !== tag));

  const onSubmit = (data, publishNow = false) => {
    const payload = { ...data, status: publishNow ? 'PUBLISHED' : data.status, tags: tagList, teamMinSize: data.isTeamEvent ? data.teamMinSize : null, teamMaxSize: data.isTeamEvent ? data.teamMaxSize : null };
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (isEdit && loadingEvent) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Event' : 'Create Event'}
        subtitle={isEdit ? 'Update event details' : 'Create a new campus event'}
        actions={[{ label: 'Cancel', variant: 'ghost', onClick: () => navigate('/admin/events') }]}
      />

      <form onSubmit={handleSubmit((d) => onSubmit(d, false))} noValidate className="max-w-3xl space-y-6">
        <SectionCard title="BASIC INFORMATION">
          <Input label="Event Title" name="title" placeholder="e.g. TechSprint 2025" register={register} error={errors.title?.message} required />
          <Textarea label="Description" name="description" placeholder="Describe the event…" register={register} error={errors.description?.message} rows={5} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Category" name="category" options={CATEGORY_OPTIONS} register={register} error={errors.category?.message} required />
            <Select label="Status" name="status" options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }]} register={register} error={errors.status?.message} />
          </div>
          <Input label="Venue" name="venue" placeholder="e.g. Main Auditorium" register={register} error={errors.venue?.message} required />
          <Input label="Banner Image URL" name="bannerImage" type="url" placeholder="https://example.com/banner.jpg" register={register} error={errors.bannerImage?.message} />
        </SectionCard>

        <SectionCard title="SCHEDULE">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Start Date & Time" name="startDate" type="datetime-local" register={register} error={errors.startDate?.message} required />
            <Input label="End Date & Time" name="endDate" type="datetime-local" register={register} error={errors.endDate?.message} required />
          </div>
          <Input label="Registration Deadline" name="registrationDeadline" type="datetime-local" register={register} error={errors.registrationDeadline?.message} required />
        </SectionCard>

        <SectionCard title="CAPACITY & TEAM">
          <Input label="Maximum Capacity" name="maxCapacity" type="number" placeholder="e.g. 200" register={register} error={errors.maxCapacity?.message} required />
          <div className="flex items-center gap-3">
            <Controller
              name="isTeamEvent" control={control}
              render={({ field }) => (
                <button type="button" role="switch" aria-checked={field.value} onClick={() => field.onChange(!field.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${field.value ? 'bg-lime' : 'bg-raised border border-border'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              )}
            />
            <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary">This is a team event</label>
          </div>
          {isTeamEvent && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Team Size" name="teamMinSize" type="number" placeholder="e.g. 2" register={register} error={errors.teamMinSize?.message} required />
              <Input label="Max Team Size" name="teamMaxSize" type="number" placeholder="e.g. 4" register={register} error={errors.teamMaxSize?.message} required />
            </div>
          )}
        </SectionCard>

        <SectionCard title="TAGS">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary mb-1.5 block">
              Tags <span className="text-muted font-normal normal-case tracking-normal">(Enter or comma to add)</span>
            </label>
            <div className="flex flex-wrap gap-2 p-2.5 rounded-lg bg-black/50 backdrop-blur-sm border border-border focus-within:border-lime focus-within:ring-2 focus-within:ring-lime/20 transition-all min-h-[44px]">
              {tagList.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-raised border border-border text-lime text-xs font-bold uppercase">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-muted hover:text-pink transition-colors ml-0.5"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <input
                type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
                placeholder={tagList.length === 0 ? 'hackathon, coding, prize…' : ''}
                className="flex-1 min-w-[120px] text-sm bg-transparent text-white placeholder:text-muted outline-none"
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex items-center justify-end gap-3 pb-6">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/events')}>Cancel</Button>
          <Button type="submit" variant="secondary" isLoading={isSaving}>Save as Draft</Button>
          <Button type="button" variant="primary" isLoading={isSaving} onClick={handleSubmit((d) => onSubmit(d, true))}>Publish Event</Button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
