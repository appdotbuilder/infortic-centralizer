import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type CreateCompetitionInput, type Competition } from '../schema';

export const createCompetition = async (input: CreateCompetitionInput): Promise<Competition> => {
  try {
    // Insert competition record
    const result = await db.insert(competitionsTable)
      .values({
        title: input.title,
        description: input.description,
        organizer: input.organizer,
        deadline_registration_date: input.deadline_registration_date,
        registration_link: input.registration_link,
        guide_book_link: input.guide_book_link,
        price_register: input.price_register,
        place: input.place,
        category: input.category,
        image_link: input.image_link
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Competition creation failed:', error);
    throw error;
  }
};