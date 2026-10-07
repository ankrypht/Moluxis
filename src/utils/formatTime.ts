/**
 * Format a timestamp into a friendly relative time string (e.g. "Just now", "5m ago", "2h ago", "Yesterday")
 */
export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
): string {
  if (!timestamp || isNaN(timestamp)) return "";

  const diffMs = Math.max(0, now - timestamp);
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
