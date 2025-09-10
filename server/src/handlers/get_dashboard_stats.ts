import { db } from '../db';
import { competitionsTable, jobsTable, scholarshipsTable } from '../db/schema';
import { gte, and, lte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export interface DashboardStats {
  total_competitions: number;
  total_jobs: number;
  total_scholarships: number;
  competitions_expiring_soon: number; // Within 7 days
  jobs_expiring_soon: number; // Within 7 days
  scholarships_expiring_soon: number; // Within 7 days
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Count total active competitions (deadline_registration_date >= now)
    const totalCompetitionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(competitionsTable)
      .where(gte(competitionsTable.deadline_registration_date, now))
      .execute();

    // Count competitions expiring soon (within 7 days)
    const competitionsExpiringSoonResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(competitionsTable)
      .where(
        and(
          gte(competitionsTable.deadline_registration_date, now),
          lte(competitionsTable.deadline_registration_date, sevenDaysFromNow)
        )
      )
      .execute();

    // Count total active jobs (deadline >= now)
    const totalJobsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobsTable)
      .where(gte(jobsTable.deadline, now))
      .execute();

    // Count jobs expiring soon (within 7 days)
    const jobsExpiringSoonResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobsTable)
      .where(
        and(
          gte(jobsTable.deadline, now),
          lte(jobsTable.deadline, sevenDaysFromNow)
        )
      )
      .execute();

    // Count total active scholarships (deadline >= now)
    const totalScholarshipsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarshipsTable)
      .where(gte(scholarshipsTable.deadline, now))
      .execute();

    // Count scholarships expiring soon (within 7 days)
    const scholarshipsExpiringSoonResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarshipsTable)
      .where(
        and(
          gte(scholarshipsTable.deadline, now),
          lte(scholarshipsTable.deadline, sevenDaysFromNow)
        )
      )
      .execute();

    return {
      total_competitions: Number(totalCompetitionsResult[0]?.count || 0),
      total_jobs: Number(totalJobsResult[0]?.count || 0),
      total_scholarships: Number(totalScholarshipsResult[0]?.count || 0),
      competitions_expiring_soon: Number(competitionsExpiringSoonResult[0]?.count || 0),
      jobs_expiring_soon: Number(jobsExpiringSoonResult[0]?.count || 0),
      scholarships_expiring_soon: Number(scholarshipsExpiringSoonResult[0]?.count || 0)
    };
  } catch (error) {
    console.error('Dashboard stats query failed:', error);
    throw error;
  }
}