import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type CreateCompetitionInput } from '../schema';
import { createCompetition } from '../handlers/create_competition';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateCompetitionInput = {
  title: 'Programming Contest 2024',
  description: 'Annual programming competition for students',
  organizer: 'University of Technology',
  deadline_registration_date: new Date('2024-03-15'),
  registration_link: 'https://example.com/register',
  guide_book_link: 'https://example.com/guide',
  price_register: 'Free',
  place: 'Online',
  category: 'College',
  image_link: 'https://example.com/image.jpg'
};

describe('createCompetition', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a competition with all fields', async () => {
    const result = await createCompetition(testInput);

    // Basic field validation
    expect(result.title).toEqual('Programming Contest 2024');
    expect(result.description).toEqual(testInput.description);
    expect(result.organizer).toEqual(testInput.organizer);
    expect(result.deadline_registration_date).toEqual(testInput.deadline_registration_date);
    expect(result.registration_link).toEqual(testInput.registration_link);
    expect(result.guide_book_link).toEqual(testInput.guide_book_link);
    expect(result.price_register).toEqual('Free');
    expect(result.place).toEqual('Online');
    expect(result.category).toEqual('College');
    expect(result.image_link).toEqual(testInput.image_link);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save competition to database', async () => {
    const result = await createCompetition(testInput);

    // Query using proper drizzle syntax
    const competitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, result.id))
      .execute();

    expect(competitions).toHaveLength(1);
    expect(competitions[0].title).toEqual('Programming Contest 2024');
    expect(competitions[0].description).toEqual(testInput.description);
    expect(competitions[0].organizer).toEqual(testInput.organizer);
    expect(competitions[0].deadline_registration_date).toEqual(testInput.deadline_registration_date);
    expect(competitions[0].registration_link).toEqual(testInput.registration_link);
    expect(competitions[0].guide_book_link).toEqual(testInput.guide_book_link);
    expect(competitions[0].price_register).toEqual('Free');
    expect(competitions[0].place).toEqual('Online');
    expect(competitions[0].category).toEqual('College');
    expect(competitions[0].image_link).toEqual(testInput.image_link);
    expect(competitions[0].created_at).toBeInstanceOf(Date);
    expect(competitions[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create competition with nullable fields as null', async () => {
    const inputWithNulls: CreateCompetitionInput = {
      title: 'Math Competition',
      description: 'Mathematics competition for high school students',
      organizer: 'Math Society',
      deadline_registration_date: new Date('2024-04-20'),
      registration_link: 'https://math-society.com/register',
      guide_book_link: null,
      price_register: 'Rp 25.000',
      place: 'Jakarta',
      category: 'High School',
      image_link: null
    };

    const result = await createCompetition(inputWithNulls);

    expect(result.title).toEqual('Math Competition');
    expect(result.guide_book_link).toBeNull();
    expect(result.image_link).toBeNull();
    expect(result.price_register).toEqual('Rp 25.000');
    expect(result.place).toEqual('Jakarta');
    expect(result.category).toEqual('High School');

    // Verify in database
    const competitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, result.id))
      .execute();

    expect(competitions[0].guide_book_link).toBeNull();
    expect(competitions[0].image_link).toBeNull();
  });

  it('should handle different categories and places', async () => {
    const testCases = [
      { category: 'Middle School', place: 'Bandung' },
      { category: 'General', place: 'Universitas Indonesia' },
      { category: 'High School', place: 'Online' }
    ];

    for (const testCase of testCases) {
      const input: CreateCompetitionInput = {
        ...testInput,
        title: `Test Competition ${testCase.category}`,
        category: testCase.category,
        place: testCase.place
      };

      const result = await createCompetition(input);

      expect(result.category).toEqual(testCase.category);
      expect(result.place).toEqual(testCase.place);
      expect(result.title).toEqual(`Test Competition ${testCase.category}`);
    }
  });

  it('should handle different price formats', async () => {
    const priceTestCases = [
      'Free',
      'Rp 50.000',
      'N/A',
      '$10',
      'Varies by team size'
    ];

    for (const price of priceTestCases) {
      const input: CreateCompetitionInput = {
        ...testInput,
        title: `Competition with ${price} fee`,
        price_register: price
      };

      const result = await createCompetition(input);

      expect(result.price_register).toEqual(price);
    }
  });

  it('should preserve timestamp accuracy', async () => {
    const specificDate = new Date('2024-06-15T10:30:00.000Z');
    const input: CreateCompetitionInput = {
      ...testInput,
      deadline_registration_date: specificDate
    };

    const result = await createCompetition(input);

    expect(result.deadline_registration_date).toEqual(specificDate);

    // Verify in database
    const competitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, result.id))
      .execute();

    expect(competitions[0].deadline_registration_date).toEqual(specificDate);
  });
});