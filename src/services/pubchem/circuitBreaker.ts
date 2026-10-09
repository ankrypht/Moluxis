/**
 * Custom error thrown when requests to PubChem are blocked by the circuit breaker
 * during a cooldown period to protect the client's IP from being throttled.
 */
export class PubChemThrottledError extends Error {
  public readonly retryAfterSeconds: number;

  constructor(
    message = "PubChem is temporarily unavailable due to high server load.",
    retryAfterSeconds = 30,
  ) {
    super(message);
    this.name = "PubChemThrottledError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitBreaker {
  private state: CircuitBreakerState = "CLOSED";
  private openUntil = 0;
  private cooldownDurationMs = 30_000; // 30 seconds default cooldown
  private consecutiveErrors = 0;
  private maxConsecutiveErrors = 1; // Trip on first 503/429 error by default

  constructor(cooldownDurationMs = 30_000, maxConsecutiveErrors = 1) {
    this.cooldownDurationMs = cooldownDurationMs;
    this.maxConsecutiveErrors = maxConsecutiveErrors;
  }

  /**
   * Checks whether the circuit breaker is currently open (in cooldown).
   * Automatically transitions from OPEN to HALF_OPEN when cooldown expires.
   */
  public isOpen(): boolean {
    if (this.state === "OPEN") {
      if (Date.now() >= this.openUntil) {
        this.state = "HALF_OPEN";
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Returns remaining cooldown in milliseconds (0 if closed or half-open).
   */
  public getRemainingCooldownMs(): number {
    if (this.state === "OPEN") {
      const remaining = this.openUntil - Date.now();
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  }

  /**
   * Returns the current state of the circuit breaker.
   */
  public getState(): CircuitBreakerState {
    this.isOpen(); // Refresh state if timer elapsed
    return this.state;
  }

  /**
   * Manually trips the circuit breaker into OPEN state for a specified duration.
   */
  public trip(customCooldownMs?: number): void {
    const duration = customCooldownMs ?? this.cooldownDurationMs;
    this.state = "OPEN";
    this.openUntil = Date.now() + duration;
    this.consecutiveErrors = 0;
  }

  /**
   * Records a successful response. Resets errors and closes circuit.
   */
  public recordSuccess(): void {
    this.consecutiveErrors = 0;
    this.state = "CLOSED";
  }

  /**
   * Records an HTTP response status code or error.
   * If status is 503 or 429, counts consecutive errors and trips circuit if threshold met.
   */
  public recordFailure(status?: number, throttlingControl?: string): void {
    // Only trip if PubChem explicitly indicated that the CLIENT's request count or time is blocked.
    // Do NOT trip on "Service status: Black" which is just PubChem's cluster load metric.
    if (throttlingControl) {
      const isClientBlocked =
        /Request (?:Count|Time) status:\s*Black/i.test(throttlingControl) ||
        throttlingControl.trim().toLowerCase() === "black";
      if (isClientBlocked) {
        this.trip();
        return;
      }
    }

    if (status === 503 || status === 429) {
      this.consecutiveErrors++;
      if (
        this.consecutiveErrors >= this.maxConsecutiveErrors ||
        this.state === "HALF_OPEN"
      ) {
        this.trip();
      }
    }
  }

  /**
   * Resets the circuit breaker to closed state.
   */
  public reset(): void {
    this.state = "CLOSED";
    this.openUntil = 0;
    this.consecutiveErrors = 0;
  }
}

// Global singleton instance for the PubChem API
export const pubChemCircuitBreaker = new CircuitBreaker();
