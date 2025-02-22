import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private userSupabasae: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_DATABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_API_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    const userSupabaseUrl = process.env.SUPABASE_USER_DATABASE_URL!;
    const userSupabaseAnonKey = process.env.SUPABASE_USER_API_KEY!;
    this.userSupabasae = createClient(userSupabaseUrl, userSupabaseAnonKey);
  }

  getClient() {
    return this.supabase;
  }

  getUserClient() {
    return this.userSupabasae;
  }
}
