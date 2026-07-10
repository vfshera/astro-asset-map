import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./utils.js";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces rapid calls into a single invocation", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("fires once after the delay when calls stop", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("fires multiple times for calls spaced beyond the delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced();
    vi.advanceTimersByTime(100);

    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("passes arguments to the debounced function", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced("a", 1);
    vi.advanceTimersByTime(50);

    expect(fn).toHaveBeenCalledWith("a", 1);
  });

  it("does not call the function before the delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(199);

    expect(fn).not.toHaveBeenCalled();
  });
});
