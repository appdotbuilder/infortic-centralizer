import { db } from '../db';
import { jobsTable } from '../db/schema';
import { type CreateJobInput, type Job } from '../schema';

export const createJob = async (input: CreateJobInput): Promise<Job> => {
  try {
    // Insert job record
    const result = await db.insert(jobsTable)
      .values({
        job_title: input.job_title,
        company: input.company,
        location: input.location,
        job_description: input.job_description,
        application_link: input.application_link,
        deadline: input.deadline,
        required_experience: input.required_experience,
        image_link: input.image_link
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Job creation failed:', error);
    throw error;
  }
};