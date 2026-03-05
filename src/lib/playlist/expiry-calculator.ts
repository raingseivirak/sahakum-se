import { addHours, setHours, setMinutes, setSeconds, isAfter } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

/**
 * Calculate room expiry: min(now + durationHours, today at cutoffHour).
 *
 * If the current time is already past the cutoff, the cutoff doesn't apply
 * and we fall back to the full duration (the event started late).
 *
 * All calculations happen in the room's timezone so that "10 pm" means
 * 10 pm local time regardless of server location.
 */
export function calculateRoomExpiry(
  timezone: string = 'Europe/Stockholm',
  durationHours: number = 4,
  cutoffHour: number = 22
): Date {
  const now = new Date()
  const zonedNow = toZonedTime(now, timezone)

  const durationExpiry = addHours(zonedNow, durationHours)

  let todayCutoff = setHours(zonedNow, cutoffHour)
  todayCutoff = setMinutes(todayCutoff, 0)
  todayCutoff = setSeconds(todayCutoff, 0)

  // If we're already past the cutoff, duration only (late-night event)
  if (isAfter(zonedNow, todayCutoff)) {
    return fromZonedTime(durationExpiry, timezone)
  }

  // Earlier of duration-based or cutoff-based expiry
  const earliest =
    durationExpiry.getTime() < todayCutoff.getTime()
      ? durationExpiry
      : todayCutoff

  return fromZonedTime(earliest, timezone)
}

export function isRoomExpired(
  expiresAt: Date,
  extendedUntil?: Date | null
): boolean {
  const effectiveExpiry = extendedUntil ?? expiresAt
  return isAfter(new Date(), effectiveExpiry)
}

export function getMinutesUntilExpiry(
  expiresAt: Date,
  extendedUntil?: Date | null
): number {
  const effectiveExpiry = extendedUntil ?? expiresAt
  const diff = effectiveExpiry.getTime() - Date.now()
  return Math.max(0, Math.floor(diff / 60_000))
}

/**
 * Get the effective expiry date, considering extensions.
 */
export function getEffectiveExpiry(
  expiresAt: Date,
  extendedUntil?: Date | null
): Date {
  return extendedUntil ?? expiresAt
}
