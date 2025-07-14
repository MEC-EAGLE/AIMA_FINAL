import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, saveUsers, hashString, sendOtpEmail } from '../utils';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [resume, setResume] = useState('');
  const [type, setType] = useState('member');
  const [skills, setSkills] = useState('');
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!/^[A-Za-z ]{2,50}$/.test(contactName.trim())) {
      alert('Full Name should contain only letters and spaces (2-50 chars)');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert('Enter a valid email address');
      return;
    }
    const users = await getUsers();
    if (users.some((u: any) => u.email === email)) {
      alert('Email already registered');
      return;
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)
    ) {
      alert('Password must be 8+ chars with uppercase, lowercase, digit and special char');
      return;
    }
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    if (!/^\+?\d{8,15}$/.test(phone)) {
      alert('Enter a valid phone number');
      return;
    }
    const generic = ['info@', 'contact@', 'noreply@'];
    if (type === 'org' && generic.some(g => email.startsWith(g))) {
      alert('Please use a real contact email for your organization.');
      return;
    }
    if (type === 'member' && skills.split(',').filter(s => s.trim()).length === 0) {
      alert('Please list your skills');
      return;
    }
    if (!agree) {
      alert('You must agree to the terms');
      return;
    }
    const hashed = await hashString(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser: any = {
      email,
      password: hashed,
      phone,
      contactName,
      type,
      verified: false,
      verificationCode: otp,
      followers: [],
      groups: [],
      docs: [],
      profileRequests: [],
      profileShares: [],
      recommendations: [],
      resume,
      bio: '',
      events: [],
      notes: [],
      snoozed: false,
      blocked: [],
      dmContacts: [],
      dmInvites: [],
      resetCode: '',
    };
    if (type === 'member') {
      newUser.skills = skills
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s);
    }
    if (type === 'org') {
      newUser.peopleMap = [];
    }
    users.push(newUser);
    await saveUsers(users);
    try {
      await sendOtpEmail(email, otp);
      alert('Verification code sent to your email.');
    } catch (err) {
      console.error('Email sending failed', err);
      alert('Verification code could not be emailed. Code: ' + otp);
    }
    navigate(`/verify?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="container my-5" style={{ maxWidth: '420px' }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-3">Register</h2>
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
          <label className="form-label">Phone</label>
          <input
            type="tel"
            className="form-control"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            className="form-control"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Resume (optional)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="form-control"
            onChange={e => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 5 * 1024 * 1024) {
                alert('Resume must be under 5MB');
                return;
              }
              const reader = new FileReader();
              reader.onload = () => setResume(reader.result as string);
              reader.readAsDataURL(f);
            }}
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
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <div className="input-group">
            <input
              type={showConfirm ? 'text' : 'password'}
              className="form-control"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            <span
              className="input-group-text"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </span>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">User Type</label>
          <select
            className="form-select"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="member">Community Member</option>
            <option value="org">Organization</option>
          </select>
        </div>
        {type === 'member' && (
          <div className="mb-3">
            <label className="form-label">Skills (comma separated)</label>
            <input
              className="form-control"
              value={skills}
              onChange={e => setSkills(e.target.value)}
            />
          </div>
        )}
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="agree"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            required
          />
          <label className="form-check-label" htmlFor="agree">
            I agree to the terms
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
          </form>
          <p className="mt-3 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
