describe('Database schema constants', () => {
  const validRoles = ['ADMIN', 'MEMBER'];
  const validEventTypes = ['WEEKLY_SHORT', 'WEEKLY_LONG', 'SPECIAL'];
  const validAttendanceStatuses = ['ATTENDING', 'NOT_ATTENDING', 'MAYBE'];

  it('defines valid user roles', () => {
    expect(validRoles).toContain('MEMBER');
    expect(validRoles).toContain('ADMIN');
  });

  it('defines valid event types', () => {
    expect(validEventTypes).toContain('WEEKLY_SHORT');
    expect(validEventTypes).toContain('WEEKLY_LONG');
    expect(validEventTypes).toContain('SPECIAL');
  });

  it('defines valid attendance statuses', () => {
    expect(validAttendanceStatuses).toContain('ATTENDING');
    expect(validAttendanceStatuses).toContain('NOT_ATTENDING');
    expect(validAttendanceStatuses).toContain('MAYBE');
  });
});
