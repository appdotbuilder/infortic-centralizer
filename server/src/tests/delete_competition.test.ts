import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type IdParam, type CreateCompetitionInput } from '../schema';
import { deleteCompetition } from '../handlers/delete_competition';
import { eq } from 'drizzle-orm';

// Test input for creating a competition to delete
const testCompetitionInput: CreateCompetitionInput = {
  title: 'Test Competition',
  description: 'A competition for testing deletion',
  organizer: 'Test Organizer',
  deadline_registration_date: new Date('2024-12-31'),
  registration_link: 'https://example.com/register',
  guide_book_link: 'https://example.com/guide',
  price_register: 'Free',
  place: 'Online',
  category: 'College',
  image_link: 'https://example.com/image.jpg'
};

describe('deleteCompetition', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing competition', async () => {
    // Create a competition first
    const createResult = await db.insert(competitionsTable)
      .values(testCompetitionInput)
      .returning()
      .execute();

    const createdCompetition = createResult[0];
    const params: IdParam = { id: createdCompetition.id };

    // Delete the competition
    const result = await deleteCompetition(params);

    // Verify deletion was successful
    expect(result).toBe(true);

    // Verify competition no longer exists in database
    const competitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, createdCompetition.id))
      .execute();

    expect(competitions).toHaveLength(0);
  });

  it('should return false for non-existent competition', async () => {
    // Try to delete a competition that doesn't exist
    const params: IdParam = { id: 999 };
    const result = await deleteCompetition(params);

    // Should return false since no competition was found/deleted
    expect(result).toBe(false);
  });

  it('should delete only the specified competition', async () => {
    // Create two competitions
    const competition1Result = await db.insert(competitionsTable)
      .values({
        ...testCompetitionInput,
        title: 'Competition 1'
      })
      .returning()
      .execute();

    const competition2Result = await db.insert(competitionsTable)
      .values({
        ...testCompetitionInput,
        title: 'Competition 2'
      })
      .returning()
      .execute();

    const competition1 = competition1Result[0];
    const competition2 = competition2Result[0];

    // Delete only the first competition
    const params: IdParam = { id: competition1.id };
    const result = await deleteCompetition(params);

    expect(result).toBe(true);

    // Verify first competition is deleted
    const deletedCompetitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, competition1.id))
      .execute();

    expect(deletedCompetitions).toHaveLength(0);

    // Verify second competition still exists
    const remainingCompetitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, competition2.id))
      .execute();

    expect(remainingCompetitions).toHaveLength(1);
    expect(remainingCompetitions[0].title).toBe('Competition 2');
  });

  it('should handle multiple delete attempts on same competition', async () => {
    // Create a competition
    const createResult = await db.insert(competitionsTable)
      .values(testCompetitionInput)
      .returning()
      .execute();

    const createdCompetition = createResult[0];
    const params: IdParam = { id: createdCompetition.id };

    // First deletion should succeed
    const firstResult = await deleteCompetition(params);
    expect(firstResult).toBe(true);

    // Second deletion should return false (competition no longer exists)
    const secondResult = await deleteCompetition(params);
    expect(secondResult).toBe(false);

    // Verify competition is still gone
    const competitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, createdCompetition.id))
      .execute();

    expect(competitions).toHaveLength(0);
  });
});