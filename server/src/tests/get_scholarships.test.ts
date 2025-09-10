import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { type ScholarshipFilter, type CreateScholarshipInput } from '../schema';
import { getScholarships } from '../handlers/get_scholarships';

// Test scholarship data
const createTestScholarship = (overrides: Partial<CreateScholarshipInput> = {}): CreateScholarshipInput => ({
  scholarship_name: 'Test Scholarship',
  description: 'A scholarship for testing',
  provider: 'Test University',
  eligibility: 'Undergraduate students',
  application_link: 'https://test-university.edu/scholarship',
  deadline: new Date('2024-12-31'),
  award_amount: 'Full Tuition',
  image_link: 'https://test-university.edu/image.jpg',
  ...overrides
});

describe('getScholarships', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all non-expired scholarships when no filter is provided', async () => {
    // Create test scholarships - one active, one expired
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'Active Scholarship',
        deadline: futureDate
      }),
      createTestScholarship({
        scholarship_name: 'Expired Scholarship',
        deadline: pastDate
      })
    ]).execute();

    const result = await getScholarships();

    expect(result).toHaveLength(1);
    expect(result[0].scholarship_name).toEqual('Active Scholarship');
    expect(result[0].deadline).toBeInstanceOf(Date);
    expect(result[0].deadline >= new Date()).toBe(true);
  });

  it('should filter scholarships by provider', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Create scholarships from different providers
    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'Harvard Scholarship',
        provider: 'Harvard University',
        deadline: futureDate
      }),
      createTestScholarship({
        scholarship_name: 'MIT Scholarship',
        provider: 'MIT',
        deadline: futureDate
      })
    ]).execute();

    const filter: ScholarshipFilter = {
      provider: 'Harvard University',
      limit: 20,
      offset: 0
    };

    const result = await getScholarships(filter);

    expect(result).toHaveLength(1);
    expect(result[0].scholarship_name).toEqual('Harvard Scholarship');
    expect(result[0].provider).toEqual('Harvard University');
  });

  it('should filter scholarships by award amount', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Create scholarships with different award amounts
    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'Full Tuition Scholarship',
        award_amount: 'Full Tuition',
        deadline: futureDate
      }),
      createTestScholarship({
        scholarship_name: 'Partial Scholarship',
        award_amount: '$5000',
        deadline: futureDate
      })
    ]).execute();

    const filter: ScholarshipFilter = {
      award_amount: '$5000',
      limit: 20,
      offset: 0
    };

    const result = await getScholarships(filter);

    expect(result).toHaveLength(1);
    expect(result[0].scholarship_name).toEqual('Partial Scholarship');
    expect(result[0].award_amount).toEqual('$5000');
  });

  it('should apply multiple filters simultaneously', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Create multiple scholarships
    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'Harvard Full Scholarship',
        provider: 'Harvard University',
        award_amount: 'Full Tuition',
        deadline: futureDate
      }),
      createTestScholarship({
        scholarship_name: 'Harvard Partial Scholarship',
        provider: 'Harvard University',
        award_amount: '$5000',
        deadline: futureDate
      }),
      createTestScholarship({
        scholarship_name: 'MIT Full Scholarship',
        provider: 'MIT',
        award_amount: 'Full Tuition',
        deadline: futureDate
      })
    ]).execute();

    const filter: ScholarshipFilter = {
      provider: 'Harvard University',
      award_amount: 'Full Tuition',
      limit: 20,
      offset: 0
    };

    const result = await getScholarships(filter);

    expect(result).toHaveLength(1);
    expect(result[0].scholarship_name).toEqual('Harvard Full Scholarship');
    expect(result[0].provider).toEqual('Harvard University');
    expect(result[0].award_amount).toEqual('Full Tuition');
  });

  it('should respect pagination limits', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Create 5 scholarships
    const scholarships = Array.from({ length: 5 }, (_, i) =>
      createTestScholarship({
        scholarship_name: `Scholarship ${i + 1}`,
        deadline: futureDate
      })
    );

    await db.insert(scholarshipsTable).values(scholarships).execute();

    const filter: ScholarshipFilter = {
      limit: 3,
      offset: 0
    };

    const result = await getScholarships(filter);

    expect(result).toHaveLength(3);
  });

  it('should handle pagination offset', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Create 3 scholarships with different creation times
    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'First Scholarship',
        deadline: futureDate
      })
    ]).execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'Second Scholarship',
        deadline: futureDate
      })
    ]).execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'Third Scholarship',
        deadline: futureDate
      })
    ]).execute();

    // Get first page
    const firstPage = await getScholarships({ limit: 2, offset: 0 });
    expect(firstPage).toHaveLength(2);

    // Get second page
    const secondPage = await getScholarships({ limit: 2, offset: 2 });
    expect(secondPage).toHaveLength(1);

    // Verify no overlap between pages
    const firstPageIds = firstPage.map(s => s.id);
    const secondPageIds = secondPage.map(s => s.id);
    const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it('should return empty array when no scholarships match filter', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        provider: 'Harvard University',
        deadline: futureDate
      })
    ]).execute();

    const filter: ScholarshipFilter = {
      provider: 'Non-existent University',
      limit: 20,
      offset: 0
    };

    const result = await getScholarships(filter);

    expect(result).toHaveLength(0);
  });

  it('should return scholarships ordered by creation date (newest first)', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Create first scholarship
    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'Old Scholarship',
        deadline: futureDate
      })
    ]).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second scholarship
    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'New Scholarship',
        deadline: futureDate
      })
    ]).execute();

    const result = await getScholarships();

    expect(result).toHaveLength(2);
    expect(result[0].scholarship_name).toEqual('New Scholarship');
    expect(result[1].scholarship_name).toEqual('Old Scholarship');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should use default pagination values when not provided', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Create more than 20 scholarships to test default limit
    const scholarships = Array.from({ length: 25 }, (_, i) =>
      createTestScholarship({
        scholarship_name: `Scholarship ${i + 1}`,
        deadline: futureDate
      })
    );

    await db.insert(scholarshipsTable).values(scholarships).execute();

    const result = await getScholarships();

    // Should return default limit of 20
    expect(result).toHaveLength(20);
  });

  it('should exclude expired scholarships regardless of other filters', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    // Create both active and expired scholarships from same provider
    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'Active Harvard Scholarship',
        provider: 'Harvard University',
        deadline: futureDate
      }),
      createTestScholarship({
        scholarship_name: 'Expired Harvard Scholarship',
        provider: 'Harvard University',
        deadline: pastDate
      })
    ]).execute();

    const filter: ScholarshipFilter = {
      provider: 'Harvard University',
      limit: 20,
      offset: 0
    };

    const result = await getScholarships(filter);

    expect(result).toHaveLength(1);
    expect(result[0].scholarship_name).toEqual('Active Harvard Scholarship');
    // Verify deadline is in future
    expect(result[0].deadline > new Date()).toBe(true);
  });

  it('should include all required fields in returned scholarships', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await db.insert(scholarshipsTable).values([
      createTestScholarship({
        scholarship_name: 'Complete Scholarship',
        description: 'Full description here',
        provider: 'Test University',
        eligibility: 'All students',
        application_link: 'https://test.edu/apply',
        deadline: futureDate,
        award_amount: '$10000',
        image_link: 'https://test.edu/image.jpg'
      })
    ]).execute();

    const result = await getScholarships();

    expect(result).toHaveLength(1);
    const scholarship = result[0];

    // Verify all fields are present and have correct types
    expect(scholarship.id).toBeDefined();
    expect(typeof scholarship.id).toBe('number');
    expect(scholarship.scholarship_name).toEqual('Complete Scholarship');
    expect(scholarship.description).toEqual('Full description here');
    expect(scholarship.provider).toEqual('Test University');
    expect(scholarship.eligibility).toEqual('All students');
    expect(scholarship.application_link).toEqual('https://test.edu/apply');
    expect(scholarship.deadline).toBeInstanceOf(Date);
    expect(scholarship.award_amount).toEqual('$10000');
    expect(scholarship.image_link).toEqual('https://test.edu/image.jpg');
    expect(scholarship.created_at).toBeInstanceOf(Date);
    expect(scholarship.updated_at).toBeInstanceOf(Date);
  });
});