import { DateTime } from "luxon";

export function convertTime(
  time: string,              // "00:00"
  fromTimeZone: string,      // "Asia/Kolkata"
  toTimeZone: string,        // "America/New_York"
  date = "2025-01-10"        
) {
  // Step 1: parse time in source timezone
  const source = DateTime.fromISO(
    `${date}T${time}`,
    { zone: fromTimeZone }
  );

  // Step 2: convert to target timezone
  const target = source.setZone(toTimeZone);

  return {
    time: target.toFormat("HH:mm"),
    date: target.toISODate(),
    full: target.toISO()
  };
}


