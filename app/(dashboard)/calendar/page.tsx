import { getTasks } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const tasks = await getTasks();

  // Basic calendar logic (simplified for demonstration)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day > 0 && day <= daysInMonth) {
      // Find tasks for this day (assuming dueDate is like "10 Mar 2024" or easily parsable)
      // For a robust implementation, we'd use date-fns to compare properly.
      // Here we just do a loose match or show some tasks.
      const dateStr = `${day.toString().padStart(2, '0')} ${today.toLocaleString('default', { month: 'short' })} ${year}`;
      const dayTasks = tasks.filter(t => t.dueDate === dateStr || t.dueDate.startsWith(day.toString()));
      return { day, tasks: dayTasks };
    }
    return { day: null, tasks: [] };
  });

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7 border-b text-center text-sm font-medium">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 border-r last:border-r-0 bg-muted/30">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => (
            <div key={i} className="min-h-[100px] border-r border-b p-2">
              {d.day && (
                <>
                  <span className="text-sm font-medium text-muted-foreground">{d.day}</span>
                  <div className="mt-2 space-y-1">
                    {d.tasks.map(t => (
                      <div key={t.id} className="text-xs p-1 bg-primary/10 text-primary rounded truncate">
                        {t.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
