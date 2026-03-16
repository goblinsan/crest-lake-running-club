import { greet } from '../index';

describe('greet', () => {
  it('returns a welcome message with the given name', () => {
    expect(greet('Alice')).toBe('Welcome to Crest Lake Running Club, Alice!');
  });
});
