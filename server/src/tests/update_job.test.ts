import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type CreateJobInput, type UpdateJobInput } from '../schema';
import { updateJob } from '../handlers/update_job';

// Test data for creating jobs
const testJobData: CreateJobInput = {
  job_title: 'Software Engineer',
  company: 'Tech Corp',
  location: 'Jakarta',
  job_description: 'Develop software applications',
  application_link: 'https://example.com/apply',
  deadline: new Date('2024-12-31'),
  required_experience: '2+ years',
  image_link: 'https://example.com/image.jpg'
};

describe('updateJob', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a job successfully', async () => {
    // Create a job first
    const createdJob = await db.insert(jobsTable)
      .values({
        ...testJobData
      })
      .returning()
      .execute();

    const jobId = createdJob[0].id;
    const originalUpdatedAt = createdJob[0].updated_at;

    // Update the job
    const updateInput: UpdateJobInput = {
      id: jobId,
      job_title: 'Senior Software Engineer',
      company: 'Better Tech Corp',
      location: 'Bandung'
    };

    const result = await updateJob(updateInput);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(jobId);
    expect(result!.job_title).toEqual('Senior Software Engineer');
    expect(result!.company).toEqual('Better Tech Corp');
    expect(result!.location).toEqual('Bandung');
    
    // Unchanged fields should remain the same
    expect(result!.job_description).toEqual(testJobData.job_description);
    expect(result!.application_link).toEqual(testJobData.application_link);
    expect(result!.deadline).toEqual(testJobData.deadline);
    expect(result!.required_experience).toEqual(testJobData.required_experience);
    expect(result!.image_link).toEqual(testJobData.image_link);
    
    // updated_at should be different from original
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update job in database', async () => {
    // Create a job first
    const createdJob = await db.insert(jobsTable)
      .values({
        ...testJobData
      })
      .returning()
      .execute();

    const jobId = createdJob[0].id;

    // Update the job
    const updateInput: UpdateJobInput = {
      id: jobId,
      job_title: 'Lead Developer',
      required_experience: '5+ years'
    };

    await updateJob(updateInput);

    // Verify the job was updated in database
    const updatedJob = await db.select()
      .from(jobsTable)
      .where(eq(jobsTable.id, jobId))
      .execute();

    expect(updatedJob).toHaveLength(1);
    expect(updatedJob[0].job_title).toEqual('Lead Developer');
    expect(updatedJob[0].required_experience).toEqual('5+ years');
    expect(updatedJob[0].company).toEqual(testJobData.company); // Unchanged
    expect(updatedJob[0].location).toEqual(testJobData.location); // Unchanged
  });

  it('should return null for non-existent job', async () => {
    const updateInput: UpdateJobInput = {
      id: 999,
      job_title: 'Non-existent Job'
    };

    const result = await updateJob(updateInput);
    expect(result).toBeNull();
  });

  it('should handle partial updates with nullable fields', async () => {
    // Create a job with nullable fields
    const createdJob = await db.insert(jobsTable)
      .values({
        ...testJobData,
        image_link: null
      })
      .returning()
      .execute();

    const jobId = createdJob[0].id;

    // Update with nullable field
    const updateInput: UpdateJobInput = {
      id: jobId,
      image_link: 'https://example.com/new-image.jpg'
    };

    const result = await updateJob(updateInput);

    expect(result).not.toBeNull();
    expect(result!.image_link).toEqual('https://example.com/new-image.jpg');
    expect(result!.job_title).toEqual(testJobData.job_title); // Unchanged
  });

  it('should handle updates with null values', async () => {
    // Create a job first
    const createdJob = await db.insert(jobsTable)
      .values({
        ...testJobData
      })
      .returning()
      .execute();

    const jobId = createdJob[0].id;

    // Update with null value
    const updateInput: UpdateJobInput = {
      id: jobId,
      image_link: null
    };

    const result = await updateJob(updateInput);

    expect(result).not.toBeNull();
    expect(result!.image_link).toBeNull();
    expect(result!.job_title).toEqual(testJobData.job_title); // Unchanged
  });

  it('should return existing job when no update fields provided', async () => {
    // Create a job first
    const createdJob = await db.insert(jobsTable)
      .values({
        ...testJobData
      })
      .returning()
      .execute();

    const jobId = createdJob[0].id;
    const originalUpdatedAt = createdJob[0].updated_at;

    // Update with only ID (no fields to update)
    const updateInput: UpdateJobInput = {
      id: jobId
    };

    const result = await updateJob(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(jobId);
    expect(result!.job_title).toEqual(testJobData.job_title);
    expect(result!.updated_at).toEqual(originalUpdatedAt); // Should not change
  });

  it('should update deadline date field correctly', async () => {
    // Create a job first
    const createdJob = await db.insert(jobsTable)
      .values({
        ...testJobData
      })
      .returning()
      .execute();

    const jobId = createdJob[0].id;
    const newDeadline = new Date('2025-06-30');

    // Update deadline
    const updateInput: UpdateJobInput = {
      id: jobId,
      deadline: newDeadline
    };

    const result = await updateJob(updateInput);

    expect(result).not.toBeNull();
    expect(result!.deadline).toEqual(newDeadline);
    expect(result!.deadline).toBeInstanceOf(Date);
  });

  it('should handle multiple field updates simultaneously', async () => {
    // Create a job first
    const createdJob = await db.insert(jobsTable)
      .values({
        ...testJobData
      })
      .returning()
      .execute();

    const jobId = createdJob[0].id;

    // Update multiple fields at once
    const updateInput: UpdateJobInput = {
      id: jobId,
      job_title: 'Full Stack Developer',
      company: 'New Company',
      location: 'Remote',
      job_description: 'Build web applications',
      required_experience: '3+ years',
      deadline: new Date('2025-01-15'),
      image_link: null
    };

    const result = await updateJob(updateInput);

    expect(result).not.toBeNull();
    expect(result!.job_title).toEqual('Full Stack Developer');
    expect(result!.company).toEqual('New Company');
    expect(result!.location).toEqual('Remote');
    expect(result!.job_description).toEqual('Build web applications');
    expect(result!.required_experience).toEqual('3+ years');
    expect(result!.deadline).toEqual(new Date('2025-01-15'));
    expect(result!.image_link).toBeNull();
    expect(result!.application_link).toEqual(testJobData.application_link); // Unchanged
  });
});