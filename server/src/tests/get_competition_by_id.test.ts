import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type CreateCompetitionInput, type IdParam } from '../schema';
import { getCompetitionById } from '../handlers/get_competition_by_id';

// Test input for creating competitions
const testCompetitionInput: CreateCompetitionInput = {
  title: 'Test Programming Contest',
  description: 'A competitive programming contest for students',
  organizer: 'Tech University',
  deadline_registration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  registration_link: 'https://example.com/register',
  guide_book_link: 'https://example.com/guide',
  price_register: 'Free',
  place: 'Online',
  category: 'College',
  image_link: 'https://example.com/image.jpg'
};

const expiredCompetitionInput: CreateCompetitionInput = {
  title: 'Expired Programming Contest',
  description: 'An expired programming contest',
  organizer: 'Old University',
  deadline_registration_date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago (expired)
  registration_link: 'https://example.com/expired-register',
  guide_book_link: null,
  price_register: 'Rp 50.000',
  place: 'Jakarta',
  category: 'High School',
  image_link: null
};

describe('getCompetitionById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a competition by ID when it exists and is not expired', async () => {
    // Create a competition in the database
    const insertResult = await db.insert(competitionsTable)
      .values({
        title: testCompetitionInput.title,
        description: testCompetitionInput.description,
        organizer: testCompetitionInput.organizer,
        deadline_registration_date: testCompetitionInput.deadline_registration_date,
        registration_link: testCompetitionInput.registration_link,
        guide_book_link: testCompetitionInput.guide_book_link,
        price_register: testCompetitionInput.price_register,
        place: testCompetitionInput.place,
        category: testCompetitionInput.category,
        image_link: testCompetitionInput.image_link
      })
      .returning()
      .execute();

    const createdCompetition = insertResult[0];
    const params: IdParam = { id: createdCompetition.id };

    // Test the handler
    const result = await getCompetitionById(params);

    // Verify the result
    expect(result).toBeDefined();
    expect(result?.id).toEqual(createdCompetition.id);
    expect(result?.title).toEqual('Test Programming Contest');
    expect(result?.description).toEqual(testCompetitionInput.description);
    expect(result?.organizer).toEqual('Tech University');
    expect(result?.registration_link).toEqual(testCompetitionInput.registration_link);
    expect(result?.guide_book_link).toEqual(testCompetitionInput.guide_book_link);
    expect(result?.price_register).toEqual('Free');
    expect(result?.place).toEqual('Online');
    expect(result?.category).toEqual('College');
    expect(result?.image_link).toEqual(testCompetitionInput.image_link);
    expect(result?.deadline_registration_date).toBeInstanceOf(Date);
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when competition does not exist', async () => {
    const params: IdParam = { id: 999999 };

    const result = await getCompetitionById(params);

    expect(result).toBeNull();
  });

  it('should return null when competition is expired (deadline has passed)', async () => {
    // Create an expired competition
    const insertResult = await db.insert(competitionsTable)
      .values({
        title: expiredCompetitionInput.title,
        description: expiredCompetitionInput.description,
        organizer: expiredCompetitionInput.organizer,
        deadline_registration_date: expiredCompetitionInput.deadline_registration_date,
        registration_link: expiredCompetitionInput.registration_link,
        guide_book_link: expiredCompetitionInput.guide_book_link,
        price_register: expiredCompetitionInput.price_register,
        place: expiredCompetitionInput.place,
        category: expiredCompetitionInput.category,
        image_link: expiredCompetitionInput.image_link
      })
      .returning()
      .execute();

    const createdCompetition = insertResult[0];
    const params: IdParam = { id: createdCompetition.id };

    // Test the handler
    const result = await getCompetitionById(params);

    // Should return null because competition is expired
    expect(result).toBeNull();
  });

  it('should handle competitions with nullable fields correctly', async () => {
    // Create a competition with null values for optional fields
    const competitionWithNulls: CreateCompetitionInput = {
      title: 'Minimal Competition',
      description: 'A competition with minimal fields',
      organizer: 'Minimal Org',
      deadline_registration_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      registration_link: 'https://minimal.com/register',
      guide_book_link: null,
      price_register: 'N/A',
      place: 'TBD',
      category: 'General',
      image_link: null
    };

    const insertResult = await db.insert(competitionsTable)
      .values({
        title: competitionWithNulls.title,
        description: competitionWithNulls.description,
        organizer: competitionWithNulls.organizer,
        deadline_registration_date: competitionWithNulls.deadline_registration_date,
        registration_link: competitionWithNulls.registration_link,
        guide_book_link: competitionWithNulls.guide_book_link,
        price_register: competitionWithNulls.price_register,
        place: competitionWithNulls.place,
        category: competitionWithNulls.category,
        image_link: competitionWithNulls.image_link
      })
      .returning()
      .execute();

    const createdCompetition = insertResult[0];
    const params: IdParam = { id: createdCompetition.id };

    const result = await getCompetitionById(params);

    expect(result).toBeDefined();
    expect(result?.title).toEqual('Minimal Competition');
    expect(result?.guide_book_link).toBeNull();
    expect(result?.image_link).toBeNull();
    expect(result?.price_register).toEqual('N/A');
  });

  it('should verify competition deadline is checked against current time', async () => {
    // Create a competition that expires very soon (but not yet expired)
    const soonToExpire = new Date(Date.now() + 1000); // 1 second from now
    
    const insertResult = await db.insert(competitionsTable)
      .values({
        title: 'Soon to Expire Competition',
        description: 'This competition expires very soon',
        organizer: 'Time Test Org',
        deadline_registration_date: soonToExpire,
        registration_link: 'https://soonexpire.com/register',
        guide_book_link: null,
        price_register: 'Free',
        place: 'Online',
        category: 'General',
        image_link: null
      })
      .returning()
      .execute();

    const createdCompetition = insertResult[0];
    const params: IdParam = { id: createdCompetition.id };

    // Should still be available since it hasn't expired yet
    const result = await getCompetitionById(params);
    expect(result).toBeDefined();
    expect(result?.title).toEqual('Soon to Expire Competition');
  });
});