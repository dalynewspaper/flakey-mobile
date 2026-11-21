import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { buildAutoDates } from '@/lib/autoDates';
import type { Database } from '@/lib/database.types';
import { getDaysUntil, type DateType, type EventType } from '@/lib/dates';
import type { RelationshipType } from '@/lib/people';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth';

type Tables = Database['public']['Tables'];

export type Person = Tables['people']['Row'];
export type FlakeyEvent = Tables['events']['Row'] & {
  person?: { id: string; first_name: string; last_name: string | null; nickname: string | null } | null;
};
export type Nudge = Tables['nudges']['Row'];
export type Profile = Tables['profiles']['Row'];

const EVENT_SELECT = '*, person:people(id, first_name, last_name, nickname)';

function useUserId(): string | undefined {
  return useAuth().user?.id;
}

// ---------- People ----------

export function usePeople() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['people', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Person[]> => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', userId!)
        .order('first_name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePerson(personId: string | undefined) {
  const userId = useUserId();
  return useQuery({
    queryKey: ['person', personId],
    enabled: !!userId && !!personId,
    queryFn: async (): Promise<Person | null> => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId!)
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export interface PersonInput {
  firstName: string;
  relationshipType: RelationshipType;
  birthday?: string | null;
  notes?: string | null;
  interests?: string[];
}

export function useCreatePerson() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PersonInput & { avatar?: string | null }): Promise<{ person: Person; addedDates: string[] }> => {
      if (!userId) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('people')
        .insert({
          user_id: userId,
          first_name: input.firstName.trim(),
          relationship_type: input.relationshipType,
          birthday: input.birthday || null,
          notes: input.notes?.trim() || null,
          interests: input.interests ?? [],
          avatar_url: input.avatar ?? null,
        })
        .select()
        .single();
      if (error) throw error;

      // Same as the web wizard: birthday plus role-based key dates, so they
      // appear in Dates and get reminders straight away.
      const autoDates = buildAutoDates({
        firstName: data.first_name,
        relationshipType: data.relationship_type,
        birthday: data.birthday,
      });
      const addedDates: string[] = [];
      if (autoDates.length > 0) {
        const { error: eventError } = await supabase.from('events').insert(
          autoDates.map((d) => ({
            user_id: userId,
            person_id: data.id,
            title: d.title,
            event_type: d.eventType,
            date_type: 'recurring_annual' as const,
            date_value: d.dateValue,
            importance: d.importance,
            is_active: true,
            is_suggested: false,
          })),
        );
        if (eventError) console.warn('Key dates not created', eventError.message);
        else addedDates.push(...autoDates.map((d) => d.label));
      }
      return { person: data, addedDates };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['people'] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdatePerson() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<PersonInput> & { id: string }): Promise<Person> => {
      if (!userId) throw new Error('Not signed in');
      const update: Tables['people']['Update'] = {};
      if (input.firstName !== undefined) update.first_name = input.firstName.trim();
      if (input.relationshipType !== undefined) update.relationship_type = input.relationshipType;
      if (input.birthday !== undefined) update.birthday = input.birthday || null;
      if (input.notes !== undefined) update.notes = input.notes?.trim() || null;
      if (input.interests !== undefined) update.interests = input.interests;
      const { data, error } = await supabase
        .from('people')
        .update(update)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (person) => {
      qc.invalidateQueries({ queryKey: ['people'] });
      qc.invalidateQueries({ queryKey: ['person', person.id] });
    },
  });
}

export function useDeletePerson() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (personId: string) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = await supabase.from('people').delete().eq('id', personId).eq('user_id', userId);
      if (error) throw error;
      return personId;
    },
    onSuccess: (personId) => {
      qc.invalidateQueries({ queryKey: ['people'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.removeQueries({ queryKey: ['person', personId] });
    },
  });
}

// ---------- Key dates (events) ----------

export function useEvents() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['events', userId],
    enabled: !!userId,
    queryFn: async (): Promise<FlakeyEvent[]> => {
      const { data, error } = await supabase
        .from('events')
        .select(EVENT_SELECT)
        .eq('user_id', userId!)
        .eq('is_active', true);
      if (error) throw error;
      return (data ?? []) as FlakeyEvent[];
    },
  });
}

export interface UpcomingEvent extends FlakeyEvent {
  daysUntil: number;
}

/** Active dated events sorted by next occurrence, optionally limited to a window. */
export function sortUpcoming(events: FlakeyEvent[] | undefined, daysAhead = Infinity): UpcomingEvent[] {
  return (events ?? [])
    .filter((e) => !!e.date_value)
    .map((e) => ({ ...e, daysUntil: getDaysUntil(e.date_value!, e.date_type) }))
    .filter((e) => e.daysUntil >= 0 && e.daysUntil <= daysAhead)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function useEvent(eventId: string | undefined) {
  const userId = useUserId();
  return useQuery({
    queryKey: ['events', 'one', eventId],
    enabled: !!userId && !!eventId,
    queryFn: async (): Promise<FlakeyEvent | null> => {
      const { data, error } = await supabase
        .from('events')
        .select(EVENT_SELECT)
        .eq('id', eventId!)
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data as FlakeyEvent | null;
    },
  });
}

export interface EventInput {
  personId: string | null;
  title: string;
  eventType: EventType;
  dateType: DateType;
  dateValue: string;
  importance?: number;
}

export function useSaveEvent() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: EventInput & { id?: string }) => {
      if (!userId) throw new Error('Not signed in');
      const row = {
        person_id: input.personId,
        title: input.title.trim(),
        event_type: input.eventType,
        date_type: input.dateType,
        date_value: input.dateValue,
        importance: input.importance ?? 3,
      };
      const query = id
        ? supabase.from('events').update(row).eq('id', id).eq('user_id', userId)
        : supabase.from('events').insert({ ...row, user_id: userId, is_active: true, is_suggested: false });
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = await supabase.from('events').delete().eq('id', eventId).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

// ---------- Nudges ----------

export function useNudges() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['nudges', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Nudge[]> => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('nudges')
        .select('*')
        .in('status', ['pending', 'snoozed'])
        .or(`snoozed_until.is.null,snoozed_until.lte.${nowIso}`)
        .order('importance', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type NudgeAction = 'mark_sent' | 'dismiss' | 'snooze';

/** Goes through the same send-nudge function as the web app. */
export function useNudgeAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ nudgeId, action, snoozeDays }: { nudgeId: string; action: NudgeAction; snoozeDays?: number }) => {
      const { error } = await supabase.functions.invoke('send-nudge', {
        body: { nudge_id: nudgeId, action, snooze_days: snoozeDays },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nudges'] }),
  });
}

// ---------- Profile ----------

export function useProfile() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
