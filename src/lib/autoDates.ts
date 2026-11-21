import type { EventType } from './dates';
import type { RelationshipType } from './people';

/**
 * Port of the web app's useAutoSuggestions: the key dates created automatically
 * when a person is added. Keep in sync with src/hooks/useAutoSuggestions.ts.
 */

export interface AutoDate {
  title: string;
  eventType: EventType;
  dateValue: string;
  importance: number;
  label: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

function nthSunday(year: number, month: number, n: number): string {
  const first = new Date(year, month, 1).getDay();
  const day = 1 + ((7 - first) % 7) + (n - 1) * 7;
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

const MOTHER = ['mom', 'mum', 'mommy', 'mummy', 'mother', 'ma', 'mama', 'mamá', 'maman', 'mutter', 'mãe'];
const FATHER = ['dad', 'daddy', 'father', 'pa', 'papa', 'papá', 'père', 'vater', 'pai', 'pops'];

/** Only infer from an unambiguous name like "Mum" or "Dad"; otherwise skip. */
function inferParentKind(name: string): 'mother' | 'father' | null {
  const n = name.trim().toLowerCase();
  if (MOTHER.includes(n)) return 'mother';
  if (FATHER.includes(n)) return 'father';
  return null;
}

export function buildAutoDates(person: {
  firstName: string;
  relationshipType: RelationshipType;
  birthday?: string | null;
}): AutoDate[] {
  const year = new Date().getFullYear();
  const name = person.firstName;
  const dates: AutoDate[] = [];

  if (person.birthday) {
    dates.push({
      title: `${name}'s Birthday`,
      eventType: 'birthday',
      dateValue: person.birthday,
      importance: 5,
      label: 'Birthday',
    });
  }

  switch (person.relationshipType) {
    case 'parent': {
      const kind = inferParentKind(name);
      if (kind === 'mother') {
        dates.push({
          title: `Mother's Day for ${name}`,
          eventType: 'mothers_day',
          dateValue: nthSunday(year, 4, 2),
          importance: 4,
          label: "Mother's Day",
        });
      } else if (kind === 'father') {
        dates.push({
          title: `Father's Day for ${name}`,
          eventType: 'fathers_day',
          dateValue: nthSunday(year, 5, 3),
          importance: 4,
          label: "Father's Day",
        });
      }
      break;
    }
    case 'partner':
      dates.push({
        title: "Valentine's Day",
        eventType: 'valentines',
        dateValue: `${year}-02-14`,
        importance: 4,
        label: "Valentine's Day",
      });
      break;
    case 'sibling':
      dates.push({
        title: `Sibling Day with ${name}`,
        eventType: 'custom',
        dateValue: `${year}-04-10`,
        importance: 2,
        label: 'Sibling Day',
      });
      break;
    default:
      break;
  }

  if (['parent', 'partner', 'child', 'sibling'].includes(person.relationshipType)) {
    dates.push({
      title: `Christmas with ${name}`,
      eventType: 'christmas',
      dateValue: `${year}-12-25`,
      importance: 3,
      label: 'Christmas',
    });
  }

  return dates;
}
