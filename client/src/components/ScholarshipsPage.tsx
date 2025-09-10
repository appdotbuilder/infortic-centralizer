import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Calendar, ExternalLink, Search, Filter, DollarSign, Users, AlertCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Scholarship, ScholarshipFilter } from '../../../server/src/schema';

export function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [awardFilter, setAwardFilter] = useState<string>('all');

  const loadScholarships = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter: ScholarshipFilter = {
        limit: 50,
        offset: 0
      };

      // Apply filters if they're not 'all'
      if (providerFilter !== 'all') filter.provider = providerFilter;
      if (awardFilter !== 'all') filter.award_amount = awardFilter;

      const result = await trpc.getScholarships.query(filter);
      setScholarships(result);
    } catch (error) {
      console.error('Failed to load scholarships:', error);
    } finally {
      setIsLoading(false);
    }
  }, [providerFilter, awardFilter]);

  useEffect(() => {
    loadScholarships();
  }, [loadScholarships]);

  // Filter scholarships by search query on frontend
  const filteredScholarships = scholarships.filter((scholarship: Scholarship) =>
    scholarship.scholarship_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scholarship.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scholarship.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scholarship.eligibility.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = async (id: number) => {
    try {
      const scholarship = await trpc.getScholarshipById.query({ id });
      setSelectedScholarship(scholarship);
    } catch (error) {
      console.error('Failed to load scholarship details:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
          <GraduationCap className="text-purple-600" />
          Scholarships
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore educational funding opportunities to support your academic journey. 
          Discover scholarships that match your profile and aspirations! 🎓
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
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search scholarships..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="University">University</SelectItem>
                <SelectItem value="Private Foundation">Private Foundation</SelectItem>
                <SelectItem value="International">International</SelectItem>
              </SelectContent>
            </Select>

            <Select value={awardFilter} onValueChange={setAwardFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Award Amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Amounts</SelectItem>
                <SelectItem value="Full Tuition">Full Tuition</SelectItem>
                <SelectItem value="Partial Tuition">Partial Tuition</SelectItem>
                <SelectItem value="Living Expenses">Living Expenses</SelectItem>
                <SelectItem value="Varies">Varies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scholarship Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        <Button 
          onClick={loadScholarships} 
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Loading scholarships...</p>
        </div>
      )}

      {/* No Data Notice */}
      {!isLoading && scholarships.length === 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-purple-800">No Scholarships Available</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-700">
              📝 The backend is currently using placeholder data. Once the database is populated with real 
              scholarship data from external scrapers, scholarships will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Search Results */}
      {!isLoading && scholarships.length > 0 && filteredScholarships.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500">
              No scholarships found matching your search criteria. Try adjusting your filters! 🔍
            </p>
          </CardContent>
        </Card>
      )}

      {/* Scholarships Grid */}
      {!isLoading && filteredScholarships.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship: Scholarship) => (
            <Card key={scholarship.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-300">
              {scholarship.image_link && (
                <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-600 rounded-t-lg flex items-center justify-center">
                  <img
                    src={scholarship.image_link}
                    alt={scholarship.scholarship_name}
                    className="h-full w-full object-cover rounded-t-lg"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="flex items-center justify-center h-full text-white text-6xl">🎓</div>
                      `;
                    }}
                  />
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{scholarship.scholarship_name}</CardTitle>
                <CardDescription className="text-sm">
                  <strong>Provider:</strong> {scholarship.provider}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {scholarship.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-red-500" />
                    <span>Deadline: {scholarship.deadline.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {scholarship.award_amount}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 line-clamp-2">
                    <Users className="w-3 h-3 inline mr-1" />
                    <strong>Eligibility:</strong> {scholarship.eligibility}
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
                        onClick={() => handleViewDetails(scholarship.id)}
                      >
                        📋 Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      {selectedScholarship && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                              <GraduationCap className="text-purple-600" />
                              {selectedScholarship.scholarship_name}
                            </DialogTitle>
                            <DialogDescription>
                              Provided by {selectedScholarship.provider}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {selectedScholarship.image_link && (
                              <div className="w-full h-48 rounded-lg overflow-hidden">
                                <img
                                  src={selectedScholarship.image_link}
                                  alt={selectedScholarship.scholarship_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-semibold mb-2">📄 Description</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{selectedScholarship.description}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">👥 Eligibility Requirements</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{selectedScholarship.eligibility}</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">🏛️ Provider</h4>
                                <p className="text-gray-700">{selectedScholarship.provider}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">💰 Award Amount</h4>
                                <Badge variant="secondary" className="text-sm">
                                  {selectedScholarship.award_amount}
                                </Badge>
                              </div>
                              
                              <div className="md:col-span-2">
                                <h4 className="font-semibold mb-2">📅 Application Deadline</h4>
                                <p className="text-gray-700 flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-red-500" />
                                  {selectedScholarship.deadline.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <a
                                href={selectedScholarship.application_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-block"
                              >
                                <Button className="w-full">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Apply for Scholarship
                                </Button>
                              </a>
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  <a
                    href={scholarship.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
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