import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useDeletePerson, usePerson, useUpdatePerson } from '@/features/data';
import { PersonForm } from '@/features/person-form';
import { getPersonDisplayName } from '@/lib/people';
import { Button, ErrorNotice, Loading, Screen } from '@/ui';

export default function EditPersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const person = usePerson(id);
  const update = useUpdatePerson();
  const remove = useDeletePerson();

  if (person.isPending) return <Loading />;
  if (person.isError || !person.data) {
    return (
      <Screen>
        <ErrorNotice error={person.error ?? new Error('This person no longer exists.')} />
      </Screen>
    );
  }

  const p = person.data;
  const name = getPersonDisplayName(p);

  const confirmDelete = () =>
    Alert.alert(`Remove ${name}?`, 'Their key dates and notes will be deleted too. This also removes them on the web.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          remove.mutate(p.id, {
            onSuccess: () => router.dismissTo('/people'),
            onError: (e) => Alert.alert("Couldn't remove them", e instanceof Error ? e.message : ''),
          }),
      },
    ]);

  return (
    <Screen>
      <PersonForm
        initial={{
          firstName: p.first_name,
          relationshipType: p.relationship_type,
          birthday: p.birthday,
          notes: p.notes,
          interests: p.interests,
        }}
        submitLabel="Save changes"
        submitting={update.isPending}
        onSubmit={(values) =>
          update.mutate(
            { id: p.id, ...values },
            {
              onSuccess: () => router.back(),
              onError: (e) => Alert.alert("Couldn't save", e instanceof Error ? e.message : 'Please try again.'),
            },
          )
        }
      />
      <Button title={`Remove ${name}`} variant="danger" onPress={confirmDelete} loading={remove.isPending} />
    </Screen>
  );
}
