import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { getUsers, saveUsers } from '../utils';
import { PeopleNeed } from '../types';

export default function PeopleMap() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null as any);
  const [role, setRole] = useState('');
  const [count, setCount] = useState(1);

  useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (!u) return navigate('/login');
    const me = JSON.parse(u);
    if (me.type !== 'org') return navigate('/dashboard');
    setUser(me);
  }, [navigate]);

  if (!user) return null;

  const addNeed = async () => {
    if (!role) return;
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === user.email);
    const pn: PeopleNeed = { role, count };
    if (!all[idx].peopleMap) all[idx].peopleMap = [];
    all[idx].peopleMap.push(pn);
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idx]));
    setUser(all[idx]);
    setRole('');
    setCount(1);
  };

  const removeNeed = async (i: number) => {
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === user.email);
    all[idx].peopleMap.splice(i, 1);
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idx]));
    setUser(all[idx]);
  };

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '600px' }}>
        <h2>People Map</h2>
        <form
          className="mb-3"
          onSubmit={e => {
            e.preventDefault();
            addNeed();
          }}
        >
          <input
            className="form-control mb-2"
            placeholder="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
          <input
            type="number"
            className="form-control mb-2"
            value={count}
            min={1}
            onChange={e => setCount(parseInt(e.target.value, 10))}
          />
          <button type="submit" className="btn btn-primary">
            Add Need
          </button>
        </form>
        <ul className="list-group">
          {(user.peopleMap || []).map((p: PeopleNeed, i: number) => (
            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                {p.role} - {p.count}
              </span>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => removeNeed(i)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
