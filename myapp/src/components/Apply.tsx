import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Nav from './Nav';
import { getPosts, savePosts, getUsers, saveUsers } from '../utils';
import type { Post, User } from '../types';

export default function Apply() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [step, setStep] = useState(1);
  const [resume, setResume] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return navigate('/login');
    const me: User = JSON.parse(stored);
    if (me.type !== 'member') return navigate('/jobs');
    setUser(me);
    setResume(me.resume || '');
    setPhone(me.phone);
    getPosts().then(setPosts);
  }, [navigate]);

  if (!user) return null;

  const post = posts.find(p => p.id === Number(id));
  if (!post) {
    return (
      <div>
        <Nav />
        <div className="container my-4" style={{ maxWidth: '600px' }}>
          <p>Job not found.</p>
        </div>
      </div>
    );
  }

  const next = () => setStep(s => Math.min(s + 1, 3));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const submit = async () => {
    const allPosts = await getPosts();
    const idx = allPosts.findIndex(p => p.id === post.id);
    if (!allPosts[idx].applicants.includes(user.email)) {
      allPosts[idx].applicants.push(user.email);
      allPosts[idx].statuses[user.email] = 'applied';
      await savePosts(allPosts);
    }
    const allUsers = await getUsers();
    const uIdx = allUsers.findIndex(u => u.email === user.email);
    allUsers[uIdx].resume = resume;
    allUsers[uIdx].phone = phone;
    await saveUsers(allUsers);
    localStorage.setItem('currentUser', JSON.stringify(allUsers[uIdx]));
    navigate('/dashboard');
  };

  return (
    <div>
      <Nav />
      <div className="hero-indeed py-5">
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 className="mb-4">Apply for {post.title}</h2>
        <div className="progress apply-progress mb-4">
          <div
            className="progress-bar apply-progress-bar"
            role="progressbar"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
        {step === 1 && (
          <div>
            <h5 className="mb-3">Step 1: Upload Resume</h5>
            {resume && (
              <p>
                <a href={resume} download="resume" className="link-primary">
                  View current resume
                </a>
              </p>
            )}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="form-control mb-3"
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => setResume(reader.result as string);
                reader.readAsDataURL(f);
              }}
            />
            <button className="btn btn-primary" onClick={next} disabled={!resume}>
              Next
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h5 className="mb-3">Step 2: Contact Info</h5>
            <div className="mb-2">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={user.contactName}
                onChange={e => setUser({ ...user, contactName: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Email</label>
              <input className="form-control" value={user.email} disabled />
            </div>
            <div className="mb-2">
              <label className="form-label">Phone</label>
              <input
                className="form-control"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary me-2" onClick={prev}>
              Back
            </button>
            <button className="btn btn-primary" onClick={next}>
              Next
            </button>
          </div>
        )}
        {step === 3 && (
          <div>
            <h5 className="mb-3">Step 3: Review</h5>
            <p>
              <strong>Job:</strong> {post.title}
              <br />
              <strong>Name:</strong> {user.contactName}
              <br />
              <strong>Email:</strong> {user.email}
              <br />
              <strong>Phone:</strong> {phone}
            </p>
            <button className="btn btn-secondary me-2" onClick={prev}>
              Back
            </button>
            <button className="btn btn-success" onClick={submit}>
              Submit Application
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
