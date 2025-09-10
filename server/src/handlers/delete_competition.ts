import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type IdParam } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteCompetition = async (params: IdParam): Promise<boolean> => {
  try {
    // Delete the competition with the specified ID
    const result = await db.delete(competitionsTable)
      .where(eq(competitionsTable.id, params.id))
      .execute();

    // Check if any rows were affected (competition existed and was deleted)
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Competition deletion failed:', error);
    throw error;
  }
};