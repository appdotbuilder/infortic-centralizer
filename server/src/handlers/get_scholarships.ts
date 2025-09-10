import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { type Scholarship, type ScholarshipFilter } from '../schema';
import { and, eq, gte, desc, type SQL } from 'drizzle-orm';

export const getScholarships = async (filter: ScholarshipFilter = { limit: 20, offset: 0 }): Promise<Scholarship[]> => {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Always exclude expired scholarships (deadline in the past)
    const now = new Date();
    conditions.push(gte(scholarshipsTable.deadline, now));

    // Apply optional filters
    if (filter.provider) {
      conditions.push(eq(scholarshipsTable.provider, filter.provider));
    }

    if (filter.award_amount) {
      conditions.push(eq(scholarshipsTable.award_amount, filter.award_amount));
    }

    // Build final query with all clauses at once
    const results = await db.select()
      .from(scholarshipsTable)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(desc(scholarshipsTable.created_at))
      .limit(filter.limit)
      .offset(filter.offset)
      .execute();

    // Return results (no numeric conversions needed - all fields are text/timestamp)
    return results;
  } catch (error) {
    console.error('Failed to fetch scholarships:', error);
    throw error;
  }
};