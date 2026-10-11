import { describe, expect, it } from 'vitest';
import { getStorage, setStorage } from '../storage.js';

describe('setStorage', () => {
  it('should store value as JSON', () => {
    const key = 'key';
    const value = { value: 123 };

    setStorage(localStorage, key, value);
    expect(localStorage.getItem('key')).toEqual(JSON.stringify(value));
  });
});

describe('getStorage', () => {
  it('should return parsed value', () => {
    const key = 'key';
    const value = { value: 123 };

    setStorage(localStorage, key, value);
    expect(getStorage(localStorage, key, (value) => value)).toEqual(value);
  });

  it('should return null if value is invalid', () => {
    setStorage(localStorage, 'key', 123);
    expect(
      getStorage(localStorage, 'key', (value) => {
        if (typeof value !== 'string') {
          throw new Error('Expected a string.');
        }

        return value;
      }),
    ).toBeNull();
  });

  it('should return null if key is missing', () => {
    expect(getStorage(localStorage, 'missing', (value) => value)).toBeNull();
  });
});
