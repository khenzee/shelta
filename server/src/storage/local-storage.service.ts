import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve, sep } from 'node:path';
import { EnvironmentVariables } from '../config/environment';

@Injectable()
export class LocalStorageService {
  private readonly root: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    this.root = resolve(config.get('STORAGE_LOCAL_ROOT', { infer: true }));
  }

  resolvePrivateFile(storageKey: string) {
    const filePath = resolve(this.root, storageKey);
    if (filePath !== this.root && !filePath.startsWith(`${this.root}${sep}`)) {
      throw new Error('Invalid storage key');
    }

    return filePath;
  }
}
