import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Target, Users, Zap, Shield, Globe, Heart, Trophy, Briefcase, GraduationCap } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          About Infortic ℹ️
        </h1>
        <p className="text-xl md:text-2xl mb-6 opacity-90">
          Empowering your journey through information
        </p>
        <p className="text-lg opacity-80 max-w-3xl mx-auto">
          We believe that opportunities should be accessible to everyone. Infortic bridges the gap between 
          ambitious individuals and the competitions, jobs, and scholarships that can shape their future.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-8">
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="text-blue-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              To centralize and democratize access to educational and professional opportunities by 
              providing a comprehensive platform where students and professionals can discover competitions, 
              job openings, and scholarships that align with their goals and aspirations. 🎯
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Globe className="text-purple-600" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              To become the go-to platform for opportunity discovery, where every individual has equal access 
              to information that can transform their educational and career journey, regardless of their background 
              or location. 🌟
            </p>
          </CardContent>
        </Card>
      </section>

      {/* What We Offer */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">What We Offer 🚀</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">Competitions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Discover academic competitions, coding contests, design challenges, and more. 
                From middle school to professional level, find the perfect competition to showcase your skills.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Explore job opportunities from startups to corporations. Whether you're a fresh graduate 
                or experienced professional, find positions that match your skills and career goals.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Scholarships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access funding opportunities for your education. From government scholarships to 
                private foundations, discover financial support for your academic journey.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Our Values */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Our Core Values 💎</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Making opportunities accessible to everyone, regardless of background or location.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Streamlining the discovery process with smart filtering and organized information.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Reliability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Providing accurate, up-to-date information you can trust for important decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Creating meaningful change in people's educational and career journeys.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* How It Works */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">How Infortic Works 🔧</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">1</Badge>
                Data Collection & Curation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our system integrates with external data scrapers that continuously collect information about 
                competitions, jobs, and scholarships from various sources across the web. This data is then 
                cleaned, normalized, and verified before being added to our database.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">2</Badge>
                Smart Organization & Filtering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Once collected, opportunities are organized by category, location, deadline, and other relevant 
                criteria. Our filtering system allows users to quickly find opportunities that match their 
                specific interests and qualifications.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800">3</Badge>
                Automated Data Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our system automatically manages data lifecycle by removing expired opportunities based on their 
                deadlines. This ensures that users always see current and relevant information, without having 
                to wade through outdated listings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800">4</Badge>
                User-Friendly Discovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Users can browse, search, and filter through opportunities with ease. Each listing includes 
                comprehensive details, direct application links, and all necessary information to make 
                informed decisions about which opportunities to pursue.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Technology & Future */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">Built for the Future 🚀</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Modern Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <ul className="space-y-2 text-gray-700">
                <li>• React.js with TypeScript for robust frontend development</li>
                <li>• tRPC for type-safe API communication</li>
                <li>• Radix UI components for accessibility and consistency</li>
                <li>• Tailwind CSS for responsive and modern design</li>
                <li>• Automated data management and cleanup processes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Continuous Improvement</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <ul className="space-y-2 text-gray-700">
                <li>• Regular updates to improve user experience</li>
                <li>• Expanding data sources and coverage</li>
                <li>• Enhanced filtering and search capabilities</li>
                <li>• Mobile-first responsive design</li>
                <li>• Community feedback integration</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gray-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-4">Ready to Explore Opportunities? ✨</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of students and professionals who are already using Infortic to discover 
          and pursue life-changing opportunities.
        </p>
        <div className="flex justify-center">
          <Badge variant="outline" className="text-sm px-4 py-2">
            🌟 Start your journey today - it's free and always will be!
          </Badge>
        </div>
      </section>
    </div>
  );
}