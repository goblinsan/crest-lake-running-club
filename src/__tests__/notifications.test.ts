import { buildReminderEmail } from '../lib/notifications';

describe('Notification helpers', () => {
  it('builds a reminder email with correct subject', () => {
    const email = buildReminderEmail('Alice', 'Saturday Long Run', new Date('2026-06-07T07:00:00Z'), 'Crest Lake Park');
    expect(email.subject).toContain('Saturday Long Run');
    expect(email.subject).toContain('Reminder');
  });

  it('includes recipient name in the email body', () => {
    const email = buildReminderEmail('Bob', 'Tuesday Short Run', new Date('2026-06-03T06:00:00Z'), null);
    expect(email.body).toContain('Bob');
  });

  it('includes event title in the email body', () => {
    const email = buildReminderEmail('Carol', 'Special 5K', new Date('2026-07-04T08:00:00Z'), 'Clearwater Beach');
    expect(email.body).toContain('Special 5K');
  });

  it('includes location in the body when provided', () => {
    const email = buildReminderEmail('Dave', 'Morning Run', new Date('2026-06-10T06:00:00Z'), 'Crest Lake Park');
    expect(email.body).toContain('Crest Lake Park');
  });

  it('omits location line when location is null', () => {
    const email = buildReminderEmail('Eve', 'Morning Run', new Date('2026-06-10T06:00:00Z'), null);
    expect(email.body).not.toContain('📍');
  });

  it('sets empty to field (caller fills it in)', () => {
    const email = buildReminderEmail('Frank', 'Fun Run', new Date('2026-06-15T07:00:00Z'), null);
    expect(email.to).toBe('');
  });
});
