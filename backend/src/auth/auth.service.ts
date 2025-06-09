import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_ANON_KEY'),
      {
        auth: {
          storage: null, // Use cookies or other storage appropriate for your app
        },
      }
    );
  }

  async login({ email, password }: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return data;
  }

  async register({ email, password }: RegisterDto) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) {
      throw new UnauthorizedException(error.message);
    }
    return data;
  }

  async getProfile(accessToken: string) {
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error) {
      throw new UnauthorizedException('Invalid token');
    }
    return data.user;
  }
}