import { User, Post, Group, Message } from './types';

export async function hashString(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const API = 'http://localhost:3001';

async function fetchJSON(key: string): Promise<any> {
  try {
    const res = await fetch(`${API}/${key}`);
    if (!res.ok) throw new Error('Server response not OK');
    return await res.json();
  } catch (err) {
    console.error('Fetch failed for', key, err);
    throw err;
  }
}

async function postJSON(key: string, data: any): Promise<void> {
  try {
    await fetch(`${API}/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error('Post failed for', key, err);
    throw err;
  }
}

export async function getUsers(): Promise<User[]> {
  return await fetchJSON('users');
}

export async function saveUsers(users: User[]) {
  await postJSON('users', users);
}

export async function getPosts(): Promise<Post[]> {
  return await fetchJSON('posts');
}

export async function savePosts(posts: Post[]) {
  await postJSON('posts', posts);
}

export async function getGroups(): Promise<Group[]> {
  return await fetchJSON('groups');
}

export async function saveGroups(groups: Group[]) {
  await postJSON('groups', groups);
}

export async function getMessages(): Promise<Message[]> {
  return await fetchJSON('messages');
}

export async function saveMessages(msgs: Message[]) {
  await postJSON('messages', msgs);
}

export async function sendOtpEmail(email: string, otp: string) {
  await postJSON('send-otp', { email, otp });
}

export function matchCandidates(post: Post, users: User[]) {
  const keywords = [
    ...post.tags.map(t => t.toLowerCase()),
    ...post.title.toLowerCase().split(/\W+/),
  ];
  return users
    .filter(u => u.type === 'member')
    .map(u => {
      const skills = (u.skills || []).map(s => s.toLowerCase());
      const prefs = (u.preferences || []).map(p => p.toLowerCase());
      let score = 0;
      for (const k of keywords) {
        if (skills.includes(k)) score += 2;
        if (prefs.includes(k)) score += 1;
      }
      return { user: u, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

