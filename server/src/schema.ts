import { z } from 'zod';

// Competition schema
export const competitionSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  organizer: z.string(),
  deadline_registration_date: z.coerce.date(),
  registration_link: z.string().url(),
  guide_book_link: z.string().url().nullable(),
  price_register: z.string(), // e.g., "Free", "Rp 50.000", "N/A"
  place: z.string(), // e.g., "Online", "Jakarta", "Universitas Indonesia"
  category: z.string(), // e.g., "Middle School", "High School", "College", "General"
  image_link: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Competition = z.infer<typeof competitionSchema>;

// Input schema for creating competitions
export const createCompetitionInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  organizer: z.string().min(1),
  deadline_registration_date: z.coerce.date(),
  registration_link: z.string().url(),
  guide_book_link: z.string().url().nullable(),
  price_register: z.string().min(1),
  place: z.string().min(1),
  category: z.string().min(1),
  image_link: z.string().url().nullable()
});

export type CreateCompetitionInput = z.infer<typeof createCompetitionInputSchema>;

// Input schema for updating competitions
export const updateCompetitionInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  organizer: z.string().min(1).optional(),
  deadline_registration_date: z.coerce.date().optional(),
  registration_link: z.string().url().optional(),
  guide_book_link: z.string().url().nullable().optional(),
  price_register: z.string().min(1).optional(),
  place: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  image_link: z.string().url().nullable().optional()
});

export type UpdateCompetitionInput = z.infer<typeof updateCompetitionInputSchema>;

// Job schema
export const jobSchema = z.object({
  id: z.number(),
  job_title: z.string(),
  company: z.string(),
  location: z.string(),
  job_description: z.string(),
  application_link: z.string().url(),
  deadline: z.coerce.date(),
  required_experience: z.string(), // e.g., "Entry-level", "3+ years", "N/A"
  image_link: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Job = z.infer<typeof jobSchema>;

// Input schema for creating jobs
export const createJobInputSchema = z.object({
  job_title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  job_description: z.string().min(1),
  application_link: z.string().url(),
  deadline: z.coerce.date(),
  required_experience: z.string().min(1),
  image_link: z.string().url().nullable()
});

export type CreateJobInput = z.infer<typeof createJobInputSchema>;

// Input schema for updating jobs
export const updateJobInputSchema = z.object({
  id: z.number(),
  job_title: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  job_description: z.string().min(1).optional(),
  application_link: z.string().url().optional(),
  deadline: z.coerce.date().optional(),
  required_experience: z.string().min(1).optional(),
  image_link: z.string().url().nullable().optional()
});

export type UpdateJobInput = z.infer<typeof updateJobInputSchema>;

// Scholarship schema
export const scholarshipSchema = z.object({
  id: z.number(),
  scholarship_name: z.string(),
  description: z.string(),
  provider: z.string(),
  eligibility: z.string(),
  application_link: z.string().url(),
  deadline: z.coerce.date(),
  award_amount: z.string(), // e.g., "Full Tuition", "$5000", "Varies"
  image_link: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Scholarship = z.infer<typeof scholarshipSchema>;

// Input schema for creating scholarships
export const createScholarshipInputSchema = z.object({
  scholarship_name: z.string().min(1),
  description: z.string().min(1),
  provider: z.string().min(1),
  eligibility: z.string().min(1),
  application_link: z.string().url(),
  deadline: z.coerce.date(),
  award_amount: z.string().min(1),
  image_link: z.string().url().nullable()
});

export type CreateScholarshipInput = z.infer<typeof createScholarshipInputSchema>;

// Input schema for updating scholarships
export const updateScholarshipInputSchema = z.object({
  id: z.number(),
  scholarship_name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  provider: z.string().min(1).optional(),
  eligibility: z.string().min(1).optional(),
  application_link: z.string().url().optional(),
  deadline: z.coerce.date().optional(),
  award_amount: z.string().min(1).optional(),
  image_link: z.string().url().nullable().optional()
});

export type UpdateScholarshipInput = z.infer<typeof updateScholarshipInputSchema>;

// Query parameter schemas for filtering
export const competitionFilterSchema = z.object({
  category: z.string().optional(),
  place: z.string().optional(),
  price_register: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type CompetitionFilter = z.infer<typeof competitionFilterSchema>;

export const jobFilterSchema = z.object({
  location: z.string().optional(),
  company: z.string().optional(),
  required_experience: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type JobFilter = z.infer<typeof jobFilterSchema>;

export const scholarshipFilterSchema = z.object({
  provider: z.string().optional(),
  award_amount: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type ScholarshipFilter = z.infer<typeof scholarshipFilterSchema>;

// ID parameter schema for single item queries
export const idParamSchema = z.object({
  id: z.number().int().positive()
});

export type IdParam = z.infer<typeof idParamSchema>;