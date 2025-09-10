import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type UpdateCompetitionInput, type Competition } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateCompetition(input: UpdateCompetitionInput): Promise<Competition | null> {
  try {
    // Extract id from input
    const { id, ...updateFields } = input;

    // If no fields to update, return null
    if (Object.keys(updateFields).length === 0) {
      return null;
    }

    // Update competition record and return the updated record
    const result = await db.update(competitionsTable)
      .set({
        ...updateFields,
        updated_at: new Date() // Always update the timestamp
      })
      .where(eq(competitionsTable.id, id))
      .returning()
      .execute();

    // Return null if no competition found
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Competition update failed:', error);
    throw error;
  }
}