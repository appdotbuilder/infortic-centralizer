import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobsTable } from '../db/schema';
import { type CreateJobInput } from '../schema';
import { createJob } from '../handlers/create_job';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateJobInput = {
  job_title: 'Software Engineer',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  job_description: 'We are looking for a talented software engineer to join our team.',
  application_link: 'https://techcorp.com/apply',
  deadline: new Date('2024-12-31T23:59:59Z'),
  required_experience: '3+ years',
  image_link: 'https://techcorp.com/logo.png'
};

// Test input with nullable field set to null
const testInputNullImage: CreateJobInput = {
  job_title: 'Data Analyst',
  company: 'Data Solutions Inc',
  location: 'New York, NY',
  job_description: 'Looking for a data analyst to help us make data-driven decisions.',
  application_link: 'https://datasolutions.com/careers',
  deadline: new Date('2024-11-15T23:59:59Z'),
  required_experience: 'Entry-level',
  image_link: null
};

describe('createJob', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a job with all fields', async () => {
    const result = await createJob(testInput);

    // Basic field validation
    expect(result.job_title).toEqual('Software Engineer');
    expect(result.company).toEqual('Tech Corp');
    expect(result.location).toEqual('San Francisco, CA');
    expect(result.job_description).toEqual(testInput.job_description);
    expect(result.application_link).toEqual('https://techcorp.com/apply');
    expect(result.deadline).toEqual(testInput.deadline);
    expect(result.required_experience).toEqual('3+ years');
    expect(result.image_link).toEqual('https://techcorp.com/logo.png');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a job with null image_link', async () => {
    const result = await createJob(testInputNullImage);

    expect(result.job_title).toEqual('Data Analyst');
    expect(result.company).toEqual('Data Solutions Inc');
    expect(result.location).toEqual('New York, NY');
    expect(result.image_link).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save job to database', async () => {
    const result = await createJob(testInput);

    // Query database to verify job was saved
    const jobs = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, result.id))
      .execute();

    expect(jobs).toHaveLength(1);
    const savedJob = jobs[0];
    
    expect(savedJob.job_title).toEqual('Software Engineer');
    expect(savedJob.company).toEqual('Tech Corp');
    expect(savedJob.location).toEqual('San Francisco, CA');
    expect(savedJob.job_description).toEqual(testInput.job_description);
    expect(savedJob.application_link).toEqual('https://techcorp.com/apply');
    expect(savedJob.deadline).toEqual(testInput.deadline);
    expect(savedJob.required_experience).toEqual('3+ years');
    expect(savedJob.image_link).toEqual('https://techcorp.com/logo.png');
    expect(savedJob.created_at).toBeInstanceOf(Date);
    expect(savedJob.updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple job creations independently', async () => {
    const result1 = await createJob(testInput);
    const result2 = await createJob(testInputNullImage);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.job_title).toEqual('Software Engineer');
    expect(result2.job_title).toEqual('Data Analyst');

    // Verify both jobs exist in database
    const allJobs = await db.select()
      .from(jobsTable)
      .execute();

    expect(allJobs).toHaveLength(2);
    
    const jobTitles = allJobs.map(job => job.job_title).sort();
    expect(jobTitles).toEqual(['Data Analyst', 'Software Engineer']);
  });

  it('should preserve exact deadline datetime', async () => {
    const specificDeadline = new Date('2024-06-15T14:30:00Z');
    const inputWithSpecificDeadline: CreateJobInput = {
      ...testInput,
      deadline: specificDeadline
    };

    const result = await createJob(inputWithSpecificDeadline);

    expect(result.deadline).toEqual(specificDeadline);
    expect(result.deadline.getTime()).toEqual(specificDeadline.getTime());

    // Verify in database
    const savedJob = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, result.id))
      .execute();

    expect(savedJob[0].deadline).toEqual(specificDeadline);
  });
});