import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competitionsTable, jobsTable, scholarshipsTable } from '../db/schema';
import { cleanupExpiredData } from '../handlers/cleanup_expired_data';
import { eq } from 'drizzle-orm';

describe('cleanupExpiredData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero counts when no expired data exists', async () => {
    const result = await cleanupExpiredData();

    expect(result.competitions_deleted).toEqual(0);
    expect(result.jobs_deleted).toEqual(0);
    expect(result.scholarships_deleted).toEqual(0);
    expect(result.total_deleted).toEqual(0);
  });

  it('should delete expired competitions', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create expired competition
    const expiredCompetition = await db.insert(competitionsTable).values({
      title: 'Expired Competition',
      description: 'An expired competition',
      organizer: 'Test Organizer',
      deadline_registration_date: yesterday,
      registration_link: 'https://example.com/register',
      guide_book_link: 'https://example.com/guide',
      price_register: 'Free',
      place: 'Online',
      category: 'College',
      image_link: 'https://example.com/image.jpg'
    }).returning().execute();

    // Create non-expired competition
    const activeCompetition = await db.insert(competitionsTable).values({
      title: 'Active Competition',
      description: 'An active competition',
      organizer: 'Test Organizer',
      deadline_registration_date: tomorrow,
      registration_link: 'https://example.com/register2',
      guide_book_link: 'https://example.com/guide2',
      price_register: 'Rp 50.000',
      place: 'Jakarta',
      category: 'High School',
      image_link: 'https://example.com/image2.jpg'
    }).returning().execute();

    const result = await cleanupExpiredData();

    expect(result.competitions_deleted).toEqual(1);
    expect(result.jobs_deleted).toEqual(0);
    expect(result.scholarships_deleted).toEqual(0);
    expect(result.total_deleted).toEqual(1);

    // Verify expired competition was deleted
    const remainingCompetitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, expiredCompetition[0].id))
      .execute();
    expect(remainingCompetitions).toHaveLength(0);

    // Verify active competition remains
    const activeCompetitions = await db.select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, activeCompetition[0].id))
      .execute();
    expect(activeCompetitions).toHaveLength(1);
  });

  it('should delete expired jobs', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create expired job
    const expiredJob = await db.insert(jobsTable).values({
      job_title: 'Expired Job',
      company: 'Test Company',
      location: 'Remote',
      job_description: 'An expired job posting',
      application_link: 'https://example.com/apply',
      deadline: yesterday,
      required_experience: 'Entry-level',
      image_link: 'https://example.com/company.jpg'
    }).returning().execute();

    // Create non-expired job
    const activeJob = await db.insert(jobsTable).values({
      job_title: 'Active Job',
      company: 'Active Company',
      location: 'New York',
      job_description: 'An active job posting',
      application_link: 'https://example.com/apply2',
      deadline: tomorrow,
      required_experience: '3+ years',
      image_link: 'https://example.com/company2.jpg'
    }).returning().execute();

    const result = await cleanupExpiredData();

    expect(result.competitions_deleted).toEqual(0);
    expect(result.jobs_deleted).toEqual(1);
    expect(result.scholarships_deleted).toEqual(0);
    expect(result.total_deleted).toEqual(1);

    // Verify expired job was deleted
    const remainingJobs = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, expiredJob[0].id))
      .execute();
    expect(remainingJobs).toHaveLength(0);

    // Verify active job remains
    const activeJobs = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, activeJob[0].id))
      .execute();
    expect(activeJobs).toHaveLength(1);
  });

  it('should delete expired scholarships', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create expired scholarship
    const expiredScholarship = await db.insert(scholarshipsTable).values({
      scholarship_name: 'Expired Scholarship',
      description: 'An expired scholarship',
      provider: 'Test Foundation',
      eligibility: 'Undergraduate students',
      application_link: 'https://example.com/scholarship',
      deadline: yesterday,
      award_amount: '$5000',
      image_link: 'https://example.com/scholarship.jpg'
    }).returning().execute();

    // Create non-expired scholarship
    const activeScholarship = await db.insert(scholarshipsTable).values({
      scholarship_name: 'Active Scholarship',
      description: 'An active scholarship',
      provider: 'Active Foundation',
      eligibility: 'Graduate students',
      application_link: 'https://example.com/scholarship2',
      deadline: tomorrow,
      award_amount: 'Full Tuition',
      image_link: 'https://example.com/scholarship2.jpg'
    }).returning().execute();

    const result = await cleanupExpiredData();

    expect(result.competitions_deleted).toEqual(0);
    expect(result.jobs_deleted).toEqual(0);
    expect(result.scholarships_deleted).toEqual(1);
    expect(result.total_deleted).toEqual(1);

    // Verify expired scholarship was deleted
    const remainingScholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, expiredScholarship[0].id))
      .execute();
    expect(remainingScholarships).toHaveLength(0);

    // Verify active scholarship remains
    const activeScholarships = await db.select()
      .from(scholarshipsTable)
      .where(eq(scholarshipsTable.id, activeScholarship[0].id))
      .execute();
    expect(activeScholarships).toHaveLength(1);
  });

  it('should delete expired records from all tables simultaneously', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create expired records in all tables
    await db.insert(competitionsTable).values([
      {
        title: 'Expired Competition 1',
        description: 'First expired competition',
        organizer: 'Organizer 1',
        deadline_registration_date: yesterday,
        registration_link: 'https://example.com/comp1',
        guide_book_link: null,
        price_register: 'Free',
        place: 'Online',
        category: 'College',
        image_link: null
      },
      {
        title: 'Expired Competition 2',
        description: 'Second expired competition',
        organizer: 'Organizer 2',
        deadline_registration_date: yesterday,
        registration_link: 'https://example.com/comp2',
        guide_book_link: 'https://example.com/guide2',
        price_register: 'Rp 25.000',
        place: 'Bandung',
        category: 'High School',
        image_link: 'https://example.com/comp2.jpg'
      }
    ]).execute();

    await db.insert(jobsTable).values({
      job_title: 'Expired Job',
      company: 'Expired Corp',
      location: 'Jakarta',
      job_description: 'An expired job',
      application_link: 'https://example.com/job',
      deadline: yesterday,
      required_experience: '2+ years',
      image_link: null
    }).execute();

    await db.insert(scholarshipsTable).values([
      {
        scholarship_name: 'Expired Scholarship 1',
        description: 'First expired scholarship',
        provider: 'Foundation 1',
        eligibility: 'All students',
        application_link: 'https://example.com/schol1',
        deadline: yesterday,
        award_amount: '$3000',
        image_link: null
      },
      {
        scholarship_name: 'Expired Scholarship 2',
        description: 'Second expired scholarship',
        provider: 'Foundation 2',
        eligibility: 'PhD students',
        application_link: 'https://example.com/schol2',
        deadline: yesterday,
        award_amount: 'Varies',
        image_link: 'https://example.com/schol2.jpg'
      },
      {
        scholarship_name: 'Expired Scholarship 3',
        description: 'Third expired scholarship',
        provider: 'Foundation 3',
        eligibility: 'International students',
        application_link: 'https://example.com/schol3',
        deadline: yesterday,
        award_amount: 'Full Tuition',
        image_link: null
      }
    ]).execute();

    // Create some active records
    await db.insert(competitionsTable).values({
      title: 'Active Competition',
      description: 'An active competition',
      organizer: 'Active Organizer',
      deadline_registration_date: tomorrow,
      registration_link: 'https://example.com/active',
      guide_book_link: null,
      price_register: 'Free',
      place: 'Online',
      category: 'General',
      image_link: null
    }).execute();

    const result = await cleanupExpiredData();

    expect(result.competitions_deleted).toEqual(2);
    expect(result.jobs_deleted).toEqual(1);
    expect(result.scholarships_deleted).toEqual(3);
    expect(result.total_deleted).toEqual(6);

    // Verify only active records remain
    const remainingCompetitions = await db.select().from(competitionsTable).execute();
    expect(remainingCompetitions).toHaveLength(1);
    expect(remainingCompetitions[0].title).toEqual('Active Competition');

    const remainingJobs = await db.select().from(jobsTable).execute();
    expect(remainingJobs).toHaveLength(0);

    const remainingScholarships = await db.select().from(scholarshipsTable).execute();
    expect(remainingScholarships).toHaveLength(0);
  });

  it('should handle edge case with exact current time', async () => {
    const now = new Date();
    
    // Create record with deadline exactly at current time
    await db.insert(competitionsTable).values({
      title: 'Exact Time Competition',
      description: 'Competition with exact current time deadline',
      organizer: 'Test Organizer',
      deadline_registration_date: now,
      registration_link: 'https://example.com/exact',
      guide_book_link: null,
      price_register: 'Free',
      place: 'Online',
      category: 'General',
      image_link: null
    }).execute();

    // Wait a small amount to ensure the deadline is now in the past
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await cleanupExpiredData();

    expect(result.competitions_deleted).toEqual(1);
    expect(result.total_deleted).toEqual(1);
  });
});