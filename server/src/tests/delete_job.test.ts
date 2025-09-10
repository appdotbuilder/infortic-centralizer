import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobsTable } from '../db/schema';
import { type IdParam, type CreateJobInput } from '../schema';
import { deleteJob } from '../handlers/delete_job';
import { eq } from 'drizzle-orm';

// Test input for creating a job
const testJobInput: CreateJobInput = {
  job_title: 'Software Engineer',
  company: 'Tech Company',
  location: 'Jakarta',
  job_description: 'Develop and maintain web applications',
  application_link: 'https://example.com/apply',
  deadline: new Date('2024-12-31'),
  required_experience: '2+ years',
  image_link: 'https://example.com/image.jpg'
};

describe('deleteJob', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing job', async () => {
    // First, create a job to delete
    const insertResult = await db.insert(jobsTable)
      .values({
        job_title: testJobInput.job_title,
        company: testJobInput.company,
        location: testJobInput.location,
        job_description: testJobInput.job_description,
        application_link: testJobInput.application_link,
        deadline: testJobInput.deadline,
        required_experience: testJobInput.required_experience,
        image_link: testJobInput.image_link
      })
      .returning()
      .execute();

    const createdJob = insertResult[0];
    const params: IdParam = { id: createdJob.id };

    // Delete the job
    const result = await deleteJob(params);

    // Should return true indicating successful deletion
    expect(result).toBe(true);

    // Verify the job is actually deleted from the database
    const jobs = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, createdJob.id))
      .execute();

    expect(jobs).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent job', async () => {
    const params: IdParam = { id: 999 }; // Non-existent ID

    const result = await deleteJob(params);

    // Should return false since no job was found to delete
    expect(result).toBe(false);
  });

  it('should not affect other jobs when deleting one job', async () => {
    // Create multiple jobs
    const job1Input = { ...testJobInput, job_title: 'Job 1' };
    const job2Input = { ...testJobInput, job_title: 'Job 2' };

    const insertResults = await Promise.all([
      db.insert(jobsTable).values(job1Input).returning().execute(),
      db.insert(jobsTable).values(job2Input).returning().execute()
    ]);

    const job1 = insertResults[0][0];
    const job2 = insertResults[1][0];

    // Delete only job1
    const result = await deleteJob({ id: job1.id });

    expect(result).toBe(true);

    // Verify job1 is deleted
    const deletedJob = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, job1.id))
      .execute();

    expect(deletedJob).toHaveLength(0);

    // Verify job2 still exists
    const remainingJob = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, job2.id))
      .execute();

    expect(remainingJob).toHaveLength(1);
    expect(remainingJob[0].job_title).toEqual('Job 2');
  });

  it('should handle deletion with minimum required fields', async () => {
    // Create job with minimal data (nulls for optional fields)
    const minimalJobInput = {
      job_title: 'Minimal Job',
      company: 'Minimal Company',
      location: 'Remote',
      job_description: 'Basic description',
      application_link: 'https://minimal.com/apply',
      deadline: new Date('2024-06-01'),
      required_experience: 'Entry-level',
      image_link: null // Nullable field
    };

    const insertResult = await db.insert(jobsTable)
      .values(minimalJobInput)
      .returning()
      .execute();

    const createdJob = insertResult[0];

    // Delete the minimal job
    const result = await deleteJob({ id: createdJob.id });

    expect(result).toBe(true);

    // Verify deletion
    const jobs = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, createdJob.id))
      .execute();

    expect(jobs).toHaveLength(0);
  });
});