import { SessionData } from 'express-session';

export interface UserSession extends SessionData {
  ip: string;
  userAgent: string;
  userId: string;
  state?: Record<string, any>;
}
