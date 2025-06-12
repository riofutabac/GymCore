import { Request } from 'express';
import { User, Gym } from '@prisma/client';

export interface AuthRequest extends Request {
  user: {
    sub: string;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
  } | User;
  gymId?: string;
  currentGym?: Partial<Gym>;
}