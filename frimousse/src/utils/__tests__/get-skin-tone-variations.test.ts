import { describe, expect, it } from 'vitest';
import { getSkinToneVariation, getSkinToneVariations } from '../get-skin-tone-variations.js';

describe('getSkinToneVariation', () => {
  it('should return the specified skin tone variation when supported', () => {
    expect(getSkinToneVariation('👋', 'medium')).toBe('👋🏽');
    expect(getSkinToneVariation('🧑‍🤝‍🧑', 'dark')).toBe('🧑🏿‍🤝‍🧑🏿');
  });

  it('should return the same emoji when unsupported', () => {
    expect(getSkinToneVariation('🚧', 'medium')).toBe('🚧');
    expect(getSkinToneVariation('🇪🇺', 'dark')).toBe('🇪🇺');
  });

  it('should return the base emoji when the skin tone is none', () => {
    expect(getSkinToneVariation('👋', 'none')).toBe('👋');
    expect(getSkinToneVariation('👋🏽', 'none')).toBe('👋');
  });
});

describe('getSkinToneVariations', () => {
  it('should return the skin tone variations of an emoji', () => {
    expect(getSkinToneVariations('👋')).toEqual([
      { skinTone: 'none', emoji: '👋' },
      { skinTone: 'light', emoji: '👋🏻' },
      { skinTone: 'medium-light', emoji: '👋🏼' },
      { skinTone: 'medium', emoji: '👋🏽' },
      { skinTone: 'medium-dark', emoji: '👋🏾' },
      { skinTone: 'dark', emoji: '👋🏿' },
    ]);
    expect(getSkinToneVariations('👋🏽')).toEqual([
      { skinTone: 'none', emoji: '👋' },
      { skinTone: 'light', emoji: '👋🏻' },
      { skinTone: 'medium-light', emoji: '👋🏼' },
      { skinTone: 'medium', emoji: '👋🏽' },
      { skinTone: 'medium-dark', emoji: '👋🏾' },
      { skinTone: 'dark', emoji: '👋🏿' },
    ]);
  });

  it('should return the same emoji when the emoji does not support skin tones', () => {
    expect(getSkinToneVariations('🇪🇺')).toEqual([
      { skinTone: 'none', emoji: '🇪🇺' },
      { skinTone: 'light', emoji: '🇪🇺' },
      { skinTone: 'medium-light', emoji: '🇪🇺' },
      { skinTone: 'medium', emoji: '🇪🇺' },
      { skinTone: 'medium-dark', emoji: '🇪🇺' },
      { skinTone: 'dark', emoji: '🇪🇺' },
    ]);
  });
});
