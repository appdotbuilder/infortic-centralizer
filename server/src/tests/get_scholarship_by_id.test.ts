import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { scholarshipsTable } from '../db/schema';
import { type IdParam } from '../schema';
import { getScholarshipById } from '../handlers/get_scholarship_by_id';

describe('getScholarshipById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return scholarship when found and not expired', async () => {
    // Create test scholarship with future deadline
    const futureDeadline = new Date();
    futureDeadline.setDate(futureDeadline.getDate() + 30);

    const insertResult = await db.insert(scholarshipsTable)
      .values({
        scholarship_name: 'Test Scholarship',
        description: 'A scholarship for testing',
        provider: 'Test Provider',
        eligibility: 'Test eligibility requirements',
        application_link: 'https://example.com/apply',
        deadline: futureDeadline,
        award_amount: '$5000',
        image_link: 'https://example.com/image.jpg'
      })
      .returning()
      .execute();

    const scholarshipId = insertResult[0].id;
    const params: IdParam = { id: scholarshipId };

    const result = await getScholarshipById(params);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(scholarshipId);
    expect(result!.scholarship_name).toEqual('Test Scholarship');
    expect(result!.description).toEqual('A scholarship for testing');
    expect(result!.provider).toEqual('Test Provider');
    expect(result!.eligibility).toEqual('Test eligibility requirements');
    expect(result!.application_link).toEqual('https://example.com/apply');
    expect(result!.deadline).toBeInstanceOf(Date);
    expect(result!.award_amount).toEqual('$5000');
    expect(result!.image_link).toEqual('https://example.com/image.jpg');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when scholarship not found', async () => {
    const params: IdParam = { id: 99999 };
    
    const result = await getScholarshipById(params);
    
    expect(result).toBeNull();
  });

  it('should return null when scholarship is expired', async () => {
    // Create test scholarship with past deadline
    const pastDeadline = new Date();
    pastDeadline.setDate(pastDeadline.getDate() - 1);

    const insertResult = await db.insert(scholarshipsTable)
      .values({
        scholarship_name: 'Expired Scholarship',
        description: 'An expired scholarship for testing',
        provider: 'Test Provider',
        eligibility: 'Test eligibility requirements',
        application_link: 'https://example.com/apply',
        deadline: pastDeadline,
        award_amount: '$3000',
        image_link: null
      })
      .returning()
      .execute();

    const scholarshipId = insertResult[0].id;
    const params: IdParam = { id: scholarshipId };

    const result = await getScholarshipById(params);

    expect(result).toBeNull();
  });

  it('should handle scholarship with null image_link correctly', async () => {
    // Create test scholarship without image
    const futureDeadline = new Date();
    futureDeadline.setDate(futureDeadline.getDate() + 15);

    const insertResult = await db.insert(scholarshipsTable)
      .values({
        scholarship_name: 'No Image Scholarship',
        description: 'A scholarship without image',
        provider: 'No Image Provider',
        eligibility: 'Basic requirements',
        application_link: 'https://example.com/no-image-apply',
        deadline: futureDeadline,
        award_amount: 'Full Tuition',
        image_link: null
      })
      .returning()
      .execute();

    const scholarshipId = insertResult[0].id;
    const params: IdParam = { id: scholarshipId };

    const result = await getScholarshipById(params);

    expect(result).not.toBeNull();
    expect(result!.scholarship_name).toEqual('No Image Scholarship');
    expect(result!.image_link).toBeNull();
    expect(result!.award_amount).toEqual('Full Tuition');
  });

  it('should handle scholarship exactly at deadline boundary', async () => {
    // Create test scholarship with deadline very close to now (but still future)
    const now = new Date();
    const almostExpired = new Date(now.getTime() + 1000); // 1 second in future

    const insertResult = await db.insert(scholarshipsTable)
      .values({
        scholarship_name: 'Almost Expired Scholarship',
        description: 'A scholarship about to expire',
        provider: 'Time Provider',
        eligibility: 'Quick application needed',
        application_link: 'https://example.com/urgent',
        deadline: almostExpired,
        award_amount: 'Varies',
        image_link: null
      })
      .returning()
      .execute();

    const scholarshipId = insertResult[0].id;
    const params: IdParam = { id: scholarshipId };

    const result = await getScholarshipById(params);

    expect(result).not.toBeNull();
    expect(result!.scholarship_name).toEqual('Almost Expired Scholarship');
  });
});