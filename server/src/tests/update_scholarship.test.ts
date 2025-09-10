import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type CreateScholarshipInput, type UpdateScholarshipInput } from '../schema';
import { updateScholarship } from '../handlers/update_scholarship';

// Test data setup
const testScholarshipData: CreateScholarshipInput = {
  scholarship_name: 'Original Scholarship',
  description: 'Original description',
  provider: 'Original University',
  eligibility: 'Original eligibility requirements',
  application_link: 'https://original-university.edu/apply',
  deadline: new Date('2024-12-31'),
  award_amount: 'Full Tuition',
  image_link: 'https://example.com/original-logo.jpg'
};

const updateData: Omit<UpdateScholarshipInput, 'id'> = {
  scholarship_name: 'Updated Scholarship Name',
  description: 'Updated description with new details',
  provider: 'Updated University Foundation',
  eligibility: 'Updated eligibility requirements',
  application_link: 'https://updated-foundation.org/apply',
  deadline: new Date('2025-03-15'),
  award_amount: '$15,000 per year',
  image_link: 'https://example.com/updated-logo.jpg'
};

describe('updateScholarship', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an existing scholarship with all fields', async () => {
    // Create initial scholarship
    const initialResult = await db.insert(scholarshipsTable)
      .values(testScholarshipData)
      .returning()
      .execute();

    const scholarshipId = initialResult[0].id;
    const originalUpdatedAt = initialResult[0].updated_at;

    // Small delay to ensure updated_at timestamp changes
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update scholarship
    const updateInput: UpdateScholarshipInput = {
      id: scholarshipId,
      ...updateData
    };

    const result = await updateScholarship(updateInput);

    // Verify update results
    expect(result).toBeDefined();
    expect(result!.id).toEqual(scholarshipId);
    expect(result!.scholarship_name).toEqual('Updated Scholarship Name');
    expect(result!.description).toEqual('Updated description with new details');
    expect(result!.provider).toEqual('Updated University Foundation');
    expect(result!.eligibility).toEqual('Updated eligibility requirements');
    expect(result!.application_link).toEqual('https://updated-foundation.org/apply');
    expect(result!.deadline.getTime()).toEqual(new Date('2025-03-15').getTime());
    expect(result!.award_amount).toEqual('$15,000 per year');
    expect(result!.image_link).toEqual('https://example.com/updated-logo.jpg');
    expect(result!.created_at).toEqual(initialResult[0].created_at);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should update scholarship with partial fields', async () => {
    // Create initial scholarship
    const initialResult = await db.insert(scholarshipsTable)
      .values(testScholarshipData)
      .returning()
      .execute();

    const scholarshipId = initialResult[0].id;

    // Update only specific fields
    const partialUpdate: UpdateScholarshipInput = {
      id: scholarshipId,
      scholarship_name: 'Partially Updated Scholarship',
      award_amount: '$20,000'
    };

    const result = await updateScholarship(partialUpdate);

    // Verify partial update
    expect(result).toBeDefined();
    expect(result!.id).toEqual(scholarshipId);
    expect(result!.scholarship_name).toEqual('Partially Updated Scholarship');
    expect(result!.award_amount).toEqual('$20,000');
    // Other fields should remain unchanged
    expect(result!.description).toEqual(testScholarshipData.description);
    expect(result!.provider).toEqual(testScholarshipData.provider);
    expect(result!.eligibility).toEqual(testScholarshipData.eligibility);
    expect(result!.application_link).toEqual(testScholarshipData.application_link);
  });

  it('should update nullable fields', async () => {
    // Create initial scholarship with nullable fields
    const scholarshipWithNulls: CreateScholarshipInput = {
      ...testScholarshipData,
      image_link: null
    };

    const initialResult = await db.insert(scholarshipsTable)
      .values(scholarshipWithNulls)
      .returning()
      .execute();

    const scholarshipId = initialResult[0].id;

    // Update nullable fields
    const updateInput: UpdateScholarshipInput = {
      id: scholarshipId,
      image_link: 'https://example.com/new-image.jpg'
    };

    const result = await updateScholarship(updateInput);

    expect(result!.image_link).toEqual('https://example.com/new-image.jpg');

    // Update nullable field back to null
    const nullUpdate: UpdateScholarshipInput = {
      id: scholarshipId,
      image_link: null
    };

    const nullResult = await updateScholarship(nullUpdate);
    expect(nullResult!.image_link).toBeNull();
  });

  it('should return null for non-existent scholarship', async () => {
    const nonExistentUpdate: UpdateScholarshipInput = {
      id: 99999,
      scholarship_name: 'This should not update'
    };

    const result = await updateScholarship(nonExistentUpdate);
    expect(result).toBeNull();
  });

  it('should save updated scholarship to database', async () => {
    // Create initial scholarship
    const initialResult = await db.insert(scholarshipsTable)
      .values(testScholarshipData)
      .returning()
      .execute();

    const scholarshipId = initialResult[0].id;

    // Update scholarship
    const updateInput: UpdateScholarshipInput = {
      id: scholarshipId,
      scholarship_name: 'Database Test Scholarship',
      provider: 'Database Test University'
    };

    await updateScholarship(updateInput);

    // Verify in database
    const scholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, scholarshipId))
      .execute();

    expect(scholarships).toHaveLength(1);
    expect(scholarships[0].scholarship_name).toEqual('Database Test Scholarship');
    expect(scholarships[0].provider).toEqual('Database Test University');
    expect(scholarships[0].description).toEqual(testScholarshipData.description);
  });

  it('should handle date updates correctly', async () => {
    // Create initial scholarship
    const initialResult = await db.insert(scholarshipsTable)
      .values(testScholarshipData)
      .returning()
      .execute();

    const scholarshipId = initialResult[0].id;
    const newDeadline = new Date('2025-06-30T23:59:59Z');

    // Update deadline
    const updateInput: UpdateScholarshipInput = {
      id: scholarshipId,
      deadline: newDeadline
    };

    const result = await updateScholarship(updateInput);

    expect(result!.deadline).toBeInstanceOf(Date);
    expect(result!.deadline.getTime()).toEqual(newDeadline.getTime());

    // Verify date is stored correctly in database
    const dbScholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, scholarshipId))
      .execute();

    expect(dbScholarships[0].deadline).toBeInstanceOf(Date);
    expect(dbScholarships[0].deadline.getTime()).toEqual(newDeadline.getTime());
  });

  it('should automatically update the updated_at timestamp', async () => {
    // Create initial scholarship
    const initialResult = await db.insert(scholarshipsTable)
      .values(testScholarshipData)
      .returning()
      .execute();

    const scholarshipId = initialResult[0].id;
    const originalUpdatedAt = initialResult[0].updated_at;

    // Wait to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update scholarship
    const updateInput: UpdateScholarshipInput = {
      id: scholarshipId,
      scholarship_name: 'Timestamp Test'
    };

    const result = await updateScholarship(updateInput);

    // Verify updated_at changed
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

    // Verify created_at remains unchanged
    expect(result!.created_at.getTime()).toEqual(initialResult[0].created_at.getTime());
  });
});