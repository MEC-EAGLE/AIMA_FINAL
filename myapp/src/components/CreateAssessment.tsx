import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { getAssessments, saveAssessments } from '../utils';
import type { CustomAssessment } from '../types';

export default function CreateAssessment() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], answer: '' },
  ]);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return navigate('/login');
    const me = JSON.parse(stored);
    if (me.type !== 'org') return navigate('/dashboard');
    setUser(me);
  }, [navigate]);

  if (!user) return null;

  const addQuestion = () => {
    setQuestions(qs => [...qs, { question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const updateOption = (qi: number, oi: number, val: string) => {
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, options: q.options.map((o,j)=> j===oi ? val : o) } : q));
  };

  const save = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    for (const q of questions) {
      if (!q.question.trim() || q.options.some(o => !o.trim()) || !q.answer.trim()) {
        alert('Please complete all question fields');
        return;
      }
    }
    const all = await getAssessments();
    const newA: CustomAssessment = {
      id: Date.now(),
      orgEmail: user.email,
      title,
      questions,
    };
    all.push(newA);
    await saveAssessments(all);
    navigate('/org-dashboard');
  };

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '700px' }}>
        <h2 className="mb-3">Create Assessment</h2>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        {questions.map((q, i) => (
          <div key={i} className="card mb-3 p-3">
            <div className="mb-2">
              <label className="form-label">Question {i + 1}</label>
              <input
                className="form-control"
                value={q.question}
                onChange={e => setQuestions(qs => qs.map((qq, idx) => idx === i ? { ...qq, question: e.target.value } : qq))}
              />
            </div>
            {q.options.map((opt, j) => (
              <div className="mb-2" key={j}>
                <label className="form-label">Option {j + 1}</label>
                <input
                  className="form-control"
                  value={opt}
                  onChange={e => updateOption(i, j, e.target.value)}
                />
              </div>
            ))}
            <div className="mb-2">
              <label className="form-label">Correct Answer</label>
              <input
                className="form-control"
                value={q.answer}
                onChange={e => setQuestions(qs => qs.map((qq, idx) => idx === i ? { ...qq, answer: e.target.value } : qq))}
              />
            </div>
          </div>
        ))}
        <button className="btn btn-secondary me-2" type="button" onClick={addQuestion}>
          Add Question
        </button>
        <button className="btn btn-primary" type="button" onClick={save}>
          Save Assessment
        </button>
      </div>
    </div>
  );
}
