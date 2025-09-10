import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type UpdateCompetitionInput, type CreateCompetitionInput } from '../schema';
import { updateCompetition } from '../handlers/update_competition';
import { eq } from 'drizzle-orm';

// Helper function to create a test competition
const createTestCompetition = async (): Promise<number> => {
  const testCompetitionInput: CreateCompetitionInput = {
    title: 'Original Math Contest',
    description: 'Original description for math competition',
    organizer: 'Original University',
    deadline_registration_date: new Date('2024-12-31'),
    registration_link: 'https://example.com/register',
    guide_book_link: 'https://example.com/guide',
    price_register: 'Free',
    place: 'Jakarta',
    category: 'High School',
    image_link: 'https://example.com/image.jpg'
  };

  const result = await db.insert(competitionsTable)
    .values(testCompetitionInput)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateCompetition', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a competition', async () => {
    const competitionId = await createTestCompetition();
    
    const updateInput: UpdateCompetitionInput = {
      id: competitionId,
      title: 'Updated Math Contest',
      description: 'Updated description for math competition',
      organizer: 'Updated University',
      deadline_registration_date: new Date('2025-01-31'),
      registration_link: 'https://updated.com/register',
      guide_book_link: 'https://updated.com/guide',
      price_register: 'Rp 100.000',
      place: 'Surabaya',
      category: 'College',
      image_link: 'https://updated.com/image.jpg'
    };

    const result = await updateCompetition(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(competitionId);
    expect(result!.title).toEqual('Updated Math Contest');
    expect(result!.description).toEqual('Updated description for math competition');
    expect(result!.organizer).toEqual('Updated University');
    expect(result!.deadline_registration_date).toEqual(new Date('2025-01-31'));
    expect(result!.registration_link).toEqual('https://updated.com/register');
    expect(result!.guide_book_link).toEqual('https://updated.com/guide');
    expect(result!.price_register).toEqual('Rp 100.000');
    expect(result!.place).toEqual('Surabaya');
    expect(result!.category).toEqual('College');
    expect(result!.image_link).toEqual('https://updated.com/image.jpg');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update partial fields of a competition', async () => {
    const competitionId = await createTestCompetition();
    
    const updateInput: UpdateCompetitionInput = {
      id: competitionId,
      title: 'Partially Updated Contest',
      place: 'Bandung'
    };

    const result = await updateCompetition(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(competitionId);
    expect(result!.title).toEqual('Partially Updated Contest');
    expect(result!.place).toEqual('Bandung');
    // Original values should remain unchanged
    expect(result!.description).toEqual('Original description for math competition');
    expect(result!.organizer).toEqual('Original University');
    expect(result!.category).toEqual('High School');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update nullable fields to null', async () => {
    const competitionId = await createTestCompetition();
    
    const updateInput: UpdateCompetitionInput = {
      id: competitionId,
      guide_book_link: null,
      image_link: null
    };

    const result = await updateCompetition(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(competitionId);
    expect(result!.guide_book_link).toBeNull();
    expect(result!.image_link).toBeNull();
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update nullable fields from null to value', async () => {
    const competitionId = await createTestCompetition();
    
    // First set to null
    await updateCompetition({
      id: competitionId,
      guide_book_link: null,
      image_link: null
    });

    // Then update to have values
    const updateInput: UpdateCompetitionInput = {
      id: competitionId,
      guide_book_link: 'https://newguide.com/guide',
      image_link: 'https://newimage.com/image.jpg'
    };

    const result = await updateCompetition(updateInput);

    expect(result).toBeDefined();
    expect(result!.guide_book_link).toEqual('https://newguide.com/guide');
    expect(result!.image_link).toEqual('https://newimage.com/image.jpg');
  });

  it('should return null when competition does not exist', async () => {
    const updateInput: UpdateCompetitionInput = {
      id: 99999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateCompetition(updateInput);

    expect(result).toBeNull();
  });

  it('should return null when no fields to update', async () => {
    const competitionId = await createTestCompetition();
    
    const updateInput: UpdateCompetitionInput = {
      id: competitionId
      // No other fields to update
    };

    const result = await updateCompetition(updateInput);

    expect(result).toBeNull();
  });

  it('should update competition in database', async () => {
    const competitionId = await createTestCompetition();
    
    const updateInput: UpdateCompetitionInput = {
      id: competitionId,
      title: 'Database Updated Contest',
      organizer: 'Database Updated University'
    };

    await updateCompetition(updateInput);

    // Verify the changes were persisted in database
    const competitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, competitionId))
      .execute();

    expect(competitions).toHaveLength(1);
    expect(competitions[0].title).toEqual('Database Updated Contest');
    expect(competitions[0].organizer).toEqual('Database Updated University');
    expect(competitions[0].updated_at).toBeInstanceOf(Date);
  });

  it('should automatically update updated_at timestamp', async () => {
    const competitionId = await createTestCompetition();
    
    // Get original timestamp
    const original = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, competitionId))
      .execute();

    const originalUpdatedAt = original[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateCompetitionInput = {
      id: competitionId,
      title: 'Timestamp Test Contest'
    };

    const result = await updateCompetition(updateInput);

    expect(result).toBeDefined();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should handle date field updates correctly', async () => {
    const competitionId = await createTestCompetition();
    
    const newDeadline = new Date('2025-06-15');
    const updateInput: UpdateCompetitionInput = {
      id: competitionId,
      deadline_registration_date: newDeadline
    };

    const result = await updateCompetition(updateInput);

    expect(result).toBeDefined();
    expect(result!.deadline_registration_date).toEqual(newDeadline);
    expect(result!.deadline_registration_date).toBeInstanceOf(Date);
  });
});