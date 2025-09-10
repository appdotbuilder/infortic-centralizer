import { db } from '../db';
import { jobsTable } from '../db/schema';
import { type Job, type JobFilter } from '../schema';
import { and, eq, gte } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

export async function getJobs(filter?: JobFilter): Promise<Job[]> {
  // Apply defaults if no filter is provided
  const safeFilter: JobFilter = {
    limit: 20,
    offset: 0,
    ...filter
  };
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [];

    // Always exclude expired jobs (deadline must be in the future)
    const now = new Date();
    conditions.push(gte(jobsTable.deadline, now));

    // Add optional filters
    if (safeFilter.location) {
      conditions.push(eq(jobsTable.location, safeFilter.location));
    }

    if (safeFilter.company) {
      conditions.push(eq(jobsTable.company, safeFilter.company));
    }

    if (safeFilter.required_experience) {
      conditions.push(eq(jobsTable.required_experience, safeFilter.required_experience));
    }

    // Build the complete query
    const results = await db.select()
      .from(jobsTable)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(jobsTable.deadline)
      .limit(safeFilter.limit)
      .offset(safeFilter.offset)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    throw error;
  }
}