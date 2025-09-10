import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobsTable } from '../db/schema';
import { type JobFilter, type CreateJobInput } from '../schema';
import { getJobs } from '../handlers/get_jobs';

// Test data setup
const createTestJob = (overrides: Partial<CreateJobInput> = {}): CreateJobInput => ({
  job_title: 'Software Developer',
  company: 'Tech Corp',
  location: 'Jakarta',
  job_description: 'Develop software applications',
  application_link: 'https://example.com/apply',
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  required_experience: 'Entry-level',
  image_link: 'https://example.com/image.jpg',
  ...overrides
});

const insertTestJob = async (jobData: CreateJobInput) => {
  const result = await db.insert(jobsTable)
    .values({
      ...jobData,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('getJobs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all non-expired jobs with no filter provided', async () => {
    // Create test jobs
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await insertTestJob(createTestJob({ 
      job_title: 'Frontend Developer',
      deadline: futureDate 
    }));
    await insertTestJob(createTestJob({ 
      job_title: 'Backend Developer',
      deadline: futureDate 
    }));

    const results = await getJobs();

    expect(results).toHaveLength(2);
    expect(results[0].job_title).toEqual('Frontend Developer');
    expect(results[1].job_title).toEqual('Backend Developer');
    expect(results[0].deadline).toBeInstanceOf(Date);
    expect(results[0].created_at).toBeInstanceOf(Date);
  });

  it('should return all non-expired jobs with default pagination', async () => {
    // Create test jobs
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await insertTestJob(createTestJob({ 
      job_title: 'Frontend Developer',
      deadline: futureDate 
    }));
    await insertTestJob(createTestJob({ 
      job_title: 'Backend Developer',
      deadline: futureDate 
    }));

    const filter: JobFilter = {
      limit: 20,
      offset: 0
    };

    const results = await getJobs(filter);

    expect(results).toHaveLength(2);
    expect(results[0].job_title).toEqual('Frontend Developer');
    expect(results[1].job_title).toEqual('Backend Developer');
    expect(results[0].deadline).toBeInstanceOf(Date);
    expect(results[0].created_at).toBeInstanceOf(Date);
  });

  it('should exclude expired jobs', async () => {
    // Create expired job
    const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
    await insertTestJob(createTestJob({ 
      job_title: 'Expired Job',
      deadline: expiredDate 
    }));

    // Create active job
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await insertTestJob(createTestJob({ 
      job_title: 'Active Job',
      deadline: futureDate 
    }));

    const filter: JobFilter = {
      limit: 20,
      offset: 0
    };

    const results = await getJobs(filter);

    expect(results).toHaveLength(1);
    expect(results[0].job_title).toEqual('Active Job');
  });

  it('should filter by location', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await insertTestJob(createTestJob({ 
      job_title: 'Jakarta Job',
      location: 'Jakarta',
      deadline: futureDate 
    }));
    await insertTestJob(createTestJob({ 
      job_title: 'Bandung Job',
      location: 'Bandung',
      deadline: futureDate 
    }));

    const filter: JobFilter = {
      location: 'Jakarta',
      limit: 20,
      offset: 0
    };

    const results = await getJobs(filter);

    expect(results).toHaveLength(1);
    expect(results[0].job_title).toEqual('Jakarta Job');
    expect(results[0].location).toEqual('Jakarta');
  });

  it('should filter by company', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await insertTestJob(createTestJob({ 
      job_title: 'Job at Google',
      company: 'Google',
      deadline: futureDate 
    }));
    await insertTestJob(createTestJob({ 
      job_title: 'Job at Microsoft',
      company: 'Microsoft',
      deadline: futureDate 
    }));

    const filter: JobFilter = {
      company: 'Google',
      limit: 20,
      offset: 0
    };

    const results = await getJobs(filter);

    expect(results).toHaveLength(1);
    expect(results[0].job_title).toEqual('Job at Google');
    expect(results[0].company).toEqual('Google');
  });

  it('should filter by required experience', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await insertTestJob(createTestJob({ 
      job_title: 'Entry Level Job',
      required_experience: 'Entry-level',
      deadline: futureDate 
    }));
    await insertTestJob(createTestJob({ 
      job_title: 'Senior Job',
      required_experience: '5+ years',
      deadline: futureDate 
    }));

    const filter: JobFilter = {
      required_experience: 'Entry-level',
      limit: 20,
      offset: 0
    };

    const results = await getJobs(filter);

    expect(results).toHaveLength(1);
    expect(results[0].job_title).toEqual('Entry Level Job');
    expect(results[0].required_experience).toEqual('Entry-level');
  });

  it('should apply multiple filters together', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await insertTestJob(createTestJob({ 
      job_title: 'Perfect Match',
      company: 'Tech Corp',
      location: 'Jakarta',
      required_experience: 'Entry-level',
      deadline: futureDate 
    }));
    
    await insertTestJob(createTestJob({ 
      job_title: 'Wrong Company',
      company: 'Other Corp',
      location: 'Jakarta',
      required_experience: 'Entry-level',
      deadline: futureDate 
    }));

    const filter: JobFilter = {
      company: 'Tech Corp',
      location: 'Jakarta',
      required_experience: 'Entry-level',
      limit: 20,
      offset: 0
    };

    const results = await getJobs(filter);

    expect(results).toHaveLength(1);
    expect(results[0].job_title).toEqual('Perfect Match');
  });

  it('should apply pagination correctly', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Create 5 jobs
    for (let i = 1; i <= 5; i++) {
      await insertTestJob(createTestJob({ 
        job_title: `Job ${i}`,
        deadline: new Date(futureDate.getTime() + i * 24 * 60 * 60 * 1000) // Different deadlines for ordering
      }));
    }

    // Test first page
    const firstPage = await getJobs({
      limit: 2,
      offset: 0
    });

    expect(firstPage).toHaveLength(2);

    // Test second page
    const secondPage = await getJobs({
      limit: 2,
      offset: 2
    });

    expect(secondPage).toHaveLength(2);
    
    // Verify different jobs are returned
    expect(firstPage[0].id).not.toEqual(secondPage[0].id);
  });

  it('should order jobs by deadline (closest first)', async () => {
    const baseDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    
    await insertTestJob(createTestJob({ 
      job_title: 'Far Deadline',
      deadline: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    }));
    
    await insertTestJob(createTestJob({ 
      job_title: 'Near Deadline',
      deadline: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000)
    }));
    
    await insertTestJob(createTestJob({ 
      job_title: 'Medium Deadline',
      deadline: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000)
    }));

    const results = await getJobs({
      limit: 20,
      offset: 0
    });

    expect(results).toHaveLength(3);
    expect(results[0].job_title).toEqual('Near Deadline');
    expect(results[1].job_title).toEqual('Medium Deadline');
    expect(results[2].job_title).toEqual('Far Deadline');
  });

  it('should return empty array when no jobs match criteria', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await insertTestJob(createTestJob({ 
      company: 'Different Corp',
      deadline: futureDate 
    }));

    const filter: JobFilter = {
      company: 'Nonexistent Corp',
      limit: 20,
      offset: 0
    };

    const results = await getJobs(filter);

    expect(results).toHaveLength(0);
  });

  it('should handle jobs with null image_link correctly', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await insertTestJob(createTestJob({ 
      job_title: 'No Image Job',
      image_link: null,
      deadline: futureDate 
    }));

    const results = await getJobs({
      limit: 20,
      offset: 0
    });

    expect(results).toHaveLength(1);
    expect(results[0].job_title).toEqual('No Image Job');
    expect(results[0].image_link).toBeNull();
  });
});