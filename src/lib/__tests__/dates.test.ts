/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildAutoDates } from '../autoDates';
import { EVENT_TYPE_META, getDaysUntil, toDateOnly, upcomingAge } from '../dates';
import { getPersonDisplayName, resolveAvatarUri } from '../people';

const shift = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

describe('dates', () => {
  it('counts days to the next yearly occurrence', () => {
    assert.equal(getDaysUntil(`1990-${toDateOnly(new Date()).slice(5)}`, 'recurring_annual'), 0);
    assert.equal(getDaysUntil(`1985-${toDateOnly(shift(1)).slice(5)}`, 'recurring_annual'), 1);
    assert.ok(getDaysUntil(`1985-${toDateOnly(shift(-1)).slice(5)}`, 'recurring_annual') >= 364);
    assert.equal(getDaysUntil(toDateOnly(shift(-1)), 'exact_date'), -1);
  });

  it('treats a current-year birthday as unknown birth year', () => {
    assert.equal(upcomingAge(`${new Date().getFullYear()}-06-01`), null);
    assert.ok((upcomingAge('1990-06-01') ?? 0) >= 36);
  });

  it('puts holidays on the right Sunday', () => {
    const mothers = new Date(EVENT_TYPE_META.mothers_day.getDefaultDate()!);
    const fathers = new Date(EVENT_TYPE_META.fathers_day.getDefaultDate()!);
    assert.equal(mothers.getUTCDay(), 0);
    assert.equal(fathers.getUTCDay(), 0);
  });
});

describe('autoDates (mirrors the web wizard)', () => {
  it('adds birthday, Mother’s Day and Christmas for "Mum"', () => {
    const labels = buildAutoDates({ firstName: 'Mum', relationshipType: 'parent', birthday: '1960-03-02' }).map((d) => d.label);
    assert.deepEqual(labels, ['Birthday', "Mother's Day", 'Christmas']);
  });
  it('adds nothing for a friend without a birthday', () => {
    assert.deepEqual(buildAutoDates({ firstName: 'Sam', relationshipType: 'friend' }), []);
  });
});

describe('people', () => {
  it('prefers nickname and resolves stored avatars', () => {
    assert.equal(getPersonDisplayName({ first_name: 'Sarah', nickname: ' ' }), 'Sarah');
    assert.equal(resolveAvatarUri('custom:https://x.test/a.png'), 'https://x.test/a.png');
    assert.match(resolveAvatarUri('lorelei-Amelia') ?? '', /lorelei-neutral\/png\?seed=Amelia/);
    assert.equal(resolveAvatarUri('coral'), null);
  });
});
