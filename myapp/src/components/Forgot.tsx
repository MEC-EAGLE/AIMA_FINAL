import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, saveUsers, hashString } from '../utils';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const request = async () => {
    const users = await getUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) {
      alert('Email not found');
      return;
    }
    const c = Math.random().toString(36).slice(2, 8);
    users[idx].resetCode = c;
    await saveUsers(users);
    alert('Your reset code: ' + c);
    setStep(2);
  };

  const reset = async () => {
    const users = await getUsers();
    const idx = users.findIndex(u => u.email === email && u.resetCode === code);
    if (idx === -1) {
      alert('Invalid code');
      return;
    }
    users[idx].password = await hashString(newPass);
    users[idx].resetCode = '';
    await saveUsers(users);
    alert('Password updated. You can now login.');
    navigate('/login');
  };

  return (
    <div className="container my-5" style={{ maxWidth: '420px' }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-3">Forgot Password</h2>
          {step === 1 && (
            <>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-primary" onClick={request}>
                Request Reset
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="mb-3">
                <label className="form-label">Reset Code</label>
                <input
                  className="form-control"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-primary" onClick={reset}>
                Reset Password
              </button>
            </>
          )}
          <p className="mt-3 mb-0">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
