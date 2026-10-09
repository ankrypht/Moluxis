import { pubChemCircuitBreaker, PubChemThrottledError } from "./circuitBreaker";

interface QueuedTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  signal?: AbortSignal | null;
  cleanup?: () => void;
}

export interface QueuedFetchOptions extends RequestInit {
  skipCircuitBreaker?: boolean;
}

export class RequestQueue {
  private queue: QueuedTask<any>[] = [];
  private activeCount = 0;
  private maxConcurrency = 2;
  private defaultConcurrency = 2;
  private minSpacingMs = process.env.NODE_ENV === "test" ? 0 : 250;
  private defaultSpacingMs = process.env.NODE_ENV === "test" ? 0 : 250;
  private nextAllowedDispatchTime = 0;
  private userAgent =
    "Moluxis/2.0 (React-Native; contact: ankushsarkar128@gmail.com)";

  constructor(maxConcurrency = 2, minSpacingMs?: number) {
    this.maxConcurrency = maxConcurrency;
    this.defaultConcurrency = maxConcurrency;
    if (typeof minSpacingMs === "number") {
      this.minSpacingMs = minSpacingMs;
      this.defaultSpacingMs = minSpacingMs;
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getActiveCount(): number {
    return this.activeCount;
  }

  public getMinSpacingMs(): number {
    return this.minSpacingMs;
  }

  public getMaxConcurrency(): number {
    return this.maxConcurrency;
  }

  public reset(): void {
    this.queue = [];
    this.activeCount = 0;
    this.nextAllowedDispatchTime = 0;
    this.minSpacingMs = this.defaultSpacingMs;
    this.maxConcurrency = this.defaultConcurrency;
  }

  /**
   * Adjusts queue pacing based on PubChem's X-Throttling-Control response header.
   * Dynamically adjusts spacing and concurrency if client approaches quota limits.
   * NOTE: This method ONLY adjusts queue pacing; it NEVER trips the circuit breaker or drains the queue.
   */
  public handleThrottlingHeader(headerValue: string | null): void {
    if (!headerValue) return;

    // Check if the client's quota specifically is nearing or exceeding limits
    const isClientRedOrBlack =
      /Request (?:Count|Time) status:\s*(?:Red|Black)/i.test(headerValue) ||
      headerValue.trim().toLowerCase() === "red" ||
      headerValue.trim().toLowerCase() === "black";

    const isClientYellow =
      /Request (?:Count|Time) status:\s*Yellow/i.test(headerValue) ||
      headerValue.trim().toLowerCase() === "yellow";

    const isServiceHigh = /Service status:\s*(?:Red|Black)/i.test(headerValue);

    if (isClientRedOrBlack) {
      this.minSpacingMs = 1000;
      this.maxConcurrency = 1;
    } else if (isClientYellow) {
      this.minSpacingMs = 500;
      this.maxConcurrency = 1;
    } else if (isServiceHigh) {
      // Overall server load is high on PubChem cluster, but client quota is fine:
      // apply light courtesy spacing without restricting normal operations
      this.minSpacingMs = 350;
      this.maxConcurrency = this.defaultConcurrency;
    } else {
      this.minSpacingMs = this.defaultSpacingMs;
      this.maxConcurrency = this.defaultConcurrency;
    }
  }

  /**
   * Immediately rejects and clears all pending tasks in the queue when the circuit trips.
   */
  public drainQueueOnTrip(): void {
    const cooldownSec =
      Math.ceil(pubChemCircuitBreaker.getRemainingCooldownMs() / 1000) || 30;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      task?.cleanup?.();
      task?.reject(
        new PubChemThrottledError(
          "PubChem is temporarily unavailable. Cooldown active.",
          cooldownSec,
        ),
      );
    }
  }

  /**
   * Enqueues an async operation with rate limiting and concurrency management.
   */
  public enqueue<T>(
    fn: () => Promise<T>,
    signal?: AbortSignal | null,
  ): Promise<T> {
    // Check circuit breaker first
    if (pubChemCircuitBreaker.isOpen()) {
      const cooldownSec =
        Math.ceil(pubChemCircuitBreaker.getRemainingCooldownMs() / 1000) || 30;
      return Promise.reject(
        new PubChemThrottledError(
          "PubChem is temporarily unavailable. Cooldown active.",
          cooldownSec,
        ),
      );
    }

    if (signal?.aborted) {
      const error = new Error("Request aborted");
      error.name = "AbortError";
      return Promise.reject(error);
    }

    return new Promise<T>((resolve, reject) => {
      const task: QueuedTask<T> = { fn, resolve, reject, signal };

      if (signal) {
        const onAbort = () => {
          task.cleanup?.();
          const index = this.queue.indexOf(task);
          if (index !== -1) {
            this.queue.splice(index, 1);
            const err = new Error("Request aborted");
            err.name = "AbortError";
            reject(err);
          }
        };
        task.cleanup = () => {
          signal.removeEventListener("abort", onAbort);
        };
        signal.addEventListener("abort", onAbort, { once: true });
      }

      this.queue.push(task);
      this.processNext();
    });
  }

  private processNext(): void {
    while (this.activeCount < this.maxConcurrency && this.queue.length > 0) {
      if (pubChemCircuitBreaker.isOpen()) {
        this.drainQueueOnTrip();
        return;
      }

      const task = this.queue.shift();
      if (!task) return;

      // Synchronously increment activeCount to reserve concurrency slot immediately
      this.activeCount++;

      this.runTask(task);
    }
  }

  private async runTask<T>(task: QueuedTask<T>): Promise<void> {
    try {
      // Inter-request pacing: monotonically stagger dispatches by minSpacingMs
      if (this.minSpacingMs > 0) {
        const now = Date.now();
        const dispatchTime = Math.max(now, this.nextAllowedDispatchTime);
        this.nextAllowedDispatchTime = dispatchTime + this.minSpacingMs;
        const delay = dispatchTime - now;
        if (delay > 0) {
          await new Promise<void>((resolve, reject) => {
            if (task.signal?.aborted) {
              const err = new Error("Request aborted");
              err.name = "AbortError";
              return reject(err);
            }
            const timer = setTimeout(() => {
              if (task.signal) {
                task.signal.removeEventListener("abort", onDelayAbort);
              }
              resolve();
            }, delay);
            const onDelayAbort = () => {
              clearTimeout(timer);
              if (task.signal) {
                task.signal.removeEventListener("abort", onDelayAbort);
              }
              const err = new Error("Request aborted");
              err.name = "AbortError";
              reject(err);
            };
            task.signal?.addEventListener("abort", onDelayAbort, {
              once: true,
            });
          });
        }
      }

      if (task.signal?.aborted) {
        const error = new Error("Request aborted");
        error.name = "AbortError";
        task.reject(error);
        return;
      }

      const result = await task.fn();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      task.cleanup?.();
      this.activeCount--;
      this.processNext();
    }
  }

  /**
   * Wrapped fetch that routes through the rate-limiting queue, attaches
   * compliant headers, and parses PubChem throttling response headers.
   */
  public async fetch(
    url: string,
    init?: QueuedFetchOptions,
  ): Promise<Response> {
    return this.enqueue(async () => {
      const skipBreaker = init?.skipCircuitBreaker === true;

      const headers = new Headers(init?.headers || {});
      if (!headers.has("User-Agent")) {
        try {
          headers.set("User-Agent", this.userAgent);
        } catch {
          // Ignore in environments where setting User-Agent is disallowed
        }
      }
      if (!headers.has("Accept")) {
        headers.set("Accept", "application/json, text/plain, */*");
      }

      const response = await fetch(url, {
        ...init,
        headers,
      });

      // Parse PubChem throttling header
      const throttlingHeader = response.headers?.get("X-Throttling-Control");
      this.handleThrottlingHeader(throttlingHeader);

      if (!skipBreaker) {
        if (response.status === 503 || response.status === 429) {
          pubChemCircuitBreaker.recordFailure(
            response.status,
            throttlingHeader || undefined,
          );
          if (pubChemCircuitBreaker.isOpen()) {
            this.drainQueueOnTrip();
            const cooldownSec =
              Math.ceil(
                pubChemCircuitBreaker.getRemainingCooldownMs() / 1000,
              ) || 15;
            throw new PubChemThrottledError(
              `PubChem service returned HTTP ${response.status}.`,
              cooldownSec,
            );
          }
        } else if (response.ok) {
          pubChemCircuitBreaker.recordSuccess();
        }
      }

      return response;
    }, init?.signal);
  }
}

// Global singleton instance
export const pubChemRequestQueue = new RequestQueue();

/**
 * Global rate-limited fetch replacement for PubChem API calls.
 */
export const queuedFetch = (
  url: string,
  init?: QueuedFetchOptions,
): Promise<Response> => {
  return pubChemRequestQueue.fetch(url, init);
};
