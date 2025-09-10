import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { type CreateScholarshipInput } from '../schema';
import { createScholarship } from '../handlers/create_scholarship';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateScholarshipInput = {
  scholarship_name: 'Merit Excellence Scholarship',
  description: 'A scholarship for outstanding academic achievement in STEM fields',
  provider: 'Tech Innovation Foundation',
  eligibility: 'Undergraduate students with GPA 3.5+ in Engineering or Computer Science',
  application_link: 'https://example.com/apply',
  deadline: new Date('2024-06-15'),
  award_amount: '$5000',
  image_link: 'https://example.com/scholarship-image.jpg'
};

// Test input with nullable field
const testInputWithNulls: CreateScholarshipInput = {
  scholarship_name: 'Community Service Award',
  description: 'Recognition for exceptional community service contributions',
  provider: 'Local Community Foundation',
  eligibility: 'High school students with 100+ volunteer hours',
  application_link: 'https://example.com/community-apply',
  deadline: new Date('2024-08-30'),
  award_amount: 'Varies',
  image_link: null
};

describe('createScholarship', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a scholarship with all fields', async () => {
    const result = await createScholarship(testInput);

    // Verify all field values
    expect(result.scholarship_name).toEqual('Merit Excellence Scholarship');
    expect(result.description).toEqual(testInput.description);
    expect(result.provider).toEqual('Tech Innovation Foundation');
    expect(result.eligibility).toEqual(testInput.eligibility);
    expect(result.application_link).toEqual('https://example.com/apply');
    expect(result.deadline).toEqual(new Date('2024-06-15'));
    expect(result.award_amount).toEqual('$5000');
    expect(result.image_link).toEqual('https://example.com/scholarship-image.jpg');
    
    // Verify auto-generated fields
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a scholarship with null image_link', async () => {
    const result = await createScholarship(testInputWithNulls);

    expect(result.scholarship_name).toEqual('Community Service Award');
    expect(result.description).toEqual(testInputWithNulls.description);
    expect(result.provider).toEqual('Local Community Foundation');
    expect(result.eligibility).toEqual(testInputWithNulls.eligibility);
    expect(result.application_link).toEqual('https://example.com/community-apply');
    expect(result.deadline).toEqual(new Date('2024-08-30'));
    expect(result.award_amount).toEqual('Varies');
    expect(result.image_link).toBeNull();
    
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save scholarship to database correctly', async () => {
    const result = await createScholarship(testInput);

    // Query database to verify record was saved
    const scholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, result.id))
      .execute();

    expect(scholarships).toHaveLength(1);
    const savedScholarship = scholarships[0];
    
    expect(savedScholarship.scholarship_name).toEqual('Merit Excellence Scholarship');
    expect(savedScholarship.description).toEqual(testInput.description);
    expect(savedScholarship.provider).toEqual('Tech Innovation Foundation');
    expect(savedScholarship.eligibility).toEqual(testInput.eligibility);
    expect(savedScholarship.application_link).toEqual('https://example.com/apply');
    expect(savedScholarship.deadline).toEqual(new Date('2024-06-15'));
    expect(savedScholarship.award_amount).toEqual('$5000');
    expect(savedScholarship.image_link).toEqual('https://example.com/scholarship-image.jpg');
    expect(savedScholarship.created_at).toBeInstanceOf(Date);
    expect(savedScholarship.updated_at).toBeInstanceOf(Date);
  });

  it('should handle different deadline dates correctly', async () => {
    const futureDate = new Date('2025-12-31');
    const inputWithFutureDate: CreateScholarshipInput = {
      ...testInput,
      scholarship_name: 'Future Leaders Scholarship',
      deadline: futureDate
    };

    const result = await createScholarship(inputWithFutureDate);

    expect(result.deadline).toEqual(futureDate);
    expect(result.deadline).toBeInstanceOf(Date);
    
    // Verify in database
    const scholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, result.id))
      .execute();

    expect(scholarships[0].deadline).toEqual(futureDate);
  });

  it('should handle different award amounts correctly', async () => {
    const variousAmounts = [
      'Full Tuition',
      '$10,000 per year',
      'Up to $2,500',
      'Varies by need',
      'Books and supplies covered'
    ];

    for (const amount of variousAmounts) {
      const inputWithAmount: CreateScholarshipInput = {
        ...testInput,
        scholarship_name: `Test Scholarship - ${amount}`,
        award_amount: amount
      };

      const result = await createScholarship(inputWithAmount);
      expect(result.award_amount).toEqual(amount);
    }
  });

  it('should create multiple scholarships with unique IDs', async () => {
    const input1: CreateScholarshipInput = {
      ...testInput,
      scholarship_name: 'First Scholarship'
    };

    const input2: CreateScholarshipInput = {
      ...testInput,
      scholarship_name: 'Second Scholarship',
      provider: 'Different Foundation'
    };

    const result1 = await createScholarship(input1);
    const result2 = await createScholarship(input2);

    // Verify different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.scholarship_name).toEqual('First Scholarship');
    expect(result2.scholarship_name).toEqual('Second Scholarship');
    expect(result2.provider).toEqual('Different Foundation');

    // Verify both exist in database
    const allScholarships = await db.select()
      .from(scholarshipsTable)
      .execute();

    expect(allScholarships).toHaveLength(2);
  });
});