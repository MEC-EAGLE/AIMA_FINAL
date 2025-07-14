import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { getUsers, saveUsers } from '../utils';
import { Note } from '../types';

export default function Notes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null as any);
  const [text, setText] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (!u) return navigate('/login');
    setUser(JSON.parse(u));
  }, [navigate]);

  if (!user) return null;

  const addNote = async () => {
    if (!text) return;
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === user.email);
    const note: Note = { id: Date.now(), text, timestamp: Date.now() };
    if (!all[idx].notes) all[idx].notes = [];
    all[idx].notes.push(note);
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idx]));
    setUser(all[idx]);
    setText('');
  };

  const deleteNote = async (id: number) => {
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === user.email);
    all[idx].notes = all[idx].notes.filter((n: Note) => n.id !== id);
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idx]));
    setUser(all[idx]);
  };

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '600px' }}>
        <h2>Notepad</h2>
        <form
          className="mb-3"
          onSubmit={e => {
            e.preventDefault();
            addNote();
          }}
        >
          <textarea
            className="form-control mb-2"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Add Note
          </button>
        </form>
        <ul className="list-group">
          {user.notes.map((n: Note) => (
            <li key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{n.text}</span>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => deleteNote(n.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
