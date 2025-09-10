import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trophy, Briefcase, GraduationCap, Calendar, AlertCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
// Note: Using relative path from components/ to server/
import type { Competition, Job, Scholarship } from '../../../server/src/schema';

interface DashboardStats {
  total_competitions: number;
  total_jobs: number;
  total_scholarships: number;
  competitions_expiring_soon: number;
  jobs_expiring_soon: number;
  scholarships_expiring_soon: number;
}

export function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_competitions: 0,
    total_jobs: 0,
    total_scholarships: 0,
    competitions_expiring_soon: 0,
    jobs_expiring_soon: 0,
    scholarships_expiring_soon: 0
  });
  
  const [recentCompetitions, setRecentCompetitions] = useState<Competition[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentScholarships, setRecentScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load dashboard stats
      const dashboardStats = await trpc.getDashboardStats.query();
      setStats(dashboardStats);

      // Load recent items (limited to 3 each for homepage preview)
      const [competitions, jobs, scholarships] = await Promise.all([
        trpc.getCompetitions.query({ limit: 3 }),
        trpc.getJobs.query({ limit: 3 }),
        trpc.getScholarships.query({ limit: 3 })
      ]);

      setRecentCompetitions(competitions);
      setRecentJobs(jobs);
      setRecentScholarships(scholarships);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to Infortic! 🎯
        </h1>
        <p className="text-xl md:text-2xl mb-6 opacity-90">
          Your centralized hub for competitions, jobs, and scholarships
        </p>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          Discover opportunities that match your goals. Stay updated with the latest competitions, 
          job openings, and scholarship programs all in one place! ✨
        </p>
      </section>

      {/* Stats Overview */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">📊 Overview</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Competitions</CardTitle>
              <Trophy className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.total_competitions}</div>
              <p className="text-xs text-gray-600">
                {stats.competitions_expiring_soon} expiring soon
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.total_jobs}</div>
              <p className="text-xs text-gray-600">
                {stats.jobs_expiring_soon} expiring soon
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Scholarships</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats.total_scholarships}</div>
              <p className="text-xs text-gray-600">
                {stats.scholarships_expiring_soon} expiring soon
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Note about placeholder data */}
      {(stats.total_competitions === 0 && stats.total_jobs === 0 && stats.total_scholarships === 0) && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">Development Notice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              📝 The backend is currently using placeholder data. Once the database is populated with real 
              competitions, jobs, and scholarships data, this dashboard will display live statistics and content.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Items Preview */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">🔥 Latest Opportunities</h2>

        {/* Recent Competitions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold flex items-center">
              <Trophy className="mr-2 text-blue-600" />
              Recent Competitions
            </h3>
            <Button variant="outline" size="sm">
              View All →
            </Button>
          </div>
          
          {recentCompetitions.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {recentCompetitions.map((competition: Competition) => (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{competition.title}</CardTitle>
                    <CardDescription>{competition.organizer}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant="secondary">{competition.category}</Badge>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Deadline: {competition.deadline_registration_date.toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium">💰 {competition.price_register}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-gray-500">No competitions available yet. Check back soon! 🎯</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold flex items-center">
              <Briefcase className="mr-2 text-green-600" />
              Recent Jobs
            </h3>
            <Button variant="outline" size="sm">
              View All →
            </Button>
          </div>
          
          {recentJobs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {recentJobs.map((job: Job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{job.job_title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">📍 {job.location}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Deadline: {job.deadline.toLocaleDateString()}
                      </p>
                      <Badge variant="outline">{job.required_experience}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-gray-500">No jobs available yet. Check back soon! 💼</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Recent Scholarships */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold flex items-center">
              <GraduationCap className="mr-2 text-purple-600" />
              Recent Scholarships
            </h3>
            <Button variant="outline" size="sm">
              View All →
            </Button>
          </div>
          
          {recentScholarships.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {recentScholarships.map((scholarship: Scholarship) => (
                <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{scholarship.scholarship_name}</CardTitle>
                    <CardDescription>{scholarship.provider}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Deadline: {scholarship.deadline.toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium">💰 {scholarship.award_amount}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-gray-500">No scholarships available yet. Check back soon! 🎓</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gray-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-4">Ready to explore? 🚀</h2>
        <p className="text-lg text-gray-600 mb-6">
          Browse through our comprehensive collection of opportunities tailored for you!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            🏆 Browse Competitions
          </Button>
          <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            💼 Find Jobs
          </Button>
          <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
            🎓 Discover Scholarships
          </Button>
        </div>
      </section>
    </div>
  );
}