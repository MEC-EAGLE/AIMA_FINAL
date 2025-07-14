import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { getUsers, saveUsers } from '../utils';
import { CalendarEvent } from '../types';

export default function Calendar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null as any);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (!u) return navigate('/login');
    setUser(JSON.parse(u));
  }, [navigate]);

  if (!user) return null;

  const addEvent = async () => {
    if (!title || !date) return;
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === user.email);
    const ev: CalendarEvent = {
      id: Date.now(),
      title,
      date,
      alert: false,
    };
    if (!all[idx].events) all[idx].events = [];
    all[idx].events.push(ev);
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idx]));
    setUser(all[idx]);
    setTitle('');
    setDate('');
  };

  const toggleAlert = async (id: number) => {
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === user.email);
    const ev = all[idx].events.find((e: CalendarEvent) => e.id === id);
    if (ev) ev.alert = !ev.alert;
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idx]));
    setUser(all[idx]);
  };

  const removeEvent = async (id: number) => {
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === user.email);
    all[idx].events = all[idx].events.filter((e: CalendarEvent) => e.id !== id);
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idx]));
    setUser(all[idx]);
  };

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '600px' }}>
        <h2>Calendar</h2>
        <form
          className="mb-3"
          onSubmit={e => {
            e.preventDefault();
            addEvent();
          }}
        >
          <input
            className="form-control mb-2"
            placeholder="Event title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            type="datetime-local"
            className="form-control mb-2"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Add Event
          </button>
        </form>
        <ul className="list-group">
          {user.events.map((e: CalendarEvent) => (
            <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                {e.title} - {new Date(e.date).toLocaleString()}
                {e.alert && <span className="badge bg-info text-dark ms-2">alert</span>}
              </span>
              <span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => toggleAlert(e.id)}
                >
                  {e.alert ? 'Clear' : 'Alert'}
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeEvent(e.id)}>
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
