import { formatRelativeTime } from "../formatTime";

describe("formatRelativeTime", () => {
  const baseTime = 1700000000000;

  it("handles empty or invalid timestamp", () => {
    expect(formatRelativeTime(0, baseTime)).toBe("");
    expect(formatRelativeTime(NaN, baseTime)).toBe("");
  });

  it("returns 'Just now' for timestamps under 60 seconds ago", () => {
    expect(formatRelativeTime(baseTime - 10000, baseTime)).toBe("Just now");
    expect(formatRelativeTime(baseTime - 59000, baseTime)).toBe("Just now");
  });

  it("returns 'Xm ago' for minutes", () => {
    expect(formatRelativeTime(baseTime - 120000, baseTime)).toBe("2m ago");
    expect(formatRelativeTime(baseTime - 3500000, baseTime)).toBe("58m ago");
  });

  it("returns 'Xh ago' for hours", () => {
    expect(formatRelativeTime(baseTime - 7200000, baseTime)).toBe("2h ago");
  });

  it("returns 'Yesterday' for 1 day ago", () => {
    expect(formatRelativeTime(baseTime - 86400000, baseTime)).toBe("Yesterday");
  });

  it("returns 'Xd ago' for 2-6 days ago", () => {
    expect(formatRelativeTime(baseTime - 86400000 * 3, baseTime)).toBe(
      "3d ago",
    );
  });
});
