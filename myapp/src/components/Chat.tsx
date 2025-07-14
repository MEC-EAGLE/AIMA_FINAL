import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  getMessages,
  saveMessages,
  getGroups,
  getUsers,
  saveGroups,
} from '../utils';

export default function Chat() {
  const { email } = useParams();
  const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState([] as any[]);
  const [targetName, setTargetName] = useState(email || '');
  const [canChat, setCanChat] = useState(false);
  const [files, setFiles] = useState([] as { name: string; data: string }[]);
  const [group, setGroup] = useState<any>(null);
  const [users, setUsers] = useState([] as any[]);
  const [inviteFromOther, setInviteFromOther] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    getMessages().then(all =>
      setMsgs(
        all.filter(m => {
          if (email?.startsWith('group-')) {
            return m.to === email;
          }
          return (
            (m.from === current.email && m.to === email) ||
            (m.from === email && m.to === current.email)
          );
        })
      )
    );
    if (!email) return;
    getUsers().then(us => {
      setUsers(us);
      const me = us.find(u => u.email === current.email);
      const other = us.find(u => u.email === email);
      const blocked =
        other?.blocked?.includes(current.email) || me?.blocked?.includes(email);
      const snoozed = me?.snoozed || other?.snoozed;
      let allowed = !blocked && !snoozed;
      if (!email?.startsWith('group-') && me && other) {
        const connected =
          (me.dmContacts || []).includes(email) ||
          (other.dmContacts || []).includes(current.email);
        const fromOther = (me.dmInvites || []).includes(email);
        const sent = (other.dmInvites || []).includes(current.email);
        setInviteFromOther(fromOther);
        setInviteSent(sent);
        allowed = allowed && connected;
      }
      setCanChat(allowed);
      if (other) {
        setTargetName(other.contactName);
      }
    });
    if (email?.startsWith('group-')) {
      const id = parseInt(email.slice(6), 10);
      getGroups().then(gs => {
        const g = gs.find(x => x.id === id);
        setGroup(g);
        setTargetName(g ? g.name : email);
        if (g) {
          const member = g.members.includes(current.email);
          setCanChat(prev => member && prev);
        }
      });
    } else {
      setTargetName(email || '');
    }
  }, [email]);

  const send = async () => {
    if ((!text && files.length === 0) || !canChat) return;
    const all = await getMessages();
    all.push({
      from: current.email,
      to: email!,
      text,
      timestamp: Date.now(),
      attachments: files.length > 0 ? files : undefined,
    });
    await saveMessages(all);
    setMsgs(
      all.filter(m => {
        if (email?.startsWith('group-')) {
          return m.to === email;
        }
        return (
          (m.from === current.email && m.to === email) ||
          (m.from === email && m.to === current.email)
        );
      })
    );
    setText('');
    setFiles([]);
  };

  const deleteMessage = async (timestamp: number) => {
    const all = await getMessages();
    const filtered = all.filter(m => m.timestamp !== timestamp);
    await saveMessages(filtered);
    setMsgs(msgs.filter(m => m.timestamp !== timestamp));
  };

  const inviteToGroup = async () => {
    if (!email?.startsWith('group-') || !group) return;
    const memberEmail = prompt('Enter member email to invite');
    if (!memberEmail) return;
    const us = await getUsers();
    const target = us.find(u => u.email === memberEmail && u.type === 'member');
    if (!target) {
      alert('Member not found');
      return;
    }
    const all = await getGroups();
    const idx = all.findIndex(g => g.id === group.id);
    if (idx === -1) return;
    if (!all[idx].invites) all[idx].invites = [];
    if (
      !all[idx].members.includes(memberEmail) &&
      !all[idx].invites.includes(memberEmail)
    ) {
      all[idx].invites.push(memberEmail);
      await saveGroups(all);
      setGroup(all[idx]);
    }
  };

  const acceptInvite = async () => {
    if (!group) return;
    const all = await getGroups();
    const idx = all.findIndex(g => g.id === group.id);
    if (idx === -1) return;
    if (!all[idx].members.includes(current.email)) {
      all[idx].members.push(current.email);
      all[idx].invites = (all[idx].invites || []).filter(
        (e: string) => e !== current.email
      );
      await saveGroups(all);
      setGroup(all[idx]);
      setCanChat(true);
    }
  };

  const acceptDm = async () => {
    const all = await getUsers();
    const idxMe = all.findIndex(u => u.email === current.email);
    const idxOther = all.findIndex(u => u.email === email);
    if (idxMe === -1 || idxOther === -1) return;
    all[idxMe].dmInvites = (all[idxMe].dmInvites || []).filter((e: string) => e !== email);
    if (!all[idxMe].dmContacts) all[idxMe].dmContacts = [];
    if (!all[idxOther].dmContacts) all[idxOther].dmContacts = [];
    if (!all[idxMe].dmContacts.includes(email)) all[idxMe].dmContacts.push(email);
    if (!all[idxOther].dmContacts.includes(current.email)) all[idxOther].dmContacts.push(current.email);
    await saveUsers(all);
    localStorage.setItem('currentUser', JSON.stringify(all[idxMe]));
    setInviteFromOther(false);
    setCanChat(true);
  };

  return (
    <div className="container my-4" style={{ maxWidth: '700px' }}>
      <div className="card">
        <div className="card-body">
          <h3 className="card-title d-flex align-items-center">
            {email && !email.startsWith('group-') && (
              <img
                src={users.find(u => u.email === email)?.photo || ''}
                alt="pfp"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  marginRight: '6px',
                }}
              />
            )}
            <span>Chat with {targetName}</span>
          </h3>
          <div
            style={{
              height: '200px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            }}
          >
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`d-flex mb-2 ${
                  m.from === current.email ? 'justify-content-end' : 'justify-content-start'
                }`}
              >
                {m.from !== current.email && (
                  <img
                    src={users.find(u => u.email === m.from)?.photo || ''}
                    alt="pfp"
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      marginRight: '6px',
                    }}
                  />
                )}
                <div>
                  <small>
                    {m.from === current.email
                      ? 'You'
                      : users.find(u => u.email === m.from)?.contactName || m.from}
                  </small>
                  <p className="mb-1">{m.text}</p>
                  {m.attachments &&
                    m.attachments.map((a: any, j: number) => (
                      <div key={j}>
                        <a href={a.data} download={a.name}>
                          {a.name}
                        </a>
                      </div>
                    ))}
                  {m.from === current.email && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => deleteMessage(m.timestamp)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                {m.from === current.email && (
                  <img
                    src={current.photo || ''}
                    alt="pfp"
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      marginLeft: '6px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          {files.length > 0 && (
            <ul className="list-group mb-2">
              {files.map((f, i) => (
                <li key={i} className="list-group-item p-1">
                  {f.name}
                </li>
              ))}
            </ul>
          )}
          <div className="mb-2">
            <input
              type="file"
              multiple
              className="form-control form-control-sm"
              onChange={e => {
                const fl = Array.from(e.target.files || []);
                Promise.all(
                  fl.map(
                    f =>
                      new Promise<string>((res, rej) => {
                        const reader = new FileReader();
                        reader.onload = () => res(reader.result as string);
                        reader.onerror = () => rej();
                        reader.readAsDataURL(f);
                      })
                  )
                ).then(data =>
                  setFiles(
                    data.map((d, idx) => ({ name: fl[idx].name, data: d }))
                  )
                );
              }}
              disabled={!canChat}
            />
          </div>
          <div className="input-group mt-2">
            <input
              className="form-control"
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={!canChat}
            />
            <button type="button" className="btn btn-primary" onClick={send} disabled={!canChat}>
              Send
            </button>
          </div>
          {email?.startsWith('group-') &&
            group &&
            !group.members.includes(current.email) &&
            group.invites &&
            group.invites.includes(current.email) && (
              <button
                type="button"
                className="btn btn-sm btn-primary mt-2"
                onClick={acceptInvite}
              >
                Accept Invite
              </button>
            )}
          {email?.startsWith('group-') && group && group.members.includes(current.email) && (
            <button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={inviteToGroup}>
              Invite Member
            </button>
          )}
          {!email?.startsWith('group-') && inviteFromOther && !canChat && (
            <button type="button" className="btn btn-sm btn-primary mt-2" onClick={acceptDm}>
              Accept DM Invite
            </button>
          )}
          {!email?.startsWith('group-') && inviteSent && !canChat && (
            <div className="text-muted mt-2">Waiting for invite acceptance</div>
          )}
          {!canChat && (
            <div className="text-danger mt-2">Messaging is unavailable</div>
          )}
        </div>
      </div>
    </div>
  );
}
