import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { type Scholarship, type IdParam } from '../schema';
import { eq } from 'drizzle-orm';

export async function getScholarshipById(params: IdParam): Promise<Scholarship | null> {
  try {
    // Query scholarship by ID
    const results = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, params.id))
      .execute();

    // Return null if scholarship not found
    if (results.length === 0) {
      return null;
    }

    const scholarship = results[0];

    // Check if scholarship is expired (deadline has passed)
    const now = new Date();
    if (scholarship.deadline < now) {
      return null;
    }

    // Return the scholarship data
    return {
      id: scholarship.id,
      scholarship_name: scholarship.scholarship_name,
      description: scholarship.description,
      provider: scholarship.provider,
      eligibility: scholarship.eligibility,
      application_link: scholarship.application_link,
      deadline: scholarship.deadline,
      award_amount: scholarship.award_amount,
      image_link: scholarship.image_link,
      created_at: scholarship.created_at,
      updated_at: scholarship.updated_at
    };
  } catch (error) {
    console.error('Failed to get scholarship by ID:', error);
    throw error;
  }
}