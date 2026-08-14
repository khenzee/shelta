import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('reports')
export class ReportProcessor {
  @Process()
  async process(job: Job<any>) {
    await Promise.resolve();
    console.log('Processing report job:', job.data);
    return { generated: true };
  }
}
