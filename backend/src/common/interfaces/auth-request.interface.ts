import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user: {
    sub: string;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
  };
}

export interface AuthRequestWithUser extends Request {
  user: User;
}