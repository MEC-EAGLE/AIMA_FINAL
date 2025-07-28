import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPosts, savePosts, getUsers, getAssessments } from '../utils';

export default function Create() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null as any);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState('job');
  const [posts, setPosts] = useState([] as any[]);
  const [users, setUsers] = useState([] as any[]);
  const [assessments, setAssessments] = useState([] as any[]);
  const [assessmentId, setAssessmentId] = useState<number | ''>('');

  useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (!u) return navigate('/login');
    const parsed = JSON.parse(u);
    if (parsed.type !== 'org') {
      navigate('/dashboard');
      return;
    }
    setUser(parsed);
    Promise.all([getPosts(), getUsers(), getAssessments()]).then(([p, us, as]) => {
      setPosts(p.filter(x => x.authorEmail === parsed.email));
      setUsers(us);
      setAssessments(as.filter((a: any) => a.orgEmail === parsed.email));
    });
  }, [navigate]);

  if (!user) return null;

  const submit = async (e: any) => {
    e.preventDefault();
    const all = await getPosts();
    all.push({
      id: Date.now(),
      authorEmail: user.email,
      authorType: user.type,
      title,
      description,
      postType,
      tags: [],
      applicants: [],
      statuses: {},
      assessmentId: assessmentId === '' ? undefined : Number(assessmentId),
      assessmentScores: {},
      comments: [],
    });
    await savePosts(all);
    setPosts(all.filter(p => p.authorEmail === user.email));
    setTitle('');
    setDescription('');
  };

  const deletePost = async (id: number) => {
    if (!window.confirm('Delete this post?')) return;
    const all = await getPosts();
    const filtered = all.filter(p => p.id !== id);
    await savePosts(filtered);
    setPosts(filtered.filter(p => p.authorEmail === user.email));
  };

  const updateStatus = async (
    postId: number,
    email: string,
    status: string
  ) => {
    const all = await getPosts();
    const idx = all.findIndex(p => p.id === postId);
    all[idx].statuses[email] = status;
    await savePosts(all);
    setPosts(all.filter(p => p.authorEmail === user.email));
  };

  return (
    <div className="container my-4" style={{ maxWidth: '600px' }}>
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title mb-3">Create Post</h2>
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                className="form-control"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={postType}
                onChange={e => setPostType(e.target.value)}
              >
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="volunteering">Volunteering</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Assessment</label>
              <select
                className="form-select"
                value={assessmentId}
                onChange={e => setAssessmentId(e.target.value ? Number(e.target.value) as any : '')}
              >
                <option value="">None</option>
                {assessments.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
              <div className="form-text">
                <Link to="/create-assessment">Create Assessment</Link>
              </div>
            </div>
            <button className="btn btn-primary" type="submit">
              Create
            </button>
          </form>
        </div>
      </div>
      {posts.map(p => (
        <div key={p.id} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">{p.title}</h5>
            <p>{p.description}</p>
            <button
              type="button"
              className="btn btn-sm btn-danger mb-3"
              onClick={() => deletePost(p.id)}
            >
              Delete Post
            </button>
            <h6>
              Applicants ({p.applicants.length})
            </h6>
            <ul className="list-group">
              {p.applicants.map(a => {
                const cand = users.find(u => u.email === a);
                if (!cand) return null;
                return (
                  <li
                    key={a}
                    className="list-group-item d-flex justify-content-between align-items-center"
                    style={{ opacity: p.statuses[a] === 'rejected' ? 0.5 : 1 }}
                  >
                    <span>{cand.contactName}</span>
                    <span>
                      <Link
                        to={`/profile/${a}`}
                        className="btn btn-sm btn-outline-info me-2"
                      >
                        View Profile
                      </Link>
                      <select
                        className="form-select form-select-sm d-inline-block me-2"
                        style={{ width: 'auto' }}
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
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => updateStatus(p.id, a, 'rejected')}
                      >
                        Reject
                      </button>
                      <Link
                        to="/interview"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Interview
                      </Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
