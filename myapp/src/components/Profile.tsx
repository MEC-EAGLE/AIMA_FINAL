import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Nav from './Nav';
import { getUsers, saveUsers } from '../utils';
import type { Attachment } from '../types';

export default function Profile() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [viewer, setViewer] = useState(null as any);
  const [user, setUser] = useState(null as any);
  const [allUsers, setAllUsers] = useState([] as any[]);
  const [rank, setRank] = useState<number | null>(null);
  const [totalRanks, setTotalRanks] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [myRating, setMyRating] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return navigate('/login');
    const me = JSON.parse(stored);
    setViewer(me);
    getUsers().then(all => {
      setAllUsers(all);
      const found = all.find((u: any) => u.email === email);
      if (!found) return navigate('/community');
      setUser(found);
      const sorted = [...all].filter(u => u.codingScore !== undefined);
      sorted.sort((a, b) => (b.codingScore || 0) - (a.codingScore || 0));
      const r = sorted.findIndex(u => u.email === found.email);
      setRank(r >= 0 ? r + 1 : null);
      setTotalRanks(sorted.length);
      const ratings = found.ratings || [];
      if (ratings.length > 0) {
        const total = ratings.reduce((s: number, r: any) => s + r.score, 0);
        setAvgRating(total / ratings.length);
        const mine = ratings.find((r: any) => r.from === me.email);
        setMyRating(mine ? mine.score : 0);
      } else {
        setAvgRating(null);
        setMyRating(0);
      }
    });
  }, [email, navigate]);

  if (!viewer || !user) return null;

  const allowed =
    viewer.email === user.email ||
    (user.profileShares || []).includes(viewer.email) ||
    (viewer.type === 'org' && user.type === 'member');

  const submitRating = async () => {
    if (myRating < 1 || myRating > 5) return;
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === user.email);
    if (idx === -1) return;
    const arr = all[idx].ratings || [];
    const existing = arr.find((r: any) => r.from === viewer.email);
    if (existing) existing.score = myRating; else arr.push({ from: viewer.email, score: myRating });
    all[idx].ratings = arr;
    await saveUsers(all);
    setUser(all[idx]);
    const avg = arr.reduce((s: number, r: any) => s + r.score, 0) / arr.length;
    setAvgRating(avg);
  };

  if (!allowed) {
    return (
      <div>
        <Nav />
        <div className="container my-4" style={{ maxWidth: '600px' }}>
          <h4>Profile access not granted.</h4>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '600px' }}>
        <div className="d-flex align-items-center mb-2">
          {user.photo && (
            <img
              src={user.photo}
              alt="profile"
              style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '50%', marginRight: '10px' }}
            />
          )}
          <div>
            <h2 className="mb-0">{user.contactName}'s Profile</h2>
            <p className="text-muted mb-0">
              Email: <a href={`mailto:${user.email}`}>{user.email}</a>{' '}
              | <a href={`https://wa.me/${user.phone}`} target="_blank" rel="noreferrer">WhatsApp</a>
            </p>
          </div>
        </div>
        <h5>Skills</h5>
        <p>{(user.skills || []).join(', ') || 'No skills listed'}</p>
        {user.preferences && user.preferences.length > 0 && (
          <div className="mb-2">
            <h5>Job Preferences</h5>
            <p>{user.preferences.join(', ')}</p>
          </div>
        )}
        {user.codingScore !== undefined && rank && totalRanks && user.type === 'member' && (
          <p className="text-muted">Coding rank: {rank} of {totalRanks}</p>
        )}
        {avgRating && (
          <p className="text-muted">Average rating: {avgRating.toFixed(1)} / 5</p>
        )}
        {viewer.email !== user.email && (
          <form
            className="mb-2"
            onSubmit={e => {
              e.preventDefault();
              submitRating();
            }}
          >
            <label className="form-label me-2">Rate this member</label>
            <select
              className="form-select d-inline-block w-auto me-2"
              value={myRating}
              onChange={e => setMyRating(parseInt(e.target.value))}
            >
              <option value="0">Select</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-sm btn-primary">
              Submit
            </button>
          </form>
        )}
        {user.bio && (
          <div className="mb-2">
            <h5>Bio</h5>
            <p>{user.bio}</p>
          </div>
        )}
        {user.docs && user.docs.length > 0 && (
          <div>
            <h5>Documents</h5>
            <ul className="list-group">
              {user.docs.map((d: Attachment, i: number) => (
                <li key={i} className="list-group-item">
                  <a href={d.data} download={d.name} className="link-primary">
                    {d.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {user.recommendations && user.recommendations.length > 0 && (
          <div className="mt-3">
            <h5>Recommendations</h5>
            <ul className="list-group">
              {user.recommendations.map((r: any, i: number) => (
                <li key={i} className="list-group-item">
                  <strong>
                    {allUsers.find(u => u.email === r.from)?.contactName || r.from}
                  </strong>
                  : {r.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
