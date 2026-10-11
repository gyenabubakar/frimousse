import { describe, expect, it } from 'vitest';
import { chunk } from '../chunk.js';

describe('chunk', () => {
  it('should split an array into chunks of the specified size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    expect(chunk([1, 2], 3)).toEqual([[1, 2]]);
    expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });

  it('should handle empty arrays', () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it('should handle invalid chunk sizes', () => {
    expect(chunk([1, 2, 3], 0)).toEqual([]);
    expect(chunk([1, 2, 3], -1)).toEqual([]);
  });
});
