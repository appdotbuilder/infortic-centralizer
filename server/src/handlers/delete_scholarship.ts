import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type IdParam } from '../schema';

export async function deleteScholarship(params: IdParam): Promise<boolean> {
  try {
    const result = await db.delete(scholarshipsTable)
      .where(eq(scholarshipsTable.id, params.id))
      .execute();

    // Return true if a row was deleted, false if no scholarship was found
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Scholarship deletion failed:', error);
    throw error;
  }
}