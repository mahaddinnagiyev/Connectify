import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(async () => {
    process.env.SUPABASE_DATABASE_URL = 'https://test-db.supabase.co';
    process.env.SUPABASE_API_KEY = 'test-api-key';
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseService],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  describe('getClient', () => {
    it('should return supabase client', async () => {
      const result = service.getClient();

      expect(result).toBeInstanceOf(SupabaseClient);
    });
  });
});
