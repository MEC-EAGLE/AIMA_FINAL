import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from './Nav';
import { getPosts, savePosts, getUsers, matchCandidates } from '../utils';

export default function OrgDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterSkill, setFilterSkill] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [minScore, setMinScore] = useState(0);

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

  const totalPosts = posts.length;
  const totalApplicants = posts.reduce(
    (sum, p) => sum + p.applicants.length,
    0
  );
  const uncheckedResumes = posts.reduce(
    (sum, p) =>
      sum + p.applicants.filter(a => (p.statuses[a] || 'applied') === 'applied').length,
    0
  );

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
        <div className="row mb-3">
          <div className="col-md-4 mb-2">
            <div className="card text-center">
              <div className="card-body p-2">
                <h6 className="card-title">Jobs Posted</h6>
                <p className="fs-4 mb-0">{totalPosts}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="card text-center">
              <div className="card-body p-2">
                <h6 className="card-title">Applications</h6>
                <p className="fs-4 mb-0">{totalApplicants}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="card text-center">
              <div className="card-body p-2">
                <h6 className="card-title">Unchecked Resumes</h6>
                <p className="fs-4 mb-0">{uncheckedResumes}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Filter applicants by skill"
              value={filterSkill}
              onChange={e => setFilterSkill(e.target.value)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className="form-label me-2">Minimum rating</label>
            <select
              className="form-select w-auto d-inline-block"
              value={minRating}
              onChange={e => setMinRating(parseInt(e.target.value))}
            >
              <option value={0}>Any</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <label className="form-label me-2">Min assessment score</label>
            <select
              className="form-select w-auto d-inline-block"
              value={minScore}
              onChange={e => setMinScore(parseInt(e.target.value))}
            >
              <option value={0}>Any</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
        </div>
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
              {(() => {
                const matches = matchCandidates(p, users)
                  .filter(m => !p.applicants.includes(m.user.email))
                  .slice(0, 3);
                return matches.length > 0 ? (
                  <div className="mb-2">
                    <h6>Suggested Candidates</h6>
                    <ul className="list-group">
                      {matches.map(m => (
                        <li key={m.user.email} className="list-group-item">
                          <strong>{m.user.contactName}</strong>{' '}
                          <span className="text-muted">
                            {(m.user.skills || []).join(', ') || 'No skills'}
                          </span>
                          {m.user.ratings && m.user.ratings.length > 0 && (
                            <span className="ms-2 text-warning">
                              {(m.user.ratings.reduce((s:number,r:any)=>s+r.score,0)/m.user.ratings.length).toFixed(1)}/5
                            </span>
                          )}
                          <a
                            href={`mailto:${m.user.email}`}
                            className="btn btn-sm btn-outline-primary ms-2"
                          >
                            Email
                          </a>
                          <a
                            href={`https://wa.me/${m.user.phone}`}
                            className="btn btn-sm btn-success ms-2"
                            target="_blank"
                            rel="noreferrer"
                          >
                            WhatsApp
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })()}

              <h6>Applicants</h6>
              <ul className="list-group mb-2">
                {p.applicants
                  .filter(a => {
                    const cand = users.find(u => u.email === a);
                    if (!cand) return false;
                    const rating = cand.ratings && cand.ratings.length > 0
                      ? cand.ratings.reduce((s: number, r: any) => s + r.score, 0) / cand.ratings.length
                      : 0;
                    const ratingOk = rating >= minRating;
                    const score = p.assessmentScores?.[a] || 0;
                    const scoreOk = score >= minScore;
                    const skillOk =
                      !filterSkill.trim() ||
                      (cand.skills || []).some(s =>
                        s.toLowerCase().includes(filterSkill.toLowerCase())
                      );
                    return ratingOk && skillOk && scoreOk;
                  })
                  .map(a => (
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
                          {cand.ratings && cand.ratings.length > 0 && (
                            <span className="ms-2 text-warning">
                              {(cand.ratings.reduce((s:number,r:any)=>s+r.score,0)/cand.ratings.length).toFixed(1)}/5
                            </span>
                          )}
                          {p.assessmentScores && (
                            <span className="ms-2 badge bg-info text-dark">
                              Score {p.assessmentScores[cand.email] ?? 0}
                            </span>
                          )}
                          {cand.resume && (
                            <a
                              href={cand.resume}
                              download="resume"
                              className="btn btn-sm btn-outline-secondary ms-2"
                            >
                              Resume
                            </a>
                          )}
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
