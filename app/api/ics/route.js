// app/api/ics/route.js
import { NextResponse } from 'next/server';
import ical from 'ical-generator';
import icalTimezones from '@touch4it/ical-timezones';
import zipcodeToTimezone from 'zipcode-to-timezone';
import { DateTime } from 'luxon';

// Determine season boundaries (meteorological seasons for simplicity)
function getSeasonRange(nowUtc = DateTime.utc()) {
  const y = nowUtc.year;
  const m = nowUtc.month;
  if (m >= 3 && m <= 5) return [DateTime.utc(y, 3, 1), DateTime.utc(y, 5, 31, 23, 59)];
  if (m >= 6 && m <= 8) return [DateTime.utc(y, 6, 1), DateTime.utc(y, 8, 31, 23, 59)];
  if (m >= 9 && m <= 11) return [DateTime.utc(y, 9, 1), DateTime.utc(y, 11, 30, 23, 59)];
  // Winter spans the year boundary; keep it simple
  return [DateTime.utc(y, 12, 1), DateTime.utc(y + 1, 2, 28, 23, 59)];
}

// Build a list of weekend DateTimes (Sat 9:00 first, then Sun 9:00 if needed) in the user's tz
function weekendSlotsForSeason(tz, needed) {
  const [seasonStartUtc, seasonEndUtc] = getSeasonRange();
  // Start from the upcoming Saturday at 09:00 local time
  let cursor = DateTime.now().setZone(tz);
  while (cursor.weekday !== 6) cursor = cursor.plus({ days: 1 }); // 6 = Saturday
  cursor = cursor.set({ hour: 9, minute: 0, second: 0, millisecond: 0 });

  const slots = [];
  while (slots.length < needed) {
    const sat = cursor;
    const sun = cursor.plus({ days: 1 });

    // Only include times that fall within the season (by UTC)
    if (sat.toUTC() >= seasonStartUtc && sat.toUTC() <= seasonEndUtc) slots.push(sat);
    if (slots.length < needed && sun.toUTC() >= seasonStartUtc && sun.toUTC() <= seasonEndUtc) slots.push(sun);

    cursor = cursor.plus({ weeks: 1 }); // next weekend
  }
  return slots.slice(0, needed);
}

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { tasks = [], zip } = await req.json();
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks provided' }, { status: 400 });
    }

    // Guess timezone from ZIP; default to Pacific if unknown
    let tzid = 'America/Los_Angeles';
    try {
      const guess = zipcodeToTimezone.lookup(zip);
      if (guess) tzid = guess;
    } catch {
      // ignore and use fallback
    }

    // Create weekend slots across the season in the ZIP's timezone
    const slots = weekendSlotsForSeason(tzid, tasks.length);

    // Build an iCal with TZID + VTIMEZONE so times are fixed to the ZIP's zone
    const cal = ical({
      name: 'Seasonal Home Checklist',
      timezone: tzid
    });

    // Inject VTIMEZONE so Outlook/Apple/Google all honor the TZID properly
    try {
      const vtz = icalTimezones.getVtimezoneComponent(tzid);
      if (vtz) {
        cal.raw(vtz);
      }
    } catch {
      // If generation fails, continue; many clients still honor TZID, but VTIMEZONE is preferred
    }

    // Create events at 9:00 AM TZ-local, 1 hour duration
    slots.forEach((dt, idx) => {
      const t = tasks[idx];
      cal.createEvent({
        start: new Date(dt.year, dt.month - 1, dt.day, 9, 0, 0), // JS Date at 09:00 local of tzid (rendered with TZID below)
        timezone: tzid, // ensure DTSTART;TZID=... is emitted
        summary: `Home: ${t.title}`,
        description: `${t.why}\n\nHow-to: ${t.instructions_url}`,
        duration: { hours: 1 }
      });
    });

    const icsString = cal.toString();

    return new NextResponse(icsString, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="seasonal-home-checklist.ics"'
      }
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}