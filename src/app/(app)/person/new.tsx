import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useCreatePerson, type Person } from '@/features/data';
import { PersonForm } from '@/features/person-form';
import { Button, Card, Screen, Text } from '@/ui';

export default function NewPersonScreen() {
  const router = useRouter();
  const create = useCreatePerson();
  const [created, setCreated] = useState<{ person: Person; addedDates: string[] } | null>(null);
  const [formKey, setFormKey] = useState(0);

  if (created) {
    const { person, addedDates } = created;
    return (
      <Screen>
        <Card style={{ gap: Spacing.md, paddingVertical: Spacing.xl }}>
          <Text variant="title">{person.first_name} is in your garden.</Text>
          {addedDates.length > 0 ? (
            <Text muted>
              Key dates added: {addedDates.join(', ')}. You&apos;ll get a nudge before each one.
            </Text>
          ) : (
            <Text muted>Add a birthday or another key date so Flakey can remind you.</Text>
          )}
        </Card>
        <View style={{ gap: Spacing.sm }}>
          <Button
            title={`View ${person.first_name}`}
            onPress={() => router.replace({ pathname: '/person/[id]', params: { id: person.id } })}
          />
          <Button
            title="Add someone else"
            variant="secondary"
            onPress={() => {
              setCreated(null);
              setFormKey((k) => k + 1);
            }}
          />
          <Button title="Done" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PersonForm
        key={formKey}
        submitLabel="Add to my circle"
        submitting={create.isPending}
        onSubmit={(values) =>
          create.mutate(values, {
            onSuccess: setCreated,
            onError: (e) => Alert.alert("Couldn't add them", e instanceof Error ? e.message : 'Please try again.'),
          })
        }
      />
    </Screen>
  );
}
