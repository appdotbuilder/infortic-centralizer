import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateScholarshipInput, type Scholarship } from '../schema';

export async function updateScholarship(input: UpdateScholarshipInput): Promise<Scholarship | null> {
  try {
    const { id, ...updateData } = input;

    // Check if scholarship exists
    const existingScholarship = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, id))
      .execute();

    if (existingScholarship.length === 0) {
      return null;
    }

    // Update scholarship with automatic updated_at timestamp
    const result = await db.update(scholarshipsTable)
      .set({
        ...updateData,
        updated_at: new Date()
      })
      .where(eq(scholarshipsTable.id, id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Scholarship update failed:', error);
    throw error;
  }
}