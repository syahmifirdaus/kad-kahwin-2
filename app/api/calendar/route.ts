const event = {
  title: "Syahmi & Hanis Wedding",
  details: "Majlis perkahwinan Syahmi & Hanis",
  location:
    "Grand Ballroom Bora Ombak, Jalan P5/5, Presint 5, 62200 Putrajaya, Wilayah Persekutuan Putrajaya",
  start: "20260724T120000Z",
  end: "20260724T150000Z",
};

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export async function GET() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//kad-kahwin//invite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:syahmi-hanis-20260724@kad-kahwin`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${event.start}`,
    `DTEND:${event.end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.details)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="syahmi-hanis-wedding.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
