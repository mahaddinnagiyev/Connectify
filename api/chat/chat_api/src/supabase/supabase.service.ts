import { Injectable } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
    const supabaseKey = process.env.SUPABASE_DATABASE_KEY;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient() {
    return this.supabase;
  }
}
