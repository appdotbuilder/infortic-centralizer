import { db } from '../db';
import { jobsTable } from '../db/schema';
import { type Job, type IdParam } from '../schema';
import { eq, gte } from 'drizzle-orm';

export async function getJobById(params: IdParam): Promise<Job | null> {
  try {
    // Query job by ID and ensure it's not expired (deadline >= current date)
    const currentDate = new Date();
    
    const result = await db.select()
      .from(jobsTable)
      .where(
        eq(jobsTable.id, params.id)
      )
      .execute();

    if (result.length === 0) {
      return null;
    }

    const job = result[0];
    
    // Check if job is expired (deadline has passed)
    if (job.deadline < currentDate) {
      return null;
    }

    return job;
  } catch (error) {
    console.error('Failed to get job by ID:', error);
    throw error;
  }
}