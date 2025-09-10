import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createCompetitionInputSchema,
  updateCompetitionInputSchema,
  competitionFilterSchema,
  createJobInputSchema,
  updateJobInputSchema,
  jobFilterSchema,
  createScholarshipInputSchema,
  updateScholarshipInputSchema,
  scholarshipFilterSchema,
  idParamSchema
} from './schema';

// Import handlers
import { createCompetition } from './handlers/create_competition';
import { getCompetitions } from './handlers/get_competitions';
import { getCompetitionById } from './handlers/get_competition_by_id';
import { updateCompetition } from './handlers/update_competition';
import { deleteCompetition } from './handlers/delete_competition';

import { createJob } from './handlers/create_job';
import { getJobs } from './handlers/get_jobs';
import { getJobById } from './handlers/get_job_by_id';
import { updateJob } from './handlers/update_job';
import { deleteJob } from './handlers/delete_job';

import { createScholarship } from './handlers/create_scholarship';
import { getScholarships } from './handlers/get_scholarships';
import { getScholarshipById } from './handlers/get_scholarship_by_id';
import { updateScholarship } from './handlers/update_scholarship';
import { deleteScholarship } from './handlers/delete_scholarship';

import { cleanupExpiredData } from './handlers/cleanup_expired_data';
import { getDashboardStats } from './handlers/get_dashboard_stats';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Competition routes
  createCompetition: publicProcedure
    .input(createCompetitionInputSchema)
    .mutation(({ input }) => createCompetition(input)),

  getCompetitions: publicProcedure
    .input(competitionFilterSchema.optional())
    .query(({ input }) => getCompetitions(input)),

  getCompetitionById: publicProcedure
    .input(idParamSchema)
    .query(({ input }) => getCompetitionById(input)),

  updateCompetition: publicProcedure
    .input(updateCompetitionInputSchema)
    .mutation(({ input }) => updateCompetition(input)),

  deleteCompetition: publicProcedure
    .input(idParamSchema)
    .mutation(({ input }) => deleteCompetition(input)),

  // Job routes
  createJob: publicProcedure
    .input(createJobInputSchema)
    .mutation(({ input }) => createJob(input)),

  getJobs: publicProcedure
    .input(jobFilterSchema.optional())
    .query(({ input }) => getJobs(input)),

  getJobById: publicProcedure
    .input(idParamSchema)
    .query(({ input }) => getJobById(input)),

  updateJob: publicProcedure
    .input(updateJobInputSchema)
    .mutation(({ input }) => updateJob(input)),

  deleteJob: publicProcedure
    .input(idParamSchema)
    .mutation(({ input }) => deleteJob(input)),

  // Scholarship routes
  createScholarship: publicProcedure
    .input(createScholarshipInputSchema)
    .mutation(({ input }) => createScholarship(input)),

  getScholarships: publicProcedure
    .input(scholarshipFilterSchema.optional())
    .query(({ input }) => getScholarships(input)),

  getScholarshipById: publicProcedure
    .input(idParamSchema)
    .query(({ input }) => getScholarshipById(input)),

  updateScholarship: publicProcedure
    .input(updateScholarshipInputSchema)
    .mutation(({ input }) => updateScholarship(input)),

  deleteScholarship: publicProcedure
    .input(idParamSchema)
    .mutation(({ input }) => deleteScholarship(input)),

  // Utility routes
  cleanupExpiredData: publicProcedure
    .mutation(() => cleanupExpiredData()),

  getDashboardStats: publicProcedure
    .query(() => getDashboardStats()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();