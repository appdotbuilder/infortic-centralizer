import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { type CreateScholarshipInput, type Scholarship } from '../schema';

export async function createScholarship(input: CreateScholarshipInput): Promise<Scholarship> {
  try {
    // Insert scholarship record
    const result = await db.insert(scholarshipsTable)
      .values({
        scholarship_name: input.scholarship_name,
        description: input.description,
        provider: input.provider,
        eligibility: input.eligibility,
        application_link: input.application_link,
        deadline: input.deadline,
        award_amount: input.award_amount,
        image_link: input.image_link
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Scholarship creation failed:', error);
    throw error;
  }
}