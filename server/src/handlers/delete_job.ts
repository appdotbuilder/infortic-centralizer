import { db } from '../db';
import { jobsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type IdParam } from '../schema';

export async function deleteJob(params: IdParam): Promise<boolean> {
  try {
    // Attempt to delete the job with the given ID
    const result = await db.delete(jobsTable)
      .where(eq(jobsTable.id, params.id))
      .returning()
      .execute();

    // Return true if a job was deleted, false if no job was found
    return result.length > 0;
  } catch (error) {
    console.error('Job deletion failed:', error);
    throw error;
  }
}