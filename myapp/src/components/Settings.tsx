import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { getUsers, saveUsers, hashString, getPosts, savePosts } from '../utils';
import type { Attachment } from '../types';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [resumeData, setResumeData] = useState('');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return navigate('/login');
    const me = JSON.parse(stored);
    setUser(me);
    setResumeData(me.resume || '');
    setBio(me.bio || '');
    setSkillsInput((me.skills || []).join(', '));
    setPhoto(me.photo || '');
  }, [navigate]);

  if (!user) return null;

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '600px' }}>
        <h2 className="mb-4">Settings</h2>
        <section className="mb-4">
          <h4>Account Settings</h4>
          <p>
            Email: {user.email}
            <br />
            Phone: {user.phone}
          </p>
          <form
            className="mb-3"
            onSubmit={async e => {
              e.preventDefault();
              const all = await getUsers();
              const idx = all.findIndex((u: any) => u.email === user.email);
              const hashedOld = await hashString(oldPass);
              if (all[idx].password !== hashedOld) {
                alert('Current password incorrect');
                return;
              }
              all[idx].password = await hashString(newPass);
              await saveUsers(all);
              localStorage.setItem('currentUser', JSON.stringify(all[idx]));
              setUser(all[idx]);
              setOldPass('');
              setNewPass('');
              alert('Password updated');
            }}
          >
            <div className="mb-2">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Update Password
            </button>
          </form>
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="snoozeToggle"
              checked={user.snoozed}
              onChange={async () => {
                const all = await getUsers();
                const idx = all.findIndex((u: any) => u.email === user.email);
                all[idx].snoozed = !all[idx].snoozed;
                await saveUsers(all);
                localStorage.setItem('currentUser', JSON.stringify(all[idx]));
                setUser(all[idx]);
              }}
            />
            <label className="form-check-label" htmlFor="snoozeToggle">
              Snooze account
            </label>
          </div>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={async () => {
              if (!window.confirm('Delete your account?')) return;
              const all = await getUsers();
              const remaining = all.filter((u: any) => u.email !== user.email);
              await saveUsers(remaining);
              const p = await getPosts();
              p.forEach(post => {
                post.applicants = post.applicants.filter(a => a !== user.email);
                delete post.statuses[user.email];
              });
              await savePosts(p);
              localStorage.removeItem('currentUser');
              navigate('/');
            }}
          >
            Delete Account
          </button>
        </section>

        <section>
          <h4>Profile</h4>
          <form
            onSubmit={async e => {
              e.preventDefault();
              const all = await getUsers();
              const idx = all.findIndex((u: any) => u.email === user.email);
              all[idx].resume = resumeData;
              all[idx].bio = bio;
              if (user.type === 'member') {
                all[idx].skills = skillsInput
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s);
              }
              all[idx].docs = user.docs || [];
              if (photo) all[idx].photo = photo;
              await saveUsers(all);
              localStorage.setItem('currentUser', JSON.stringify(all[idx]));
              setUser(all[idx]);
            }}
          >
            {user.type === 'member' && (
              <div className="mb-3">
                <label className="form-label">Skills (comma separated)</label>
                <input
                  className="form-control"
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => setPhoto(reader.result as string);
                  reader.readAsDataURL(f);
                }}
              />
              {user.photo && (
                <img
                  src={photo || user.photo}
                  alt="profile"
                  className="mt-2"
                  style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Bio</label>
              <textarea
                className="form-control"
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
            {user.type === 'member' && (
              <div className="mb-3">
                <label className="form-label">Resume</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="form-control"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => setResumeData(reader.result as string);
                    reader.readAsDataURL(f);
                  }}
                />
              </div>
            )}
            {user.type === 'member' && (
              <div className="mb-3">
                <label className="form-label">Add Document</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setDocFile(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary mt-1"
                  onClick={() => {
                    if (!docFile) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const newDoc: Attachment = {
                        name: docFile.name,
                        data: reader.result as string,
                      };
                      const docs = user.docs ? [...user.docs, newDoc] : [newDoc];
                      setUser({ ...user, docs });
                    };
                    reader.readAsDataURL(docFile);
                  }}
                >
                  Add Document
                </button>
                </div>
            )}
            {user.docs && user.docs.length > 0 && (
              <ul className="list-group mb-3">
                {user.docs.map((d: Attachment, i: number) => (
                  <li key={i} className="list-group-item">
                    <a href={d.data} download={d.name} className="link-primary">
                      {d.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
          </form>

          <div className="mt-4">
            <h5>Profile View Requests</h5>
            <ul className="list-group">
              {(user.profileRequests || []).map((r: string) => (
                <li key={r} className="list-group-item d-flex justify-content-between align-items-center">
                  {r}
                  <span>
                    <button
                      type="button"
                      className="btn btn-sm btn-success me-2"
                      onClick={async () => {
                        const all = await getUsers();
                        const idx = all.findIndex((u: any) => u.email === user.email);
                        all[idx].profileRequests = all[idx].profileRequests.filter((x: string) => x !== r);
                        all[idx].profileShares = [...(all[idx].profileShares || []), r];
                        await saveUsers(all);
                        localStorage.setItem('currentUser', JSON.stringify(all[idx]));
                        setUser(all[idx]);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={async () => {
                        const all = await getUsers();
                        const idx = all.findIndex((u: any) => u.email === user.email);
                        all[idx].profileRequests = all[idx].profileRequests.filter((x: string) => x !== r);
                        await saveUsers(all);
                        localStorage.setItem('currentUser', JSON.stringify(all[idx]));
                        setUser(all[idx]);
                      }}
                    >
                      Decline
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {user.recommendations && user.recommendations.length > 0 && (
            <div className="mt-4">
              <h5>Recommendations</h5>
              <ul className="list-group">
                {user.recommendations.map((r: any, i: number) => (
                  <li key={i} className="list-group-item">
                    <strong>{r.from}</strong>: {r.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

