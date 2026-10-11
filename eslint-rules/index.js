import {
  maxConsecutiveStatements,
  paddingBeforeFinalReturn,
  switchCasePadding,
} from './readable-spacing.js';
import { runeOrder } from './rune-order.js';

export const localRules = {
  rules: {
    'rune-order': runeOrder,
    'max-consecutive-statements': maxConsecutiveStatements,
    'switch-case-padding': switchCasePadding,
    'padding-before-final-return': paddingBeforeFinalReturn,
  },
};
