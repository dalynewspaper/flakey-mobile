/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toDateOnly } from '../dates';
import { planReminders, reminderTitle, REMINDER_HOUR, type ReminderEvent } from '../reminderPlan';

const at = (y: number, m: number, d: number, h = 8) => new Date(y, m - 1, d, h, 0, 0);
const event = (over: Partial<ReminderEvent> = {}): ReminderEvent => ({
  id: 'e1',
  title: "Sam's Birthday",
  date_value: '1990-03-20',
  date_type: 'recurring_annual',
  personName: 'Sam',
  ...over,
});

describe('planReminders', () => {
  it('plans 30, 10, 3, 1 and 0 days before at 9am local', () => {
    const plan = planReminders([event()], at(2026, 1, 1)).filter((p) => p.fireAt.getFullYear() === 2026);
    assert.deepEqual(
      plan.map((p) => [toDateOnly(p.fireAt), p.fireAt.getHours(), p.daysBefore]),
      [
        ['2026-02-18', REMINDER_HOUR, 30],
        ['2026-03-10', REMINDER_HOUR, 10],
        ['2026-03-17', REMINDER_HOUR, 3],
        ['2026-03-19', REMINDER_HOUR, 1],
        ['2026-03-20', REMINDER_HOUR, 0],
      ],
    );
  });

  it('skips reminders already in the past and fires the same day before 9am', () => {
    const plan = planReminders([event()], at(2026, 3, 19, 8)).filter((p) => p.fireAt.getFullYear() === 2026);
    assert.deepEqual(plan.map((p) => p.daysBefore), [1, 0]);
  });

  it('rolls yearly dates into next year once this year has passed', () => {
    const plan = planReminders([event()], at(2026, 3, 21));
    assert.ok(plan.length > 0);
    assert.ok(plan.every((p) => p.fireAt.getFullYear() >= 2027));
    assert.equal(toDateOnly(plan[0].fireAt), '2027-02-18');
  });

  it('plans one-off dates once and never for past ones', () => {
    assert.equal(planReminders([event({ date_type: 'exact_date', date_value: '2026-06-01' })], at(2026, 1, 1)).length, 5);
    assert.equal(planReminders([event({ date_type: 'exact_date', date_value: '2025-06-01' })], at(2026, 1, 1)).length, 0);
  });

  it('ignores undated events, sorts soonest first and respects the cap', () => {
    const events = Array.from({ length: 30 }, (_, i) => event({ id: `e${i}`, date_value: `2000-${String((i % 12) + 1).padStart(2, '0')}-15` }));
    events.push(event({ id: 'none', date_value: null }));
    const plan = planReminders(events, at(2026, 1, 1), 60);
    assert.equal(plan.length, 60);
    for (let i = 1; i < plan.length; i++) assert.ok(plan[i - 1].fireAt <= plan[i].fireAt);
    assert.ok(!plan.some((p) => p.eventId === 'none'));
    assert.equal(new Set(plan.map((p) => p.id)).size, plan.length, 'ids are unique');
  });
});

describe('reminderTitle', () => {
  it('matches the server wording and avoids repeating the name', () => {
    assert.equal(reminderTitle(0, "Sam's Birthday", 'Sam'), "🎉 Today: Sam's Birthday");
    assert.equal(reminderTitle(1, 'Anniversary', 'Alex'), '⏰ Tomorrow: Anniversary for Alex');
    assert.equal(reminderTitle(10, 'Christmas', null), 'Christmas is in 10 days');
  });
});
