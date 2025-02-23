import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  
  constructor() {
    const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_API_KEY;
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  getClient() {
    return this.supabase;
  }
}
