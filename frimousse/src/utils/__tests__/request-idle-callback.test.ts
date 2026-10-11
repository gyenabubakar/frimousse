import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestIdleCallback } from '../request-idle-callback.js';

describe('requestIdleCallback', () => {
  const originalRequestIdleCallback = window.requestIdleCallback;
  const originalCancelIdleCallback = window.cancelIdleCallback;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.requestIdleCallback = originalRequestIdleCallback;
    window.cancelIdleCallback = originalCancelIdleCallback;
  });

  it('should use native requestIdleCallback when available', () => {
    const mockRequestIdleCallback = vi.fn();
    const mockCancelIdleCallback = vi.fn();

    window.requestIdleCallback = mockRequestIdleCallback;
    window.cancelIdleCallback = mockCancelIdleCallback;

    const callback = vi.fn();
    const options = { timeout: 100 };
    const cancel = requestIdleCallback(callback, options);

    expect(mockRequestIdleCallback).toHaveBeenCalledWith(callback, options);
    expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);

    cancel();
    expect(mockCancelIdleCallback).toHaveBeenCalled();
  });

  it('should use setTimeout fallback when native requestIdleCallback is not available', () => {
    // @ts-expect-error
    window.requestIdleCallback = undefined;
    // @ts-expect-error
    window.cancelIdleCallback = undefined;

    const callback = vi.fn();
    const options = { timeout: 100 };

    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    const cancel = requestIdleCallback(callback, options);

    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy.mock.calls[0]?.[1]).toBe(10);

    vi.advanceTimersByTime(10);

    expect(callback).toHaveBeenCalledTimes(1);

    const deadline = callback.mock.calls[0]?.[0];
    expect(deadline.didTimeout).toBe(false);
    expect(typeof deadline.timeRemaining).toBe('function');

    const timeRemaining = deadline.timeRemaining();
    expect(typeof timeRemaining).toBe('number');
    expect(timeRemaining).toBeLessThanOrEqual(100);

    cancel();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should use default timeout with setTimeout fallback', () => {
    // @ts-expect-error
    window.requestIdleCallback = undefined;
    // @ts-expect-error
    window.cancelIdleCallback = undefined;

    const callback = vi.fn();

    requestIdleCallback(callback);

    vi.advanceTimersByTime(10);

    expect(callback).toHaveBeenCalledTimes(1);

    const deadline = callback.mock.calls[0]?.[0];
    const timeRemaining = deadline.timeRemaining();
    expect(timeRemaining).toBeLessThanOrEqual(50);
  });
});
