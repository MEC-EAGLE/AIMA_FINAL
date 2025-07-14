export interface User {
  email: string;
  password: string;
  phone: string;
  contactName: string;
  photo?: string;
  type: 'member' | 'org' | 'admin';
  verified: boolean;
  followers: string[];
  groups: number[];
  skills?: string[];
  resume?: string;
  bio?: string;
  docs: Attachment[];
  profileRequests: string[];
  profileShares: string[];
  recommendations?: Recommendation[];
  events: CalendarEvent[];
  notes: Note[];
  peopleMap?: PeopleNeed[];
  snoozed?: boolean;
  blocked?: string[];
  dmContacts?: string[];
  dmInvites?: string[];
  verificationCode?: string;
  resetCode?: string;
}

export interface Recommendation {
  from: string;
  text: string;
  timestamp: number;
}

export interface Comment {
  userEmail: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: number;
  authorEmail: string;
  authorType: 'member' | 'org';
  title: string;
  description: string;
  postType: 'job' | 'internship' | 'volunteering' | 'project';
  tags: string[];
  applicants: string[];
  statuses: Record<string, string>;
  comments: Comment[];
}

export interface Group {
  id: number;
  name: string;
  members: string[];
  invites?: string[];
}

export interface Attachment {
  name: string;
  data: string;
}

export interface Message {
  from: string;
  to: string;
  text: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  alert: boolean;
}

export interface Note {
  id: number;
  text: string;
  timestamp: number;
}

export interface PeopleNeed {
  role: string;
  count: number;
}
