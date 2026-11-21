import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Switch, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useDeleteEvent, useEvent, usePeople, useSaveEvent, type FlakeyEvent } from '@/features/data';
import { useTheme } from '@/hooks/use-theme';
import { EVENT_TYPE_META, EVENT_TYPES_ORDER, type DateType, type EventType } from '@/lib/dates';
import { getPersonDisplayName } from '@/lib/people';
import { Button, Chip, ChipRow, ErrorNotice, Field, Loading, Screen, Text } from '@/ui';
import { DateField } from '@/ui/date-field';

/** Add (no id) or edit (id) a key date. ?personId pre-selects the person. */
export default function EditDateScreen() {
  const { id, personId } = useLocalSearchParams<{ id?: string; personId?: string }>();
  const existing = useEvent(id);

  if (id && existing.isPending) return <Loading />;
  if (id && (existing.isError || !existing.data)) {
    return (
      <Screen>
        <ErrorNotice error={existing.error ?? new Error('This date no longer exists.')} />
      </Screen>
    );
  }
  return <DateForm event={existing.data ?? null} initialPersonId={personId ?? null} />;
}

function DateForm({ event, initialPersonId }: { event: FlakeyEvent | null; initialPersonId: string | null }) {
  const router = useRouter();
  const t = useTheme();
  const people = usePeople();
  const save = useSaveEvent();
  const remove = useDeleteEvent();

  const [eventType, setEventType] = useState<EventType>(event?.event_type ?? 'birthday');
  const [personId, setPersonId] = useState<string | null>(event ? event.person_id : initialPersonId);
  const [title, setTitle] = useState(event?.title ?? '');
  const [titleTouched, setTitleTouched] = useState(!!event);
  const [dateValue, setDateValue] = useState<string | null>(event?.date_value ?? null);
  const [repeats, setRepeats] = useState<boolean>(event ? event.date_type === 'recurring_annual' : true);
  const [error, setError] = useState<string | null>(null);

  const meta = EVENT_TYPE_META[eventType];
  const person = people.data?.find((p) => p.id === personId) ?? null;
  const personName = person ? getPersonDisplayName(person) : null;

  // Like the web form: the title fills itself in until the user edits it.
  const displayTitle = titleTouched || !meta.autoTitle ? title : meta.buildTitle(personName);

  const submit = () => {
    if (!displayTitle.trim()) return setError('Give this date a name.');
    if (!dateValue) return setError('Pick a date.');
    setError(null);
    const dateType: DateType = repeats ? 'recurring_annual' : 'exact_date';
    save.mutate(
      {
        id: event?.id,
        personId,
        title: displayTitle,
        eventType,
        dateType,
        dateValue,
        importance: event?.importance ?? (eventType === 'birthday' ? 5 : 3),
      },
      {
        onSuccess: () => router.back(),
        onError: (e) => Alert.alert("Couldn't save", e instanceof Error ? e.message : 'Please try again.'),
      },
    );
  };

  const confirmDelete = () =>
    Alert.alert('Delete this date?', 'You will stop getting reminders for it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          remove.mutate(event!.id, {
            onSuccess: () => router.back(),
            onError: (e) => Alert.alert("Couldn't delete", e instanceof Error ? e.message : ''),
          }),
      },
    ]);

  return (
    <>
      <Stack.Screen options={{ title: event ? 'Edit key date' : 'New key date' }} />
      <Screen>
        <View style={{ gap: Spacing.sm }}>
          <Text variant="label">What kind of day?</Text>
          <ChipRow>
            {EVENT_TYPES_ORDER.map((type) => (
              <Chip
                key={type}
                label={`${EVENT_TYPE_META[type].emoji} ${EVENT_TYPE_META[type].label}`}
                selected={eventType === type}
                onPress={() => {
                  setEventType(type);
                  if (!event) setTitleTouched(false);
                  // Holidays fall on a set day, so fill the date in for them.
                  const fixed = EVENT_TYPE_META[type].getDefaultDate();
                  if (fixed) setDateValue(fixed);
                }}
              />
            ))}
          </ChipRow>
        </View>

        <View style={{ gap: Spacing.sm }}>
          <Text variant="label">For</Text>
          <ChipRow>
            <Chip label="No one in particular" selected={personId === null} onPress={() => setPersonId(null)} />
            {(people.data ?? []).map((p) => (
              <Chip key={p.id} label={getPersonDisplayName(p)} selected={personId === p.id} onPress={() => setPersonId(p.id)} />
            ))}
          </ChipRow>
        </View>

        <Field
          label="Name"
          value={displayTitle}
          onChangeText={(v) => {
            setTitle(v);
            setTitleTouched(true);
            setError(null);
          }}
          placeholder="e.g. First date anniversary"
        />

        <DateField
          label="Date"
          value={dateValue}
          onChange={(v) => {
            setDateValue(v);
            setError(null);
          }}
          disabled={meta.fixedDate}
        />
        {meta.fixedDate ? (
          <Text variant="caption" muted>
            {meta.label} falls on the same day for everyone, so the date is set for you.
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text variant="label">Repeats every year</Text>
            <Text variant="caption" muted>
              Turn off for one-off dates like a trip or a big move.
            </Text>
          </View>
          <Switch value={repeats} onValueChange={setRepeats} trackColor={{ true: t.primary }} accessibilityLabel="Repeats every year" />
        </View>

        {error ? <Text style={{ color: t.danger }}>{error}</Text> : null}
        <Button title={event ? 'Save changes' : 'Add key date'} onPress={submit} loading={save.isPending} />
        {event ? <Button title="Delete this date" variant="danger" onPress={confirmDelete} loading={remove.isPending} /> : null}
      </Screen>
    </>
  );
}
