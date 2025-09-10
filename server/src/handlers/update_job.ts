import { db } from '../db';
import { jobsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateJobInput, type Job } from '../schema';

export async function updateJob(input: UpdateJobInput): Promise<Job | null> {
  try {
    const { id, ...updateFields } = input;
    
    // Only proceed if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      // If no fields to update, return the existing job
      const existingJob = await db.select()
        .from(jobsTable)
        .where(eq(jobsTable.id, id))
        .execute();
      
      return existingJob.length > 0 ? existingJob[0] : null;
    }

    // Update the job with current timestamp
    const result = await db.update(jobsTable)
      .set({
        ...updateFields,
        updated_at: new Date()
      })
      .where(eq(jobsTable.id, id))
      .returning()
      .execute();

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Job update failed:', error);
    throw error;
  }
}