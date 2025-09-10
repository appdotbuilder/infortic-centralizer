import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Calendar, MapPin, ExternalLink, Search, Filter, AlertCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Competition, CompetitionFilter } from '../../../server/src/schema';

export function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [placeFilter, setPlaceFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  const loadCompetitions = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter: CompetitionFilter = {
        limit: 50,
        offset: 0
      };

      // Apply filters if they're not 'all'
      if (categoryFilter !== 'all') filter.category = categoryFilter;
      if (placeFilter !== 'all') filter.place = placeFilter;
      if (priceFilter !== 'all') filter.price_register = priceFilter;

      const result = await trpc.getCompetitions.query(filter);
      setCompetitions(result);
    } catch (error) {
      console.error('Failed to load competitions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, placeFilter, priceFilter]);

  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  // Filter competitions by search query on frontend
  const filteredCompetitions = competitions.filter((competition: Competition) =>
    competition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    competition.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    competition.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = async (id: number) => {
    try {
      const competition = await trpc.getCompetitionById.query({ id });
      setSelectedCompetition(competition);
    } catch (error) {
      console.error('Failed to load competition details:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
          <Trophy className="text-yellow-500" />
          Competitions
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover and participate in exciting competitions across various categories. 
          Challenge yourself and showcase your skills! 🏆
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
                placeholder="Search competitions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Middle School">Middle School</SelectItem>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="College">College</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={placeFilter} onValueChange={setPlaceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Place" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Places</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Jakarta">Jakarta</SelectItem>
                <SelectItem value="Universitas Indonesia">Universitas Indonesia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="N/A">N/A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Competition Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredCompetitions.length} competition{filteredCompetitions.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        <Button 
          onClick={loadCompetitions} 
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <p className="mt-2 text-gray-600">Loading competitions...</p>
        </div>
      )}

      {/* No Data Notice */}
      {!isLoading && competitions.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">No Competitions Available</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              📝 The backend is currently using placeholder data. Once the database is populated with real 
              competition data from external scrapers, competitions will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Search Results */}
      {!isLoading && competitions.length > 0 && filteredCompetitions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500">
              No competitions found matching your search criteria. Try adjusting your filters! 🔍
            </p>
          </CardContent>
        </Card>
      )}

      {/* Competitions Grid */}
      {!isLoading && filteredCompetitions.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitions.map((competition: Competition) => (
            <Card key={competition.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-yellow-300">
              {competition.image_link && (
                <div className="h-48 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-t-lg flex items-center justify-center">
                  <img
                    src={competition.image_link}
                    alt={competition.title}
                    className="h-full w-full object-cover rounded-t-lg"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="flex items-center justify-center h-full text-white text-6xl">🏆</div>
                      `;
                    }}
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">{competition.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0 ml-2">
                    {competition.category}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  <strong>By:</strong> {competition.organizer}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {competition.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-red-500" />
                    <span>Deadline: {competition.deadline_registration_date.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{competition.place}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">
                      💰 {competition.price_register}
                    </span>
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
                        onClick={() => handleViewDetails(competition.id)}
                      >
                        📋 Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      {selectedCompetition && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                              <Trophy className="text-yellow-500" />
                              {selectedCompetition.title}
                            </DialogTitle>
                            <DialogDescription>
                              Organized by {selectedCompetition.organizer}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {selectedCompetition.image_link && (
                              <div className="w-full h-48 rounded-lg overflow-hidden">
                                <img
                                  src={selectedCompetition.image_link}
                                  alt={selectedCompetition.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-semibold mb-2">📄 Description</h4>
                              <p className="text-gray-700">{selectedCompetition.description}</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">📅 Registration Deadline</h4>
                                <p className="text-gray-700">
                                  {selectedCompetition.deadline_registration_date.toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">🎯 Category</h4>
                                <Badge>{selectedCompetition.category}</Badge>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">📍 Place</h4>
                                <p className="text-gray-700">{selectedCompetition.place}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">💰 Registration Fee</h4>
                                <p className="text-gray-700">{selectedCompetition.price_register}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <a
                                href={selectedCompetition.registration_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                              >
                                <Button className="w-full">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Register Now
                                </Button>
                              </a>
                              
                              {selectedCompetition.guide_book_link && (
                                <a
                                  href={selectedCompetition.guide_book_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1"
                                >
                                  <Button variant="outline" className="w-full">
                                    📖 Guide Book
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  <a
                    href={competition.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Register
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