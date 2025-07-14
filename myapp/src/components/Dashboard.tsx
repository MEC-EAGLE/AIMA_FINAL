import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { getPosts, savePosts } from '../utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<'saved' | 'applied'>('saved');

  useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (!u) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(u));
    getPosts().then(setPosts);
    setSaved(new Set(JSON.parse(localStorage.getItem('savedJobs') || '[]')));
  }, [navigate]);

  if (!user) {
    return (
      <div>
        <Nav />
        <header className="dashboard-hero py-5 text-center">
          <h1 className="display-6 fw-bold text-uppercase">My Jobs</h1>
        </header>
        <div className="container my-4 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const savedPosts = posts.filter(p => saved.has(p.id));
  const appliedPosts = posts.filter(p => p.applicants.includes(user.email));

  const gotoApply = (id: number) => {
    if (!user.skills || user.skills.length === 0) {
      alert('Please complete your profile before applying.');
      return;
    }
    navigate(`/apply/${id}`);
  };

  const withdraw = async (id: number) => {
    const all = await getPosts();
    const idx = all.findIndex(p => p.id === id);
    all[idx].applicants = all[idx].applicants.filter((a: string) => a !== user.email);
    delete all[idx].statuses[user.email];
    await savePosts(all);
    setPosts(all);
  };

  const unsave = (id: number) => {
    const s = new Set(saved);
    s.delete(id);
    localStorage.setItem('savedJobs', JSON.stringify(Array.from(s)));
    setSaved(s);
  };

  return (
    <div>
      <Nav />
      <header className="dashboard-hero py-5 text-center">
        <h1 className="display-6 fw-bold text-uppercase">My Jobs</h1>
      </header>
      <div className="container my-4">
        <ul className="nav nav-pills mb-3">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${tab === 'saved' ? 'active' : ''}`}
              onClick={() => setTab('saved')}
            >
              Saved
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${tab === 'applied' ? 'active' : ''}`}
              onClick={() => setTab('applied')}
            >
              Applied
            </button>
          </li>
        </ul>

        {tab === 'saved' && (
          <div>
            {savedPosts.length === 0 && <p>No saved jobs.</p>}
            {savedPosts.map(p => (
              <div key={p.id} className="card mb-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <strong>{p.title}</strong> ({p.postType})
                    <p className="mb-1">{p.description}</p>
                  </div>
                  <div className="text-end">
                    {p.applicants.includes(user.email) ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-warning"
                        onClick={() => withdraw(p.id)}
                      >
                        Withdraw
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary mb-1"
                        onClick={() => gotoApply(p.id)}
                      >
                        Apply
                      </button>
                    )}
                    <br />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary mt-1"
                      onClick={() => unsave(p.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'applied' && (
          <div>
            {appliedPosts.length === 0 && <p>You haven't applied to any jobs.</p>}
            {appliedPosts.map(p => (
              <div key={p.id} className="card mb-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <strong>{p.title}</strong> ({p.postType})
                    <p className="mb-1">{p.description}</p>
                    <small className="text-muted">
                      Status: {p.statuses[user.email] || 'applied'}
                    </small>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn btn-sm btn-warning"
                      onClick={() => withdraw(p.id)}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

