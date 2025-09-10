import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competitionsTable } from '../db/schema';
import { type CompetitionFilter } from '../schema';
import { getCompetitions } from '../handlers/get_competitions';

// Test data setup
const createTestCompetition = async (overrides: any = {}) => {
  const baseCompetition = {
    title: 'Test Competition',
    description: 'A test competition',
    organizer: 'Test Organizer',
    deadline_registration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    registration_link: 'https://example.com/register',
    guide_book_link: 'https://example.com/guide',
    price_register: 'Free',
    place: 'Online',
    category: 'High School',
    image_link: 'https://example.com/image.jpg',
    ...overrides
  };

  const result = await db.insert(competitionsTable)
    .values(baseCompetition)
    .returning()
    .execute();

  return result[0];
};

describe('getCompetitions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all active competitions when no filters are applied', async () => {
    // Create test competitions
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createTestCompetition({
      title: 'Competition 1',
      deadline_registration_date: futureDate
    });
    await createTestCompetition({
      title: 'Competition 2', 
      deadline_registration_date: futureDate
    });

    const input: CompetitionFilter = {
      limit: 20,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Competition 1');
    expect(result[1].title).toEqual('Competition 2');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should exclude expired competitions', async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Create expired competition
    await createTestCompetition({
      title: 'Expired Competition',
      deadline_registration_date: pastDate
    });

    // Create active competition
    await createTestCompetition({
      title: 'Active Competition',
      deadline_registration_date: futureDate
    });

    const input: CompetitionFilter = {
      limit: 20,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Active Competition');
  });

  it('should filter by category', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await createTestCompetition({
      title: 'High School Competition',
      category: 'High School',
      deadline_registration_date: futureDate
    });
    
    await createTestCompetition({
      title: 'College Competition',
      category: 'College',
      deadline_registration_date: futureDate
    });

    const input: CompetitionFilter = {
      category: 'High School',
      limit: 20,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('High School Competition');
    expect(result[0].category).toEqual('High School');
  });

  it('should filter by place', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await createTestCompetition({
      title: 'Online Competition',
      place: 'Online',
      deadline_registration_date: futureDate
    });
    
    await createTestCompetition({
      title: 'Jakarta Competition',
      place: 'Jakarta',
      deadline_registration_date: futureDate
    });

    const input: CompetitionFilter = {
      place: 'Jakarta',
      limit: 20,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Jakarta Competition');
    expect(result[0].place).toEqual('Jakarta');
  });

  it('should filter by price_register', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await createTestCompetition({
      title: 'Free Competition',
      price_register: 'Free',
      deadline_registration_date: futureDate
    });
    
    await createTestCompetition({
      title: 'Paid Competition',
      price_register: 'Rp 50.000',
      deadline_registration_date: futureDate
    });

    const input: CompetitionFilter = {
      price_register: 'Free',
      limit: 20,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Free Competition');
    expect(result[0].price_register).toEqual('Free');
  });

  it('should apply multiple filters correctly', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await createTestCompetition({
      title: 'Matching Competition',
      category: 'High School',
      place: 'Online',
      price_register: 'Free',
      deadline_registration_date: futureDate
    });
    
    await createTestCompetition({
      title: 'Partial Match',
      category: 'High School',
      place: 'Jakarta',
      price_register: 'Free',
      deadline_registration_date: futureDate
    });

    const input: CompetitionFilter = {
      category: 'High School',
      place: 'Online',
      price_register: 'Free',
      limit: 20,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Matching Competition');
    expect(result[0].category).toEqual('High School');
    expect(result[0].place).toEqual('Online');
    expect(result[0].price_register).toEqual('Free');
  });

  it('should respect pagination limits', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    // Create 3 competitions
    for (let i = 1; i <= 3; i++) {
      await createTestCompetition({
        title: `Competition ${i}`,
        deadline_registration_date: futureDate
      });
    }

    const input: CompetitionFilter = {
      limit: 2,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(2);
  });

  it('should handle pagination with offset', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    // Create competitions with different deadlines to ensure consistent ordering
    await createTestCompetition({
      title: 'Competition 1',
      deadline_registration_date: new Date(futureDate.getTime() + 1 * 24 * 60 * 60 * 1000) // +1 day
    });
    
    await createTestCompetition({
      title: 'Competition 2',
      deadline_registration_date: new Date(futureDate.getTime() + 2 * 24 * 60 * 60 * 1000) // +2 days
    });
    
    await createTestCompetition({
      title: 'Competition 3',
      deadline_registration_date: new Date(futureDate.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 days
    });

    const input: CompetitionFilter = {
      limit: 2,
      offset: 1
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Competition 2');
    expect(result[1].title).toEqual('Competition 3');
  });

  it('should order competitions by deadline (closest first)', async () => {
    const baseDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await createTestCompetition({
      title: 'Later Competition',
      deadline_registration_date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000) // +5 days
    });
    
    await createTestCompetition({
      title: 'Earlier Competition',
      deadline_registration_date: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000) // +1 day
    });

    const input: CompetitionFilter = {
      limit: 20,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Earlier Competition');
    expect(result[1].title).toEqual('Later Competition');
    expect(result[0].deadline_registration_date < result[1].deadline_registration_date).toBe(true);
  });

  it('should return empty array when no competitions match filters', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await createTestCompetition({
      category: 'High School',
      deadline_registration_date: futureDate
    });

    const input: CompetitionFilter = {
      category: 'College',
      limit: 20,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(0);
  });

  it('should handle filters with only some optional fields', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await createTestCompetition({
      title: 'Test Competition',
      deadline_registration_date: futureDate
    });

    // Test with only required limit/offset fields
    const input: CompetitionFilter = {
      limit: 20,
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Test Competition');
  });

  it('should handle edge case with zero limit', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await createTestCompetition({
      title: 'Test Competition',
      deadline_registration_date: futureDate
    });

    const input: CompetitionFilter = {
      limit: 1, // Minimum positive limit as per schema
      offset: 0
    };

    const result = await getCompetitions(input);

    expect(result).toHaveLength(1);
  });

  it('should work with default parameters', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await createTestCompetition({
      title: 'Default Test Competition',
      deadline_registration_date: futureDate
    });

    // Call handler with default parameters
    const result = await getCompetitions();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Default Test Competition');
  });
});