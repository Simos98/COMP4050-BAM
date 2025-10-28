import React, { useEffect, useState } from 'react';
import { getMyBookings } from '../services/bookings';
import type { Booking } from '../types';

function monthStart(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function monthEnd(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [current, setCurrent] = useState(new Date());

  useEffect(() => {
    (async () => {
      try {
        const b = await getMyBookings();
        setBookings(b || []);
      } catch (e: any) {
        setLoadErr(e?.message ?? 'Failed to load bookings');
      }
    })();
  }, []);

  const start = monthStart(current);
  const end = monthEnd(current);

  // generate grid of days for the month (including leading/trailing)
  const firstWeekday = start.getDay(); // 0..6 (Sun..Sat)
  const daysInMonth = end.getDate();
  const cells: Date[] = [];
  // previous month's tail
  for (let i = 0; i < firstWeekday; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - (firstWeekday - i));
    cells.push(d);
  }
  // current month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), i));
  }
  // fill to full weeks
  while (cells.length % 7 !== 0) {
    const d = new Date(end);
    d.setDate(end.getDate() + (cells.length - (firstWeekday + daysInMonth) + 1));
    cells.push(d);
  }

  const bookingsByDay = new Map<string, Booking[]>();
  for (const b of bookings) {
    const d = new Date(b.start);
    const key = d.toISOString().slice(0, 10);
    bookingsByDay.set(key, [...(bookingsByDay.get(key) || []), b]);
  }


  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Bookings - {current.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h3>
        <div>
          <button onClick={prevMonth}>Prev</button>
          <button onClick={nextMonth}>Next</button>
        </div>
      </div>

      {loadErr && <div className="small" style={{ color: '#ffb4a2' }}>{loadErr}</div>}

      <div className="calendar" style={{ marginTop: 12 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h => <div key={h} className="small" style={{ textAlign:'center' }}>{h}</div>)}
        {cells.map((day, idx) => {
          const key = day.toISOString().slice(0,10);
          const dayBookings = bookingsByDay.get(key) || [];
          const isCurrentMonth = day.getMonth() === current.getMonth();
          return (
            <div key={idx} className="day">
              <div className="date" style={{ opacity: isCurrentMonth ? 1 : 0.35 }}>{day.getDate()}</div>
              {dayBookings.map(b => (
                <div key={b.id} className="booking">{b.title ?? 'Booking'}</div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}