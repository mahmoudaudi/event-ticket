export interface CalendarDayCell {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Builds a Sunday-first month grid as an array of weeks (each 7 days),
 * padding with the trailing days of the previous month and leading days of
 * the next month so every week row is complete.
 */
export function buildMonthGrid(year: number, month: number /* 1-12 */): CalendarDayCell[][] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const cells: CalendarDayCell[] = [];

  // Leading days from the previous month.
  for (let i = 0; i < startWeekday; i++) {
    const date = new Date(year, month - 1, 1 - (startWeekday - i));
    cells.push({ date, dayOfMonth: date.getDate(), isCurrentMonth: false, isToday: isSameDay(date, today) });
  }

  // Days in the current month.
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    cells.push({ date, dayOfMonth: day, isCurrentMonth: true, isToday: isSameDay(date, today) });
  }

  // Trailing days from the next month, padding out to a multiple of 7.
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const date = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ date, dayOfMonth: date.getDate(), isCurrentMonth: false, isToday: isSameDay(date, today) });
  }

  const weeks: CalendarDayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
