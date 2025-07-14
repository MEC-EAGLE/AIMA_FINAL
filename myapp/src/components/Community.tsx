import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { getUsers, saveUsers, getGroups, saveGroups } from '../utils';

export default function Community() {
  const [current, setCurrent] = useState(null as any);
  const [users, setUsers] = useState([] as any[]);
  const [groups, setGroups] = useState([] as any[]);
  const [newGroupName, setNewGroupName] = useState('');
  const [view, setView] = useState('members' as 'members' | 'groups' | 'dms');
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (!u) return navigate('/login');
    const me = JSON.parse(u);
    setCurrent(me);
    getUsers().then(all => setUsers(all.filter(x => x.email !== me.email)));
    getGroups().then(gs => setGroups(gs));
  }, [navigate]);

  const toggleFollow = async (email: string) => {
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === current.email);
    const followers = new Set(all[idx].followers);
    if (followers.has(email)) {
      followers.delete(email);
    } else {
      followers.add(email);
    }
    all[idx].followers = Array.from(followers);
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idx]));
    setUsers(all.filter(x => x.email !== all[idx].email));
  };

  const toggleJoinGroup = async (id: number) => {
    const all = await getGroups();
    const idx = all.findIndex(g => g.id === id);
    if (idx === -1) return;
    const members = new Set(all[idx].members);
    if (members.has(current.email)) {
      members.delete(current.email);
    } else if (all[idx].invites && all[idx].invites.includes(current.email)) {
      members.add(current.email);
      all[idx].invites = all[idx].invites.filter((e: string) => e !== current.email);
    } else {
      return;
    }
    all[idx].members = Array.from(members);
    await saveGroups(all);
    setGroups(all);
  };

  const createGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    const all = await getGroups();
    const id = Date.now();
    all.push({ id, name, members: [current.email], invites: [] });
    await saveGroups(all);
    setGroups(all);
    setNewGroupName('');
  };

  const inviteToGroup = async (id: number) => {
    const email = prompt('Enter member email to invite');
    if (!email) return;
    const us = await getUsers();
    const target = us.find(u => u.email === email && u.type === 'member');
    if (!target) {
      alert('Member not found');
      return;
    }
    const all = await getGroups();
    const idx = all.findIndex(g => g.id === id);
    if (idx === -1) return;
    if (!all[idx].invites) all[idx].invites = [];
    if (!all[idx].members.includes(email) && !all[idx].invites.includes(email)) {
      all[idx].invites.push(email);
      await saveGroups(all);
      setGroups(all);
    }
  };

  const requestProfile = async (email: string) => {
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === email);
    if (!all[idx].profileRequests) all[idx].profileRequests = [];
    if (!all[idx].profileRequests.includes(current.email)) {
      all[idx].profileRequests.push(current.email);
      await saveUsers(all);
      setUsers(all.filter(x => x.email !== current.email));
    }
  };

  const toggleBlock = async (email: string) => {
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === current.email);
    const set = new Set(all[idx].blocked || []);
    if (set.has(email)) set.delete(email); else set.add(email);
    all[idx].blocked = Array.from(set);
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idx]));
    setCurrent(all[idx]);
    setUsers(all.filter(x => x.email !== all[idx].email));
  };

  const sendDmInvite = async (email: string) => {
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === email);
    if (idx === -1) return;
    if (!all[idx].dmInvites) all[idx].dmInvites = [];
    if (
      !all[idx].dmInvites.includes(current.email) &&
      !(all[idx].dmContacts || []).includes(current.email)
    ) {
      all[idx].dmInvites.push(current.email);
      await saveUsers(all);
      setUsers(all.filter(x => x.email !== current.email));
    }
  };

  const acceptDmInvite = async (email: string) => {
    const all = await getUsers();
    const meIdx = all.findIndex(u => u.email === current.email);
    const otherIdx = all.findIndex(u => u.email === email);
    if (meIdx === -1 || otherIdx === -1) return;
    all[meIdx].dmInvites = (all[meIdx].dmInvites || []).filter((e: string) => e !== email);
    if (!all[meIdx].dmContacts) all[meIdx].dmContacts = [];
    if (!all[otherIdx].dmContacts) all[otherIdx].dmContacts = [];
    if (!all[meIdx].dmContacts.includes(email)) all[meIdx].dmContacts.push(email);
    if (!all[otherIdx].dmContacts.includes(current.email)) all[otherIdx].dmContacts.push(current.email);
    await saveUsers(all);
    const me = all[meIdx];
    setCurrent(me);
    localStorage.setItem('currentUser', JSON.stringify(me));
    setUsers(all.filter(x => x.email !== me.email));
  };

  const declineDmInvite = async (email: string) => {
    const all = await getUsers();
    const meIdx = all.findIndex(u => u.email === current.email);
    if (meIdx === -1) return;
    all[meIdx].dmInvites = (all[meIdx].dmInvites || []).filter((e: string) => e !== email);
    await saveUsers(all);
    const me = all[meIdx];
    setCurrent(me);
    localStorage.setItem('currentUser', JSON.stringify(me));
  };

  const profileComplete = (u: any) =>
    u.skills && u.skills.length > 0 && u.bio && u.resume;

  const recommend = async (email: string) => {
    const target = users.find(x => x.email === email);
    if (!profileComplete(current)) {
      alert('Complete your profile before giving a recommendation.');
      return;
    }
    if (!target || !profileComplete(target)) {
      alert('User must have a complete profile to receive recommendations.');
      return;
    }
    const text = prompt('Enter your recommendation');
    if (!text) return;
    const all = await getUsers();
    const idx = all.findIndex(u => u.email === email);
    if (!all[idx].recommendations) all[idx].recommendations = [];
    all[idx].recommendations.push({
      from: current.email,
      text,
      timestamp: Date.now(),
    });
    await saveUsers(all);
    setUsers(all.filter(x => x.email !== current.email));
  };

  if (!current) return null;

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '600px' }}>
        <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-3">Community</h2>
          <nav className="nav nav-tabs mb-3">
            <button
              type="button"
              className={`nav-link ${view === 'members' ? 'active' : ''}`}
              onClick={() => setView('members')}
            >
              Members
            </button>
            <button
              type="button"
              className={`nav-link ${view === 'groups' ? 'active' : ''}`}
              onClick={() => setView('groups')}
            >
              Groups
            </button>
            <button
              type="button"
              className={`nav-link ${view === 'dms' ? 'active' : ''}`}
              onClick={() => setView('dms')}
            >
              DMs
            </button>
          </nav>
          {view === 'members' && (
            <ul className="list-group list-group-flush">
              {users.map(u => (
                <li
                  key={u.email}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span className="d-flex align-items-center">
                    {u.photo && (
                      <img
                        src={u.photo}
                        alt="pfp"
                        style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%', marginRight: '6px' }}
                      />
                    )}
                    {u.contactName}
                  </span>
                  <div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => toggleFollow(u.email)}
                    >
                      {current.followers.includes(u.email) ? 'Unfollow' : 'Follow'}
                    </button>
                    {current.type === 'org' && u.type === 'member' ? (
                      <Link
                        to={`/profile/${u.email}`}
                        className="btn btn-sm btn-outline-info me-2"
                      >
                        View Profile
                      </Link>
                    ) : u.profileShares && u.profileShares.includes(current.email) ? (
                      <Link
                        to={`/profile/${u.email}`}
                        className="btn btn-sm btn-outline-info me-2"
                      >
                        View Profile
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() => requestProfile(u.email)}
                        disabled={u.profileRequests && u.profileRequests.includes(current.email)}
                      >
                        {u.profileRequests && u.profileRequests.includes(current.email)
                          ? 'Requested'
                          : 'Request Profile'}
                      </button>
                    )}
                    {current.dmContacts?.includes(u.email) ||
                    (u.dmContacts && u.dmContacts.includes(current.email)) ? (
                      <Link to={`/chat/${u.email}`} className="btn btn-sm btn-secondary me-2">
                        Message
                      </Link>
                    ) : current.dmInvites?.includes(u.email) ? (
                      <span className="me-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-success me-1"
                          onClick={() => acceptDmInvite(u.email)}
                        >
                          Accept DM
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => declineDmInvite(u.email)}
                        >
                          Decline
                        </button>
                      </span>
                    ) : u.dmInvites && u.dmInvites.includes(current.email) ? (
                      <button type="button" className="btn btn-sm btn-outline-secondary me-2" disabled>
                        Invite Sent
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary me-2"
                        onClick={() => sendDmInvite(u.email)}
                      >
                        DM Invite
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => toggleBlock(u.email)}
                    >
                      {current.blocked && current.blocked.includes(u.email)
                        ? 'Unblock'
                        : 'Block'}
                    </button>
                    {profileComplete(current) && profileComplete(u) && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success ms-2"
                        onClick={() => recommend(u.email)}
                      >
                        Recommend
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {view === 'groups' && (
            <div>
              <ul className="list-group list-group-flush">
                {groups.map(g => (
                  <li
                    key={g.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{g.name}</span>
                    <div>
                      {g.members.includes(current.email) ||
                      (g.invites && g.invites.includes(current.email)) ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => toggleJoinGroup(g.id)}
                        >
                          {g.members.includes(current.email) ? 'Leave' : 'Accept'}
                        </button>
                      ) : null}
                      {g.members.includes(current.email) && (
                        <>
                          <Link
                            to={`/chat/group-${g.id}`}
                            className="btn btn-sm btn-secondary me-2"
                          >
                            Message
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => inviteToGroup(g.id)}
                          >
                            Invite
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="input-group mt-3">
                <input
                  className="form-control"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="New group"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={createGroup}
                >
                  Create
                </button>
              </div>
            </div>
          )}
          {view === 'dms' && (
            <div>
              <h5>Your Chats</h5>
              <ul className="list-group mb-3">
                {(current.dmContacts || []).map(email => (
                  <li key={email} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{users.find(u => u.email === email)?.contactName || email}</span>
                    <Link to={`/chat/${email}`} className="btn btn-sm btn-secondary">
                      Message
                    </Link>
                  </li>
                ))}
              </ul>
              {current.dmInvites && current.dmInvites.length > 0 && (
                <div>
                  <h5>Pending Invites</h5>
                  <ul className="list-group">
                    {current.dmInvites.map((e: string) => (
                      <li key={e} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{users.find(u => u.email === e)?.contactName || e}</span>
                        <span>
                          <button
                            type="button"
                            className="btn btn-sm btn-success me-2"
                            onClick={() => acceptDmInvite(e)}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => declineDmInvite(e)}
                          >
                            Decline
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
