import { Injectable } from '@nestjs/common';

@Injectable()
export class SupabaseStrategy {
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}