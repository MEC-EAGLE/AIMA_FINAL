import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, hashString } from '../utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const users = await getUsers();
      const hashed = await hashString(password);
      const found = users.find(
        (u: any) => u.email === email && u.password === hashed
      );
      if (found) {
        if (!found.verified) {
          alert('Please verify your account first.');
          navigate(`/verify?email=${encodeURIComponent(email)}`);
          return;
        }
        localStorage.setItem('currentUser', JSON.stringify(found));
        navigate('/dashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch {
      alert('Unable to connect to the database server.');
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '420px' }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-3">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <span
                  className="input-group-text"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowPass(!showPass)}
                >
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </span>
              </div>
              <div className="form-text">
                <Link to="/forgot">Forgot password?</Link>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </form>
          <p className="mt-3 mb-0">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
