import { CircuitBreaker } from "../circuitBreaker";

describe("CircuitBreaker", () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker(1000, 2); // 1s cooldown, trip after 2 failures
  });

  it("should initialize in CLOSED state", () => {
    expect(breaker.getState()).toBe("CLOSED");
    expect(breaker.isOpen()).toBe(false);
    expect(breaker.getRemainingCooldownMs()).toBe(0);
  });

  it("should stay CLOSED on a single 503 failure when threshold is 2", () => {
    breaker.recordFailure(503);
    expect(breaker.isOpen()).toBe(false);
    expect(breaker.getState()).toBe("CLOSED");
  });

  it("should trip on the first 503 failure by default", () => {
    const defaultBreaker = new CircuitBreaker();
    defaultBreaker.recordFailure(503);
    expect(defaultBreaker.isOpen()).toBe(true);
    expect(defaultBreaker.getState()).toBe("OPEN");
  });

  it("should trip to OPEN on 2 consecutive 503 failures", () => {
    breaker.recordFailure(503);
    breaker.recordFailure(503);
    expect(breaker.isOpen()).toBe(true);
    expect(breaker.getState()).toBe("OPEN");
    expect(breaker.getRemainingCooldownMs()).toBeGreaterThan(0);
  });

  it("should reset error count on success", () => {
    breaker.recordFailure(503);
    breaker.recordSuccess();
    breaker.recordFailure(503);
    expect(breaker.isOpen()).toBe(false);
  });

  it("should trip immediately if Black throttling header is present for client", () => {
    breaker.recordFailure(200, "Request Count status: Black (100%)");
    expect(breaker.isOpen()).toBe(true);
  });

  it("should trip immediately if Request Time status is Black", () => {
    breaker.recordFailure(200, "Request Time status: Black (100%)");
    expect(breaker.isOpen()).toBe(true);
  });

  it("should NOT trip when only Service status is Black and client quota is Green", () => {
    breaker.recordFailure(
      200,
      "Request Count status: Green (0%), Request Time status: Green (0%), Service status: Black (107%)",
    );
    expect(breaker.isOpen()).toBe(false);
    expect(breaker.getState()).toBe("CLOSED");
  });

  it("should transition to HALF_OPEN after cooldown expires", async () => {
    breaker.trip(50); // 50ms cooldown
    expect(breaker.isOpen()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(breaker.isOpen()).toBe(false);
    expect(breaker.getState()).toBe("HALF_OPEN");
  });

  it("should re-trip immediately if failure occurs during HALF_OPEN", async () => {
    breaker.trip(50);
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(breaker.getState()).toBe("HALF_OPEN");
    breaker.recordFailure(503);
    expect(breaker.isOpen()).toBe(true);
    expect(breaker.getState()).toBe("OPEN");
  });

  it("should close circuit if success occurs during HALF_OPEN", async () => {
    breaker.trip(50);
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(breaker.getState()).toBe("HALF_OPEN");
    breaker.recordSuccess();
    expect(breaker.isOpen()).toBe(false);
    expect(breaker.getState()).toBe("CLOSED");
  });
});
