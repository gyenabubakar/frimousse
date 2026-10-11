import { describe, expect, it } from 'vitest';
import * as $ from '../validate.js';

describe('validators', () => {
  describe('string', () => {
    const validator = $.string;

    it('should return valid values', () => {
      expect(validator('hello')).toBe('hello');
    });

    it('should throw with invalid values', () => {
      expect(() => validator(123)).toThrow();
      expect(() => validator(true)).toThrow();
      expect(() => validator(null)).toThrow();
      expect(() => validator(undefined)).toThrow();
    });
  });

  describe('number', () => {
    const validator = $.number;

    it('should return valid values', () => {
      expect(validator(123)).toBe(123);
    });

    it('should throw with invalid values', () => {
      expect(() => validator('hello')).toThrow();
      expect(() => validator(true)).toThrow();
      expect(() => validator(null)).toThrow();
      expect(() => validator(undefined)).toThrow();
    });
  });

  describe('boolean', () => {
    const validator = $.boolean;

    it('should return valid values', () => {
      expect(validator(true)).toBe(true);
    });

    it('should throw with invalid values', () => {
      expect(() => validator('hello')).toThrow();
      expect(() => validator(123)).toThrow();
      expect(() => validator(null)).toThrow();
      expect(() => validator(undefined)).toThrow();
    });
  });

  describe('optional', () => {
    const validator = $.optional($.string);

    it('should return valid values', () => {
      expect(validator('hello')).toBe('hello');
      expect(validator(undefined)).toBeUndefined();
    });

    it('should throw with invalid values', () => {
      expect(() => validator(123)).toThrow();
      expect(() => validator(true)).toThrow();
      expect(() => validator(null)).toThrow();
    });
  });

  describe('nullable', () => {
    const validator = $.nullable($.string);

    it('should return valid values', () => {
      expect(validator('hello')).toBe('hello');
      expect(validator(null)).toBeNull();
    });

    it('should throw with invalid values', () => {
      expect(() => validator(123)).toThrow();
      expect(() => validator(true)).toThrow();
      expect(() => validator(undefined)).toThrow();
    });
  });

  describe('object', () => {
    const validator = $.object({
      emoji: $.string,
      version: $.number,
      countryFlag: $.optional($.boolean),
    });

    it('should return valid values', () => {
      expect(validator({ emoji: '👋', version: 1 })).toEqual({
        emoji: '👋',
        version: 1,
      });
      expect(validator({ emoji: '🇪🇺', version: 1, countryFlag: true })).toEqual({
        emoji: '🇪🇺',
        version: 1,
        countryFlag: true,
      });
    });

    it('should throw with invalid values', () => {
      expect(() => validator(null)).toThrow();
      expect(() => validator(123)).toThrow();
      expect(() => validator({})).toThrow();
      expect(() => validator({ emoji: '👋' })).toThrow();
      expect(() => validator({ emoji: '👋', version: '1' })).toThrow();
      expect(() => validator({ emoji: '👋', countryFlag: true })).toThrow();
    });
  });

  describe('naiveArray', () => {
    const validator = $.naiveArray($.string);

    it('should return valid values', () => {
      expect(validator([])).toEqual([]);
      expect(validator(['hello'])).toEqual(['hello']);
      expect(validator(['hello', 'world'])).toEqual(['hello', 'world']);

      // Only the array's first item is validated with naiveArray
      expect(validator(['hello', 123])).toEqual(['hello', 123]);
    });

    it('should throw with invalid values', () => {
      expect(() => validator('hello')).toThrow();
      expect(() => validator([123])).toThrow();
    });
  });
});
