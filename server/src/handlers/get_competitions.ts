import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type Competition, type CompetitionFilter } from '../schema';
import { eq, gte, and, type SQL } from 'drizzle-orm';

export async function getCompetitions(input: CompetitionFilter = { limit: 20, offset: 0 }): Promise<Competition[]> {
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [];

    // Always exclude expired competitions (deadline has passed)
    const now = new Date();
    conditions.push(gte(competitionsTable.deadline_registration_date, now));

    // Apply optional filters
    if (input.category) {
      conditions.push(eq(competitionsTable.category, input.category));
    }

    if (input.place) {
      conditions.push(eq(competitionsTable.place, input.place));
    }

    if (input.price_register) {
      conditions.push(eq(competitionsTable.price_register, input.price_register));
    }

    // Build the complete query
    const results = await db.select()
      .from(competitionsTable)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(competitionsTable.deadline_registration_date)
      .limit(input.limit)
      .offset(input.offset)
      .execute();

    // Return results (no numeric conversion needed for this schema)
    return results;
  } catch (error) {
    console.error('Failed to get competitions:', error);
    throw error;
  }
}