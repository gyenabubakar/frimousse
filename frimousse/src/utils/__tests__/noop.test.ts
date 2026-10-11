import { describe, expect, it } from 'vitest';
import { noop, noopAsync } from '../noop.js';

describe('noop', () => {
  it('does nothing and returns undefined', () => {
    expect(noop()).toBeUndefined();
    expect(noop(1, 2, 3)).toBeUndefined();
    expect(noop(null, undefined, 'hello')).toBeUndefined();
  });
});

describe('noopAsync', () => {
  it('does nothing and returns a resolved promise', async () => {
    await expect(noopAsync()).resolves.toBeUndefined();
    await expect(noopAsync(1, 2, 3)).resolves.toBeUndefined();
    await expect(noopAsync(null, undefined, 'hello')).resolves.toBeUndefined();
  });
});
