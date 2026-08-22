import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private supabase;

  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) {
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL')!,
      this.config.get<string>('SUPABASE_ANON_KEY')!,
    );
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new UnauthorizedException('Email atau password salah');

    const payload = { sub: data.user.id, email: data.user.email };
    const token = this.jwt.sign(payload);

    return {
      access_token: token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      },
    };
  }

  async register(name: string, email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) throw new UnauthorizedException(error.message);

    return { message: 'Registrasi berhasil!' };
  }
}