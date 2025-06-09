import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET'), // Ensure you have this in your .env
    });

    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_ANON_KEY'),
      {
        auth: {
          storage: null,
        },
      }
    );
  }

  async validate(payload: any): Promise<any> {
    // You might want to fetch the user from Supabase based on the payload
    // to ensure they are still valid or add more user details to the request.
    // For a basic implementation, you can just return the payload.
    // However, validating the token is handled by passport-jwt with the secretOrKey.
    // Additional validation might be needed if you store user roles or permissions in Supabase.
    const { data: user, error } = await this.supabase.auth.getUser(payload.sub); // Assuming 'sub' is the user ID in the JWT

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      return null; // User not found in Supabase, token might be invalid or user deleted
    }

    return user; // Attach the Supabase user object to the request
  }
}