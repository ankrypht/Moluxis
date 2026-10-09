import { RequestQueue } from "../requestQueue";
import { pubChemCircuitBreaker } from "../circuitBreaker";

describe("RequestQueue", () => {
  let queue: RequestQueue;
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    queue = new RequestQueue(2, 50); // 2 concurrent, 50ms pacing for fast tests
    pubChemCircuitBreaker.reset();
    mockFetch.mockReset();
    global.fetch = mockFetch as any;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("should enforce max concurrency of 2", async () => {
    let runningCount = 0;
    let maxObserved = 0;

    const task = async () => {
      runningCount++;
      maxObserved = Math.max(maxObserved, runningCount);
      await new Promise((r) => setTimeout(r, 60));
      runningCount--;
      return true;
    };

    await Promise.all([
      queue.enqueue(task),
      queue.enqueue(task),
      queue.enqueue(task),
      queue.enqueue(task),
    ]);

    expect(maxObserved).toBeLessThanOrEqual(2);
  });

  it("should reject early if signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      queue.enqueue(async () => "ok", controller.signal),
    ).rejects.toThrow();
  });

  it("should reject queued tasks when aborted while pending", async () => {
    const controller = new AbortController();
    const slowTask = () => new Promise((r) => setTimeout(r, 100));

    // Fill up the 2 concurrency slots
    const p1 = queue.enqueue(slowTask);
    const p2 = queue.enqueue(slowTask);

    // This third task will be stuck in queue
    const p3 = queue.enqueue(async () => "third", controller.signal);

    controller.abort();

    await expect(p3).rejects.toThrow();
    await Promise.all([p1, p2]);
  });

  it("should attach compliant headers in queuedFetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
    });

    await queue.fetch("https://example.com");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );

    const callArgs = mockFetch.mock.calls[0];
    const headers: Headers = callArgs[1].headers;
    expect(headers.get("User-Agent")).toContain("Moluxis/2.0");
    expect(headers.get("Accept")).toContain("application/json");
  });

  it("should slow down when X-Throttling-Control indicates Red or Yellow", async () => {
    queue.handleThrottlingHeader("Request Count status: Yellow (60%)");
    expect(queue.getMinSpacingMs()).toBe(500);
    expect(queue.getMaxConcurrency()).toBe(1);

    queue.handleThrottlingHeader("Request Count status: Red (85%)");
    expect(queue.getMinSpacingMs()).toBe(1000);
    expect(queue.getMaxConcurrency()).toBe(1);

    queue.handleThrottlingHeader("Request Count status: Green (10%)");
    expect(queue.getMinSpacingMs()).toBe(50);
    expect(queue.getMaxConcurrency()).toBe(2);
  });

  it("should trip circuit breaker and throw PubChemThrottledError on 503", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      headers: new Headers(),
    });

    await expect(queue.fetch("https://example.com")).rejects.toThrow(
      "PubChem service returned HTTP 503.",
    );
    expect(pubChemCircuitBreaker.isOpen()).toBe(true);
  });

  it("should NOT trip circuit breaker or drain queue when Service status is Black on 200 OK response", async () => {
    const headers = new Headers();
    headers.set(
      "X-Throttling-Control",
      "Request Count status: Green (0%), Request Time status: Green (0%), Service status: Black (107%)",
    );
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers,
    });

    const res = await queue.fetch("https://pubchem.ncbi.nlm.nih.gov/rest/test");
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(pubChemCircuitBreaker.isOpen()).toBe(false);
  });

  it("should not trip circuit breaker when skipCircuitBreaker is enabled even on 503", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      headers: new Headers(),
    });

    const res = await queue.fetch(
      "https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete",
      {
        skipCircuitBreaker: true,
      },
    );
    expect(res.status).toBe(503);
    expect(pubChemCircuitBreaker.isOpen()).toBe(false);
  });
});
