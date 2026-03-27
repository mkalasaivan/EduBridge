export type Role = 'STUDENT' | 'MENTOR' | 'ADMIN';

export type ResourceType =
  | 'PDF'
  | 'ARTICLE'
  | 'YOUTUBE'
  | 'GITHUB'
  | 'COURSERA'
  | 'UDEMY'
  | 'KHAN_ACADEMY'
  | 'MEDIUM'
  | 'DEV_TO'
  | 'DOCS'
  | 'OTHER_LINK';

export type ResourceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  content?: string;
  subject: string;
  level: ResourceLevel;
  tags: string[];
  authorId: string;
  author: Partial<User>;
  createdAt: string;
  comments?: any[];
  likes?: any[];
  saves?: any[];
  _count?: {
    likes: number;
    comments: number;
    saves: number;
  };
}

export interface MentorshipRequest {
  id: string;
  subject: string;
  message: string;
  status: RequestStatus;
  studentId: string;
  mentorId: string;
  student: Partial<User>;
  mentor: Partial<User>;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  sentAt: string;
  senderId: string;
  requestId: string;
  sender: Partial<User>;
}
