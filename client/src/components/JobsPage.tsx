import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Briefcase, Calendar, MapPin, ExternalLink, Search, Filter, Building, AlertCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Job, JobFilter } from '../../../server/src/schema';

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter: JobFilter = {
        limit: 50,
        offset: 0
      };

      // Apply filters if they're not 'all'
      if (locationFilter !== 'all') filter.location = locationFilter;
      if (companyFilter !== 'all') filter.company = companyFilter;
      if (experienceFilter !== 'all') filter.required_experience = experienceFilter;

      const result = await trpc.getJobs.query(filter);
      setJobs(result);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [locationFilter, companyFilter, experienceFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Filter jobs by search query on frontend
  const filteredJobs = jobs.filter((job: Job) =>
    job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.job_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = async (id: number) => {
    try {
      const job = await trpc.getJobById.query({ id });
      setSelectedJob(job);
    } catch (error) {
      console.error('Failed to load job details:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
          <Briefcase className="text-blue-600" />
          Jobs
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find your next career opportunity. Browse through various job openings from top companies 
          and kickstart your professional journey! 💼
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Jakarta">Jakarta</SelectItem>
                <SelectItem value="Surabaya">Surabaya</SelectItem>
                <SelectItem value="Bandung">Bandung</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="Tech Company">Tech Company</SelectItem>
                <SelectItem value="Startup">Startup</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Entry-level">Entry-level</SelectItem>
                <SelectItem value="1-3 years">1-3 years</SelectItem>
                <SelectItem value="3-5 years">3-5 years</SelectItem>
                <SelectItem value="5+ years">5+ years</SelectItem>
                <SelectItem value="N/A">N/A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        <Button 
          onClick={loadJobs} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading jobs...</p>
        </div>
      )}

      {/* No Data Notice */}
      {!isLoading && jobs.length === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">No Jobs Available</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              📝 The backend is currently using placeholder data. Once the database is populated with real 
              job listings from external scrapers, jobs will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Search Results */}
      {!isLoading && jobs.length > 0 && filteredJobs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500">
              No jobs found matching your search criteria. Try adjusting your filters! 🔍
            </p>
          </CardContent>
        </Card>
      )}

      {/* Jobs Grid */}
      {!isLoading && filteredJobs.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job: Job) => (
            <Card key={job.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300">
              {job.image_link && (
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                  <img
                    src={job.image_link}
                    alt={job.company}
                    className="h-full w-full object-cover rounded-t-lg"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="flex items-center justify-center h-full text-white text-6xl">💼</div>
                      `;
                    }}
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">{job.job_title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0 ml-2">
                    {job.required_experience}
                  </Badge>
                </div>
                <CardDescription className="text-sm flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  <strong>{job.company}</strong>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {job.job_description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{job.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-red-500" />
                    <span>Deadline: {job.deadline.toLocaleDateString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewDetails(job.id)}
                      >
                        📋 Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      {selectedJob && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                              <Briefcase className="text-blue-600" />
                              {selectedJob.job_title}
                            </DialogTitle>
                            <DialogDescription>
                              {selectedJob.company} • {selectedJob.location}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {selectedJob.image_link && (
                              <div className="w-full h-48 rounded-lg overflow-hidden">
                                <img
                                  src={selectedJob.image_link}
                                  alt={selectedJob.company}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-semibold mb-2">📄 Job Description</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.job_description}</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">🏢 Company</h4>
                                <p className="text-gray-700">{selectedJob.company}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">📍 Location</h4>
                                <p className="text-gray-700">{selectedJob.location}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">📅 Application Deadline</h4>
                                <p className="text-gray-700">
                                  {selectedJob.deadline.toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">💼 Required Experience</h4>
                                <Badge>{selectedJob.required_experience}</Badge>
                              </div>
                            </div>
                            
                            <div>
                              <a
                                href={selectedJob.application_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-block"
                              >
                                <Button className="w-full">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Apply Now
                                </Button>
                              </a>
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  <a
                    href={job.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Apply
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}