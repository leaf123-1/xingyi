import "@testing-library/jest-dom/vitest";

// 这里可以注册全局 polyfill 或 mock，保障组件在测试环境下行为一致。
class ResizeObserverMock {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}
}

// @ts-expect-error Vitest 环境缺省 ResizeObserver，需要手动补齐。
global.ResizeObserver = ResizeObserverMock;
