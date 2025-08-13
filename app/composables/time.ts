// filepath: /home/ztl-uwu/Dev/repos/CTT/app/composables/time.ts
/**
 * Convert a time string of the form M:SS.mmm into milliseconds.
 * Rules:
 *  - Minutes: 1+ digits (no upper bound enforced)
 *  - Seconds: exactly two digits 00-59
 *  - Milliseconds: 1-3 digits (normalized to 3 by right padding with zeros)
 *  - Example: "1:45.123" -> 105123 ms
 *  - Example: "12:07.4"  -> 724000 ms
 * Returns Number.NaN for invalid input.
 */
export function celesteTimeToMs(raw: string): number {
  if (typeof raw !== 'string')
    return Number.NaN;
  const trimmed = raw.trim();
  if (!trimmed)
    return Number.NaN;
  const match = /^(\d+):([0-5]\d)(?:\.(\d{1,3}))?$/.exec(trimmed);
  if (!match)
    return Number.NaN;
  const minutes = Number.parseInt(match[1]!, 10);
  const seconds = Number.parseInt(match[2]!, 10);
  const msStr = (match[3] ?? '0').padEnd(3, '0');
  const millis = Number.parseInt(msStr, 10);
  return ((minutes * 60) + seconds) * 1000 + millis;
}

/** Format milliseconds into M:SS.mmm (minutes can exceed 59). */
export function msToCelesteTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0)
    return '0:00.000';
  const totalMs = Math.round(ms);
  const totalSeconds = Math.floor(totalMs / 1000);
  const millis = totalMs - totalSeconds * 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  const secStr = seconds.toString().padStart(2, '0');
  const msStr = millis.toString().padStart(3, '0');
  return `${minutes}:${secStr}.${msStr}`;
}

// Examples:
// celesteTimeToMs('1:45.123') -> 105123
// celesteTimeToMs('12:07.4')  -> 724000

export function msToTime(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
