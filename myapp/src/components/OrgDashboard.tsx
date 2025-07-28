import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from './Nav';
import { getPosts, savePosts, getUsers } from '../utils';

export default function OrgDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return navigate('/login');
    const me = JSON.parse(stored);
    if (me.type !== 'org') return navigate('/dashboard');
    setUser(me);
    Promise.all([getPosts(), getUsers()]).then(([p, us]) => {
      setPosts(p.filter(po => po.authorEmail === me.email));
      setUsers(us);
    });
  }, [navigate]);

  if (!user) return null;

  const withdrawPost = async (id: number) => {
    const all = await getPosts();
    const filtered = all.filter(p => p.id !== id);
    await savePosts(filtered);
    setPosts(filtered.filter(p => p.authorEmail === user.email));
  };

  const updateStatus = async (postId: number, email: string, status: string) => {
    const all = await getPosts();
    const idx = all.findIndex(p => p.id === postId);
    all[idx].statuses[email] = status;
    await savePosts(all);
    setPosts(all.filter(p => p.authorEmail === user.email));
  };

  return (
    <div>
      <Nav />
      <div className="container my-4">
        <h2>Your Job Posts</h2>
        <Link to="/create" className="btn btn-primary mb-3">
          Post a Job
        </Link>
        {posts.map(p => (
          <div key={p.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{p.title}</h5>
              <p>{p.description}</p>
              <button
                type="button"
                className="btn btn-sm btn-danger mb-3"
                onClick={() => withdrawPost(p.id)}
              >
                Withdraw Post
              </button>
              <h6>Applicants</h6>
              <ul className="list-group mb-2">
                {p.applicants.map(a => (
                  <li
                    key={a}
                    className="list-group-item"
                    style={{ opacity: p.statuses[a] === 'rejected' ? 0.5 : 1 }}
                  >
                    {(() => {
                      const cand = users.find(u => u.email === a);
                      if (!cand) return null;
                      return (
                        <>
                          <strong>{cand.contactName}</strong>{' '}
                          <span className="text-muted">
                            {(cand.skills || []).join(', ') || 'No skills'}
                          </span>
                          <Link
                            to={`/profile/${cand.email}`}
                            className="btn btn-sm btn-outline-info ms-2"
                          >
                            View Profile
                          </Link>
                        </>
                      );
                    })()}
                    <select
                      className="form-select form-select-sm mt-1"
                      value={p.statuses[a] || 'applied'}
                      onChange={e => updateStatus(p.id, a, e.target.value)}
                    >
                      <option value="applied">applied</option>
                      <option value="review">review</option>
                      <option value="interview">interview</option>
                      <option value="offer">offer</option>
                      <option value="rejected">rejected</option>
                    </select>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger mt-1 ms-2"
                      onClick={() => updateStatus(p.id, a, 'rejected')}
                    >
                      Reject
                    </button>
                    <Link
                      to={`/chat/${a}`}
                      className="btn btn-sm btn-secondary mt-1 ms-2"
                    >
                      Message
                    </Link>
                    <Link
                      to="/interview"
                      className="btn btn-sm btn-outline-primary mt-1 ms-2"
                    >
                      Start Interview
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
