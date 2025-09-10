import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobsTable } from '../db/schema';
import { type IdParam } from '../schema';
import { getJobById } from '../handlers/get_job_by_id';
import { eq } from 'drizzle-orm';

describe('getJobById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return job when found and not expired', async () => {
    // Create a job with future deadline
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days in the future

    const jobData = {
      job_title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Jakarta',
      job_description: 'Develop amazing software',
      application_link: 'https://example.com/apply',
      deadline: futureDate,
      required_experience: '2+ years',
      image_link: 'https://example.com/image.jpg'
    };

    const [insertedJob] = await db.insert(jobsTable)
      .values(jobData)
      .returning()
      .execute();

    const params: IdParam = { id: insertedJob.id };
    const result = await getJobById(params);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(insertedJob.id);
    expect(result!.job_title).toEqual('Software Engineer');
    expect(result!.company).toEqual('Tech Corp');
    expect(result!.location).toEqual('Jakarta');
    expect(result!.job_description).toEqual('Develop amazing software');
    expect(result!.application_link).toEqual('https://example.com/apply');
    expect(result!.deadline).toEqual(futureDate);
    expect(result!.required_experience).toEqual('2+ years');
    expect(result!.image_link).toEqual('https://example.com/image.jpg');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when job not found', async () => {
    const params: IdParam = { id: 99999 };
    const result = await getJobById(params);

    expect(result).toBeNull();
  });

  it('should return null when job is expired', async () => {
    // Create a job with past deadline
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7); // 7 days in the past

    const jobData = {
      job_title: 'Expired Job',
      company: 'Old Corp',
      location: 'Bandung',
      job_description: 'This job has expired',
      application_link: 'https://example.com/expired',
      deadline: pastDate,
      required_experience: '5+ years',
      image_link: null
    };

    const [insertedJob] = await db.insert(jobsTable)
      .values(jobData)
      .returning()
      .execute();

    const params: IdParam = { id: insertedJob.id };
    const result = await getJobById(params);

    expect(result).toBeNull();
  });

  it('should handle job with null image_link', async () => {
    // Create a job without image
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const jobData = {
      job_title: 'Remote Developer',
      company: 'Remote Inc',
      location: 'Remote',
      job_description: 'Work from anywhere',
      application_link: 'https://remote.com/apply',
      deadline: futureDate,
      required_experience: 'Entry-level',
      image_link: null
    };

    const [insertedJob] = await db.insert(jobsTable)
      .values(jobData)
      .returning()
      .execute();

    const params: IdParam = { id: insertedJob.id };
    const result = await getJobById(params);

    expect(result).not.toBeNull();
    expect(result!.image_link).toBeNull();
    expect(result!.job_title).toEqual('Remote Developer');
    expect(result!.company).toEqual('Remote Inc');
  });

  it('should handle job deadline exactly at current time', async () => {
    // Create a job with deadline very close to current time
    const now = new Date();
    const almostNow = new Date(now.getTime() + 1000); // 1 second in the future

    const jobData = {
      job_title: 'Time-sensitive Job',
      company: 'Quick Corp',
      location: 'Surabaya',
      job_description: 'Apply quickly',
      application_link: 'https://quick.com/apply',
      deadline: almostNow,
      required_experience: '1+ years',
      image_link: 'https://quick.com/logo.png'
    };

    const [insertedJob] = await db.insert(jobsTable)
      .values(jobData)
      .returning()
      .execute();

    const params: IdParam = { id: insertedJob.id };
    const result = await getJobById(params);

    // Should still be valid since deadline is slightly in the future
    expect(result).not.toBeNull();
    expect(result!.job_title).toEqual('Time-sensitive Job');
  });

  it('should verify job exists in database after creation', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const jobData = {
      job_title: 'Database Test Job',
      company: 'DB Corp',
      location: 'Yogyakarta',
      job_description: 'Test database operations',
      application_link: 'https://db.com/apply',
      deadline: futureDate,
      required_experience: '3+ years',
      image_link: null
    };

    const [insertedJob] = await db.insert(jobsTable)
      .values(jobData)
      .returning()
      .execute();

    // Verify job exists in database directly
    const dbJobs = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, insertedJob.id))
      .execute();

    expect(dbJobs).toHaveLength(1);
    expect(dbJobs[0].job_title).toEqual('Database Test Job');

    // Now test handler
    const params: IdParam = { id: insertedJob.id };
    const result = await getJobById(params);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(insertedJob.id);
  });
});