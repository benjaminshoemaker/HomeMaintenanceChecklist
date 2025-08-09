import { NextResponse } from 'next/server';
import { createEvents } from 'ics';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { tasks } = await req.json();

    const events = (tasks || []).map((t, idx) => {
      const start = new Date();
      start.setDate(start.getDate() + 7 * (idx % 8));
      return {
        title: `Home: ${t.title}`,
        description: `${t.why}\n\nHow-to: ${t.instructions_url}`,
        duration: { hours: 1 },
        start: [
          start.getFullYear(),
          start.getMonth() + 1,
          start.getDate(),
          9, 0
        ]
      };
    });

    const { error, value } = createEvents(events);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return new NextResponse(value, {
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
