import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Nav from './Nav';
import { getUsers } from '../utils';
import type { Attachment } from '../types';

export default function Profile() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [viewer, setViewer] = useState(null as any);
  const [user, setUser] = useState(null as any);
  const [allUsers, setAllUsers] = useState([] as any[]);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return navigate('/login');
    const me = JSON.parse(stored);
    setViewer(me);
    getUsers().then(all => {
      setAllUsers(all);
      const found = all.find((u: any) => u.email === email);
      if (!found) return navigate('/community');
      setUser(found);
    });
  }, [email, navigate]);

  if (!viewer || !user) return null;

  const allowed =
    viewer.email === user.email ||
    (user.profileShares || []).includes(viewer.email) ||
    (viewer.type === 'org' && user.type === 'member');

  if (!allowed) {
    return (
      <div>
        <Nav />
        <div className="container my-4" style={{ maxWidth: '600px' }}>
          <h4>Profile access not granted.</h4>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '600px' }}>
        <div className="d-flex align-items-center mb-2">
          {user.photo && (
            <img
              src={user.photo}
              alt="profile"
              style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '50%', marginRight: '10px' }}
            />
          )}
          <div>
            <h2 className="mb-0">{user.contactName}'s Profile</h2>
            <p className="text-muted mb-0">Email: {user.email}</p>
          </div>
        </div>
        <h5>Skills</h5>
        <p>{(user.skills || []).join(', ') || 'No skills listed'}</p>
        {user.bio && (
          <div className="mb-2">
            <h5>Bio</h5>
            <p>{user.bio}</p>
          </div>
        )}
        {user.docs && user.docs.length > 0 && (
          <div>
            <h5>Documents</h5>
            <ul className="list-group">
              {user.docs.map((d: Attachment, i: number) => (
                <li key={i} className="list-group-item">
                  <a href={d.data} download={d.name} className="link-primary">
                    {d.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {user.recommendations && user.recommendations.length > 0 && (
          <div className="mt-3">
            <h5>Recommendations</h5>
            <ul className="list-group">
              {user.recommendations.map((r: any, i: number) => (
                <li key={i} className="list-group-item">
                  <strong>
                    {allUsers.find(u => u.email === r.from)?.contactName || r.from}
                  </strong>
                  : {r.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
