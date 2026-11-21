import { useState } from 'react';
import { Switch, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseDateOnly, toDateOnly } from '@/lib/dates';
import { RELATIONSHIP_OPTIONS, type RelationshipType } from '@/lib/people';
import { Button, Chip, ChipRow, Field, Text } from '@/ui';
import { DateField } from '@/ui/date-field';

import type { PersonInput } from './data';

export type PersonFormValues = PersonInput;

/**
 * Shared add/edit form. Birthday mirrors the web wizard: when the year is
 * unknown the date is stored against the current year.
 */
export function PersonForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
}: {
  initial?: Partial<PersonFormValues>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: PersonFormValues) => void;
}) {
  const t = useTheme();
  const initialBirthday = initial?.birthday ?? null;
  const initialYearKnown = initialBirthday ? parseDateOnly(initialBirthday).getFullYear() < new Date().getFullYear() - 1 : true;

  const [firstName, setFirstName] = useState(initial?.firstName ?? '');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(initial?.relationshipType ?? 'friend');
  const [birthday, setBirthday] = useState<string | null>(initialBirthday);
  const [yearKnown, setYearKnown] = useState(initialYearKnown);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [interests, setInterests] = useState((initial?.interests ?? []).join(', '));
  const [nameError, setNameError] = useState<string | null>(null);

  const submit = () => {
    if (!firstName.trim()) {
      setNameError('Add a name so you know who this is.');
      return;
    }
    let birthdayValue = birthday;
    if (birthday && !yearKnown) {
      const d = parseDateOnly(birthday);
      birthdayValue = toDateOnly(new Date(new Date().getFullYear(), d.getMonth(), d.getDate()));
    }
    onSubmit({
      firstName: firstName.trim(),
      relationshipType,
      birthday: birthdayValue,
      notes: notes.trim() || null,
      interests: interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <View style={{ gap: Spacing.xl }}>
      <Field
        label="Name"
        value={firstName}
        onChangeText={(v) => {
          setFirstName(v);
          setNameError(null);
        }}
        placeholder="What you call them, e.g. Mum or Sarah"
        autoCapitalize="words"
        returnKeyType="next"
        error={nameError}
      />

      <View style={{ gap: Spacing.sm }}>
        <Text variant="label">Who are they to you?</Text>
        <ChipRow>
          {RELATIONSHIP_OPTIONS.map((o) => (
            <Chip key={o.value} label={o.label} selected={relationshipType === o.value} onPress={() => setRelationshipType(o.value)} />
          ))}
        </ChipRow>
      </View>

      <View style={{ gap: Spacing.sm }}>
        <DateField label="Birthday (optional)" value={birthday} onChange={setBirthday} placeholder="Add their birthday" />
        {birthday ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md }}>
            <Text muted style={{ flex: 1 }}>
              I know the year they were born
            </Text>
            <Switch value={yearKnown} onValueChange={setYearKnown} trackColor={{ true: t.primary }} accessibilityLabel="I know their birth year" />
          </View>
        ) : null}
        {birthday ? <Button title="Remove birthday" variant="ghost" onPress={() => setBirthday(null)} /> : null}
      </View>

      <Field
        label="Interests (optional)"
        value={interests}
        onChangeText={setInterests}
        placeholder="Hiking, jazz, good coffee"
        hint="Separate with commas. Helps with gift ideas on the web."
      />

      <Field
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Little things worth remembering"
        multiline
        style={{ minHeight: 110, textAlignVertical: 'top' }}
      />

      <Button title={submitLabel} onPress={submit} loading={submitting} />
    </View>
  );
}
