import '@testing-library/jest-dom/vitest';

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

// jsdom does not compute layout, so recharts' ResponsiveContainer sees 0x0
// and skips rendering its children. Give elements a non-zero size in tests.
Element.prototype.getBoundingClientRect = () =>
  ({
    width: 500,
    height: 300,
    top: 0,
    left: 0,
    right: 500,
    bottom: 300,
    x: 0,
    y: 0,
    toJSON() {},
  }) as DOMRect;
