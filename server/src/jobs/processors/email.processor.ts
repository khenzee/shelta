import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('email')
export class EmailProcessor {
  @Process()
  async process(job: Job<any>) {
    await Promise.resolve();
    console.log('Processing email job:', job.data);
    return { sent: true };
  }
}
