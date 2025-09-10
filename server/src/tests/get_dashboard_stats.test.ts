import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competitionsTable, jobsTable, scholarshipsTable } from '../db/schema';
import { getDashboardStats } from '../handlers/get_dashboard_stats';

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero counts for empty database', async () => {
    const result = await getDashboardStats();

    expect(result.total_competitions).toEqual(0);
    expect(result.total_jobs).toEqual(0);
    expect(result.total_scholarships).toEqual(0);
    expect(result.competitions_expiring_soon).toEqual(0);
    expect(result.jobs_expiring_soon).toEqual(0);
    expect(result.scholarships_expiring_soon).toEqual(0);
  });

  it('should count active competitions correctly', async () => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 30);
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 1);

    // Insert active competition
    await db.insert(competitionsTable).values({
      title: 'Active Competition',
      description: 'Test description',
      organizer: 'Test Organizer',
      deadline_registration_date: futureDate,
      registration_link: 'https://example.com',
      guide_book_link: 'https://guide.com',
      price_register: 'Free',
      place: 'Online',
      category: 'General',
      image_link: 'https://image.com'
    }).execute();

    // Insert expired competition (should not be counted)
    await db.insert(competitionsTable).values({
      title: 'Expired Competition',
      description: 'Test description',
      organizer: 'Test Organizer',
      deadline_registration_date: pastDate,
      registration_link: 'https://example.com',
      guide_book_link: null,
      price_register: 'Free',
      place: 'Online',
      category: 'General',
      image_link: null
    }).execute();

    const result = await getDashboardStats();

    expect(result.total_competitions).toEqual(1);
    expect(result.total_jobs).toEqual(0);
    expect(result.total_scholarships).toEqual(0);
  });

  it('should count competitions expiring soon correctly', async () => {
    const now = new Date();
    const soonDate = new Date();
    soonDate.setDate(now.getDate() + 5); // Within 7 days
    const laterDate = new Date();
    laterDate.setDate(now.getDate() + 30); // Beyond 7 days

    // Insert competition expiring soon
    await db.insert(competitionsTable).values({
      title: 'Expiring Soon Competition',
      description: 'Test description',
      organizer: 'Test Organizer',
      deadline_registration_date: soonDate,
      registration_link: 'https://example.com',
      guide_book_link: null,
      price_register: 'Free',
      place: 'Online',
      category: 'General',
      image_link: null
    }).execute();

    // Insert competition expiring later
    await db.insert(competitionsTable).values({
      title: 'Later Competition',
      description: 'Test description',
      organizer: 'Test Organizer',
      deadline_registration_date: laterDate,
      registration_link: 'https://example.com',
      guide_book_link: null,
      price_register: 'Free',
      place: 'Online',
      category: 'General',
      image_link: null
    }).execute();

    const result = await getDashboardStats();

    expect(result.total_competitions).toEqual(2); // Both active
    expect(result.competitions_expiring_soon).toEqual(1); // Only one expiring soon
  });

  it('should count active jobs correctly', async () => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 30);
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 1);

    // Insert active job
    await db.insert(jobsTable).values({
      job_title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Jakarta',
      job_description: 'Build awesome software',
      application_link: 'https://apply.com',
      deadline: futureDate,
      required_experience: 'Entry-level',
      image_link: 'https://image.com'
    }).execute();

    // Insert expired job
    await db.insert(jobsTable).values({
      job_title: 'Expired Job',
      company: 'Old Corp',
      location: 'Jakarta',
      job_description: 'This job expired',
      application_link: 'https://apply.com',
      deadline: pastDate,
      required_experience: 'Entry-level',
      image_link: null
    }).execute();

    const result = await getDashboardStats();

    expect(result.total_jobs).toEqual(1);
    expect(result.total_competitions).toEqual(0);
    expect(result.total_scholarships).toEqual(0);
  });

  it('should count jobs expiring soon correctly', async () => {
    const now = new Date();
    const soonDate = new Date();
    soonDate.setDate(now.getDate() + 3); // Within 7 days
    const laterDate = new Date();
    laterDate.setDate(now.getDate() + 15); // Beyond 7 days

    // Insert job expiring soon
    await db.insert(jobsTable).values({
      job_title: 'Urgent Job',
      company: 'Fast Corp',
      location: 'Jakarta',
      job_description: 'Apply quickly!',
      application_link: 'https://apply.com',
      deadline: soonDate,
      required_experience: 'Entry-level',
      image_link: null
    }).execute();

    // Insert job expiring later
    await db.insert(jobsTable).values({
      job_title: 'Regular Job',
      company: 'Normal Corp',
      location: 'Jakarta',
      job_description: 'Regular application timeline',
      application_link: 'https://apply.com',
      deadline: laterDate,
      required_experience: 'Entry-level',
      image_link: null
    }).execute();

    const result = await getDashboardStats();

    expect(result.total_jobs).toEqual(2); // Both active
    expect(result.jobs_expiring_soon).toEqual(1); // Only one expiring soon
  });

  it('should count active scholarships correctly', async () => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 30);
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 1);

    // Insert active scholarship
    await db.insert(scholarshipsTable).values({
      scholarship_name: 'Excellence Scholarship',
      description: 'For outstanding students',
      provider: 'Education Foundation',
      eligibility: 'GPA > 3.5',
      application_link: 'https://apply.com',
      deadline: futureDate,
      award_amount: '$5000',
      image_link: 'https://image.com'
    }).execute();

    // Insert expired scholarship
    await db.insert(scholarshipsTable).values({
      scholarship_name: 'Expired Scholarship',
      description: 'This scholarship expired',
      provider: 'Old Foundation',
      eligibility: 'Anyone',
      application_link: 'https://apply.com',
      deadline: pastDate,
      award_amount: '$1000',
      image_link: null
    }).execute();

    const result = await getDashboardStats();

    expect(result.total_scholarships).toEqual(1);
    expect(result.total_competitions).toEqual(0);
    expect(result.total_jobs).toEqual(0);
  });

  it('should count scholarships expiring soon correctly', async () => {
    const now = new Date();
    const soonDate = new Date();
    soonDate.setDate(now.getDate() + 6); // Within 7 days
    const laterDate = new Date();
    laterDate.setDate(now.getDate() + 20); // Beyond 7 days

    // Insert scholarship expiring soon
    await db.insert(scholarshipsTable).values({
      scholarship_name: 'Urgent Scholarship',
      description: 'Apply soon!',
      provider: 'Quick Foundation',
      eligibility: 'GPA > 3.0',
      application_link: 'https://apply.com',
      deadline: soonDate,
      award_amount: '$3000',
      image_link: null
    }).execute();

    // Insert scholarship expiring later
    await db.insert(scholarshipsTable).values({
      scholarship_name: 'Regular Scholarship',
      description: 'Normal timeline',
      provider: 'Standard Foundation',
      eligibility: 'GPA > 3.0',
      application_link: 'https://apply.com',
      deadline: laterDate,
      award_amount: '$2000',
      image_link: null
    }).execute();

    const result = await getDashboardStats();

    expect(result.total_scholarships).toEqual(2); // Both active
    expect(result.scholarships_expiring_soon).toEqual(1); // Only one expiring soon
  });

  it('should handle mixed data correctly', async () => {
    const now = new Date();
    const soonDate = new Date();
    soonDate.setDate(now.getDate() + 4); // Within 7 days
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 30); // Beyond 7 days
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 1); // Expired

    // Insert competitions
    await db.insert(competitionsTable).values([
      {
        title: 'Competition Soon',
        description: 'Test',
        organizer: 'Organizer',
        deadline_registration_date: soonDate,
        registration_link: 'https://example.com',
        guide_book_link: null,
        price_register: 'Free',
        place: 'Online',
        category: 'General',
        image_link: null
      },
      {
        title: 'Competition Later',
        description: 'Test',
        organizer: 'Organizer',
        deadline_registration_date: futureDate,
        registration_link: 'https://example.com',
        guide_book_link: null,
        price_register: 'Free',
        place: 'Online',
        category: 'General',
        image_link: null
      },
      {
        title: 'Competition Expired',
        description: 'Test',
        organizer: 'Organizer',
        deadline_registration_date: pastDate,
        registration_link: 'https://example.com',
        guide_book_link: null,
        price_register: 'Free',
        place: 'Online',
        category: 'General',
        image_link: null
      }
    ]).execute();

    // Insert jobs
    await db.insert(jobsTable).values([
      {
        job_title: 'Job Soon',
        company: 'Company',
        location: 'Jakarta',
        job_description: 'Description',
        application_link: 'https://apply.com',
        deadline: soonDate,
        required_experience: 'Entry-level',
        image_link: null
      },
      {
        job_title: 'Job Later',
        company: 'Company',
        location: 'Jakarta',
        job_description: 'Description',
        application_link: 'https://apply.com',
        deadline: futureDate,
        required_experience: 'Entry-level',
        image_link: null
      }
    ]).execute();

    // Insert scholarships
    await db.insert(scholarshipsTable).values([
      {
        scholarship_name: 'Scholarship Soon',
        description: 'Description',
        provider: 'Provider',
        eligibility: 'Eligibility',
        application_link: 'https://apply.com',
        deadline: soonDate,
        award_amount: '$1000',
        image_link: null
      }
    ]).execute();

    const result = await getDashboardStats();

    expect(result.total_competitions).toEqual(2); // 2 active (future + soon)
    expect(result.total_jobs).toEqual(2); // 2 active (future + soon)
    expect(result.total_scholarships).toEqual(1); // 1 active
    expect(result.competitions_expiring_soon).toEqual(1); // 1 competition expiring soon
    expect(result.jobs_expiring_soon).toEqual(1); // 1 job expiring soon
    expect(result.scholarships_expiring_soon).toEqual(1); // 1 scholarship expiring soon
  });

  it('should handle boundary dates correctly', async () => {
    const now = new Date();
    const exactlySevenDays = new Date();
    exactlySevenDays.setDate(now.getDate() + 7);

    // Insert competition expiring exactly at 7-day boundary
    await db.insert(competitionsTable).values({
      title: 'Boundary Competition',
      description: 'Test',
      organizer: 'Organizer',
      deadline_registration_date: exactlySevenDays,
      registration_link: 'https://example.com',
      guide_book_link: null,
      price_register: 'Free',
      place: 'Online',
      category: 'General',
      image_link: null
    }).execute();

    const result = await getDashboardStats();

    expect(result.total_competitions).toEqual(1); // Should be active
    expect(result.competitions_expiring_soon).toEqual(1); // Should be expiring soon (within 7 days)
  });
});