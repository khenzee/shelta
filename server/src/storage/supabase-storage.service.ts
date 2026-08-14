import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvironmentVariables } from '../config/environment';

@Injectable()
export class SupabaseStorageService {
  private readonly client: SupabaseClient | null;
  private readonly bucket: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const url = config.get('SUPABASE_URL', { infer: true });
    const serviceRoleKey = config.get('SUPABASE_SERVICE_ROLE_KEY', {
      infer: true,
    });
    this.bucket = config.get('SUPABASE_STORAGE_BUCKET', { infer: true });
    this.client =
      url && serviceRoleKey
        ? createClient(url, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          })
        : null;
  }

  isConfigured() {
    return this.client !== null;
  }

  async createSignedDownloadUrl(path: string, expiresInSeconds = 60) {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Supabase Storage is not configured',
      );
    }

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) throw error;
    return data.signedUrl;
  }
}
