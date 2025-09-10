import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type Competition, type IdParam } from '../schema';
import { eq } from 'drizzle-orm';

export async function getCompetitionById(params: IdParam): Promise<Competition | null> {
  try {
    // Query competition by ID
    const results = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, params.id))
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const competition = results[0];
    
    // Check if competition registration deadline has passed (expired)
    const now = new Date();
    if (competition.deadline_registration_date < now) {
      return null;
    }

    return competition;
  } catch (error) {
    console.error('Get competition by ID failed:', error);
    throw error;
  }
}