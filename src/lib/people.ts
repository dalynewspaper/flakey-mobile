import type { Database } from './database.types';

export type RelationshipType = Database['public']['Enums']['relationship_type'];

export interface PersonNameFields {
  first_name?: string | null;
  last_name?: string | null;
  nickname?: string | null;
}

/** Same display rules as the web app: nickname, then first name, then last name. */
export function getPersonDisplayName(person: PersonNameFields | null | undefined, fallback = 'Someone'): string {
  if (!person) return fallback;
  return person.nickname?.trim() || person.first_name?.trim() || person.last_name?.trim() || fallback;
}

export function getPersonFullName(person: PersonNameFields | null | undefined, fallback = 'Someone'): string {
  if (!person) return fallback;
  const full = [person.first_name?.trim(), person.last_name?.trim()].filter(Boolean).join(' ');
  return full || getPersonDisplayName(person, fallback);
}

export function getPersonInitial(person: PersonNameFields | null | undefined): string {
  return getPersonDisplayName(person, '?').charAt(0).toUpperCase();
}

export const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'partner', label: 'Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'other', label: 'Other' },
];

export function relationshipLabel(type: RelationshipType): string {
  return RELATIONSHIP_OPTIONS.find((o) => o.value === type)?.label ?? 'Other';
}

/**
 * The web app stores either an uploaded image URL or a preset avatar id in
 * people.avatar_url. Preset ids are DiceBear "<prefix>-<seed>" values or one of
 * the illustrated "fun" ids. Returns an image URL, or null to show initials.
 */
const DICEBEAR_STYLES: Record<string, string> = {
  lorelei: 'lorelei-neutral',
  notion: 'notionists',
  adv: 'adventurer-neutral',
  persona: 'personas',
  emoji: 'fun-emoji',
  shape: 'shapes',
  bot: 'bottts',
};
const SOFT_BG = 'f4e4d4,ead7c0,d4c4e4,c4e4d4,e4d4c4,f0e0d0,d0e4e4,e4c4d4';

export function resolveAvatarUri(avatar: string | null | undefined): string | null {
  if (!avatar) return null;
  // Photos uploaded in the web wizard are stored as "custom:<url>".
  if (avatar.startsWith('custom:')) avatar = avatar.slice('custom:'.length);
  if (/^https?:\/\//.test(avatar)) return avatar;
  const dash = avatar.indexOf('-');
  if (dash > 0) {
    const style = DICEBEAR_STYLES[avatar.slice(0, dash)];
    const seed = avatar.slice(dash + 1);
    if (style && seed) {
      return `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(seed)}&backgroundColor=${SOFT_BG}&radius=50&size=128`;
    }
  }
  // Illustrated "fun" avatars live in the web bundle only; fall back to initials.
  return null;
}
