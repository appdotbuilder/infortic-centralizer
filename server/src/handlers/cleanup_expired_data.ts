import { db } from '../db';
import { competitionsTable, jobsTable, scholarshipsTable } from '../db/schema';
import { lt } from 'drizzle-orm';

export interface CleanupResult {
  competitions_deleted: number;
  jobs_deleted: number;
  scholarships_deleted: number;
  total_deleted: number;
}

export async function cleanupExpiredData(): Promise<CleanupResult> {
  try {
    const now = new Date();

    // Delete expired competitions where deadline_registration_date < current date
    const deletedCompetitions = await db.delete(competitionsTable)
      .where(lt(competitionsTable.deadline_registration_date, now))
      .returning()
      .execute();

    // Delete expired jobs where deadline < current date
    const deletedJobs = await db.delete(jobsTable)
      .where(lt(jobsTable.deadline, now))
      .returning()
      .execute();

    // Delete expired scholarships where deadline < current date
    const deletedScholarships = await db.delete(scholarshipsTable)
      .where(lt(scholarshipsTable.deadline, now))
      .returning()
      .execute();

    const competitions_deleted = deletedCompetitions.length;
    const jobs_deleted = deletedJobs.length;
    const scholarships_deleted = deletedScholarships.length;
    const total_deleted = competitions_deleted + jobs_deleted + scholarships_deleted;

    return {
      competitions_deleted,
      jobs_deleted,
      scholarships_deleted,
      total_deleted
    };
  } catch (error) {
    console.error('Cleanup expired data failed:', error);
    throw error;
  }
}