import { describe, expect, it } from 'vitest';
import { capitalize } from '../capitalize.js';

describe('capitalize', () => {
  it('should capitalize the first letter of a word', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('World')).toBe('World');
    expect(capitalize('typeScript')).toBe('TypeScript');
  });

  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle non-alphabetic characters', () => {
    expect(capitalize('!hello')).toBe('!hello');
    expect(capitalize('123abc')).toBe('123abc');
  });
});
