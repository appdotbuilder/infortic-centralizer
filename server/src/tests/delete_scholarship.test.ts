import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { type IdParam, type CreateScholarshipInput } from '../schema';
import { deleteScholarship } from '../handlers/delete_scholarship';
import { eq } from 'drizzle-orm';

// Test input for creating a scholarship to delete
const testScholarshipInput: CreateScholarshipInput = {
  scholarship_name: 'Test Scholarship',
  description: 'A scholarship for testing deletion',
  provider: 'Test University',
  eligibility: 'Undergraduate students',
  application_link: 'https://example.com/apply',
  deadline: new Date('2024-12-31'),
  award_amount: '$5000',
  image_link: 'https://example.com/image.jpg'
};

describe('deleteScholarship', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing scholarship and return true', async () => {
    // Create a scholarship first
    const insertResult = await db.insert(scholarshipsTable)
      .values({
        scholarship_name: testScholarshipInput.scholarship_name,
        description: testScholarshipInput.description,
        provider: testScholarshipInput.provider,
        eligibility: testScholarshipInput.eligibility,
        application_link: testScholarshipInput.application_link,
        deadline: testScholarshipInput.deadline,
        award_amount: testScholarshipInput.award_amount,
        image_link: testScholarshipInput.image_link
      })
      .returning()
      .execute();

    const scholarshipId = insertResult[0].id;
    const params: IdParam = { id: scholarshipId };

    // Delete the scholarship
    const result = await deleteScholarship(params);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify the scholarship no longer exists in the database
    const scholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, scholarshipId))
      .execute();

    expect(scholarships).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent scholarship', async () => {
    const params: IdParam = { id: 9999 };

    // Try to delete a scholarship that doesn't exist
    const result = await deleteScholarship(params);

    // Should return false for non-existent scholarship
    expect(result).toBe(false);
  });

  it('should not affect other scholarships when deleting one', async () => {
    // Create two scholarships
    const scholarship1Result = await db.insert(scholarshipsTable)
      .values({
        scholarship_name: 'Scholarship 1',
        description: 'First scholarship',
        provider: 'Provider 1',
        eligibility: 'Students',
        application_link: 'https://example1.com/apply',
        deadline: new Date('2024-12-31'),
        award_amount: '$3000',
        image_link: null
      })
      .returning()
      .execute();

    const scholarship2Result = await db.insert(scholarshipsTable)
      .values({
        scholarship_name: 'Scholarship 2',
        description: 'Second scholarship',
        provider: 'Provider 2',
        eligibility: 'Graduate students',
        application_link: 'https://example2.com/apply',
        deadline: new Date('2024-11-30'),
        award_amount: '$4000',
        image_link: null
      })
      .returning()
      .execute();

    const scholarship1Id = scholarship1Result[0].id;
    const scholarship2Id = scholarship2Result[0].id;

    // Delete the first scholarship
    const deleteResult = await deleteScholarship({ id: scholarship1Id });
    expect(deleteResult).toBe(true);

    // Verify first scholarship is deleted
    const deletedScholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, scholarship1Id))
      .execute();
    expect(deletedScholarships).toHaveLength(0);

    // Verify second scholarship still exists
    const remainingScholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, scholarship2Id))
      .execute();
    expect(remainingScholarships).toHaveLength(1);
    expect(remainingScholarships[0].scholarship_name).toEqual('Scholarship 2');
  });

  it('should handle deletion with various scholarship data types', async () => {
    // Create scholarship with null image_link
    const scholarshipResult = await db.insert(scholarshipsTable)
      .values({
        scholarship_name: 'Minimal Scholarship',
        description: 'Basic scholarship without image',
        provider: 'Basic Provider',
        eligibility: 'All students',
        application_link: 'https://basic.com/apply',
        deadline: new Date('2024-10-15'),
        award_amount: 'Varies',
        image_link: null
      })
      .returning()
      .execute();

    const scholarshipId = scholarshipResult[0].id;

    // Delete the scholarship
    const result = await deleteScholarship({ id: scholarshipId });

    expect(result).toBe(true);

    // Verify deletion
    const scholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, scholarshipId))
      .execute();

    expect(scholarships).toHaveLength(0);
  });
});