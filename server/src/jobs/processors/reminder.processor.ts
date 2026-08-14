import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('reminders')
export class ReminderProcessor {
  @Process()
  async process(job: Job<any>) {
    await Promise.resolve();
    console.log('Processing reminder job:', job.data);
    return { sent: true };
  }
}
