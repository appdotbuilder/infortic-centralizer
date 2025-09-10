import { serial, text, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

// Competitions table
export const competitionsTable = pgTable('competitions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  organizer: text('organizer').notNull(),
  deadline_registration_date: timestamp('deadline_registration_date').notNull(),
  registration_link: text('registration_link').notNull(),
  guide_book_link: text('guide_book_link'), // Nullable
  price_register: text('price_register').notNull(), // e.g., "Free", "Rp 50.000", "N/A"
  place: text('place').notNull(), // e.g., "Online", "Jakarta", "Universitas Indonesia"
  category: text('category').notNull(), // e.g., "Middle School", "High School", "College", "General"
  image_link: text('image_link'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Jobs table
export const jobsTable = pgTable('jobs', {
  id: serial('id').primaryKey(),
  job_title: text('job_title').notNull(),
  company: text('company').notNull(),
  location: text('location').notNull(),
  job_description: text('job_description').notNull(),
  application_link: text('application_link').notNull(),
  deadline: timestamp('deadline').notNull(),
  required_experience: text('required_experience').notNull(), // e.g., "Entry-level", "3+ years", "N/A"
  image_link: text('image_link'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Scholarships table
export const scholarshipsTable = pgTable('scholarships', {
  id: serial('id').primaryKey(),
  scholarship_name: text('scholarship_name').notNull(),
  description: text('description').notNull(),
  provider: text('provider').notNull(),
  eligibility: text('eligibility').notNull(),
  application_link: text('application_link').notNull(),
  deadline: timestamp('deadline').notNull(),
  award_amount: text('award_amount').notNull(), // e.g., "Full Tuition", "$5000", "Varies"
  image_link: text('image_link'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type Competition = typeof competitionsTable.$inferSelect;
export type NewCompetition = typeof competitionsTable.$inferInsert;

export type Job = typeof jobsTable.$inferSelect;
export type NewJob = typeof jobsTable.$inferInsert;

export type Scholarship = typeof scholarshipsTable.$inferSelect;
export type NewScholarship = typeof scholarshipsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  competitions: competitionsTable,
  jobs: jobsTable,
  scholarships: scholarshipsTable
};