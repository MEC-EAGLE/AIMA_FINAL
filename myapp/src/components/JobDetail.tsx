import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Nav from './Nav';
import { getPosts, getUsers } from '../utils';
import type { Post, User } from '../types';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);

  useEffect(() => {
    getPosts().then(p => {
      const found = p.find(x => x.id === Number(id));
      setPost(found || null);
      if (found) {
        getUsers().then(us => {
          const au = us.find(u => u.email === found.authorEmail) || null;
          setAuthor(au);
        });
      }
    });
  }, [id]);

  if (!post) {
    return (
      <div>
        <Nav />
        <div className="container my-4" style={{ maxWidth: '600px' }}>
          <p>Job not found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '700px' }}>
        <h2 className="mb-3">{post.title}</h2>
        <p className="text-muted">Posted by {author?.contactName || post.authorEmail}</p>
        <p>{post.description}</p>
        <div className="mb-3">
          {post.tags.map(t => (
            <span key={t} className="badge bg-secondary me-2">
              {t}
            </span>
          ))}
        </div>
        <div className="d-flex">
          <Link to={`/apply/${post.id}`} className="btn btn-primary me-2">
            Apply
          </Link>
          <button className="btn btn-secondary" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </button>
        </div>
      </div>
    </div>
  );
}
