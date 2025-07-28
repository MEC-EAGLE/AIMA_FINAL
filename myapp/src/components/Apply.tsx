import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Nav from './Nav';
import { getPosts, savePosts, getUsers, saveUsers, getAssessments } from '../utils';
import type { Post, User, CustomAssessment } from '../types';

export default function Apply() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [step, setStep] = useState(1);
  const [resume, setResume] = useState('');
  const [phone, setPhone] = useState('');
  const [assessment, setAssessment] = useState<CustomAssessment | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!posts.length) return;
    const p = posts.find(po => po.id === Number(id));
    if (p && p.assessmentId) {
      getAssessments().then(as => {
        const a = as.find((aa: any) => aa.id === p.assessmentId) || null;
        setAssessment(a);
      });
    }
  }, [posts, id]);

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

  const next = () => setStep(s => Math.min(s + 1, assessment ? 5 : 4));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const applyNow = async (score?: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const allPosts = await getPosts();
      const idx = allPosts.findIndex(p => p.id === post.id);
      if (!allPosts[idx].applicants.includes(user.email)) {
        allPosts[idx].applicants.push(user.email);
        allPosts[idx].statuses[user.email] = 'applied';
      }
      if (score !== undefined) {
        if (!allPosts[idx].assessmentScores) allPosts[idx].assessmentScores = {};
        allPosts[idx].assessmentScores[user.email] = score;
      }
      await savePosts(allPosts);
      const allUsers = await getUsers();
      const uIdx = allUsers.findIndex(u => u.email === user.email);
      allUsers[uIdx].resume = resume;
      allUsers[uIdx].phone = phone;
      await saveUsers(allUsers);
      localStorage.setItem('currentUser', JSON.stringify(allUsers[uIdx]));
    } catch (err) {
      console.error('Failed to submit application', err);
    } finally {
      setStep(assessment ? 5 : 4);
      setLoading(false);
      setTimeout(() => navigate('/jobs'), 2000);
    }
  };

  const submit = () => {
    if (assessment) {
      setStep(4);
    } else {
      applyNow();
    }
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
            style={{ width: `${(step / (assessment ? 5 : 4)) * 100}%` }}
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
            <button className="btn btn-success" onClick={submit} disabled={loading}>
              {loading ? 'Please wait...' : 'Submit Application'}
            </button>
          </div>
        )}
        {step === 4 && assessment && (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!assessment) return;
              if (current < assessment.questions.length - 1) {
                setCurrent(c => c + 1);
              } else {
                let score = 0;
                for (let i = 0; i < assessment.questions.length; i++) {
                  const q = assessment.questions[i];
                  if (answers[i] === q.answer) score += 1;
                }
                applyNow(score);
              }
            }}
          >
            <div className="mb-3">
              <p className="fw-bold">
                {assessment?.questions[current].question}
              </p>
              {assessment?.questions[current].options.map(opt => (
                <div className="form-check" key={opt}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="opt"
                    value={opt}
                    checked={answers[current] === opt}
                    onChange={() => setAnswers(a => ({ ...a, [current]: opt }))}
                  />
                  <label className="form-check-label">{opt}</label>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!answers[current] || loading}
            >
              {current < (assessment?.questions.length || 0) - 1
                ? 'Next'
                : loading
                ? 'Submitting...'
                : 'Submit'}
            </button>
          </form>
        )}
        {step === (assessment ? 5 : 4) && (
          <div className="text-center">
            <h5 className="mb-3">Successfully applied!</h5>
            <p className="mb-2">Redirecting to jobs...</p>
            <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
              Go to Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
