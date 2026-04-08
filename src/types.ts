export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'student';
  createdAt: any;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timerMinutes: number;
  createdBy: string;
  createdAt: any;
  isPublished: boolean;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  order: number;
}

export interface Attempt {
  id: string;
  quizId: string;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  startTime: any;
  endTime: any;
  status: 'in-progress' | 'completed';
}

export interface LiveSession {
  id: string;
  quizId: string;
  userId: string;
  userName: string;
  lastActive: any;
}
