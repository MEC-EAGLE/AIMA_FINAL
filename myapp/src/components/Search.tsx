import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../utils';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recommended, setRecommended] = useState([] as any[]);
  const [applied, setApplied] = useState([] as any[]);
  const [insights, setInsights] = useState([] as any[]);

  useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (!u) return navigate('/login');
    const me = JSON.parse(u);
    getPosts().then(posts => {
      const q = query.toLowerCase();
      const matches = posts.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.authorEmail.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
      setRecommended(matches.filter(p => !p.applicants.includes(me.email)));
      setApplied(matches.filter(p => p.applicants.includes(me.email)));
      setInsights(matches);
    });
  }, [query, navigate]);

  return (
    <div className="container my-4" style={{ maxWidth: '500px' }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Search</h2>
          <input
            className="form-control mb-3"
            placeholder="Search"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <h4>Recommended Jobs</h4>
          <ul className="list-group mb-3">
            {recommended.map(r => (
              <li key={r.id} className="list-group-item">
                <strong>{r.title}</strong> ({r.postType}) by {r.authorEmail}
                <p>{r.description}</p>
              </li>
            ))}
          </ul>

          <h4>Recently Applied</h4>
          <ul className="list-group mb-3">
            {applied.map(r => (
              <li key={r.id} className="list-group-item">
                <strong>{r.title}</strong> ({r.postType}) by {r.authorEmail}
                <p>{r.description}</p>
              </li>
            ))}
          </ul>

          <h4>Relevant Posts</h4>
          <ul className="list-group list-group-flush">
            {insights.map(r => (
              <li key={r.id} className="list-group-item">
                <strong>{r.title}</strong> ({r.postType}) by {r.authorEmail}
                <p>{r.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
