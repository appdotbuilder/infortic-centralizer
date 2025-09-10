import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Import page components
import { HomePage } from '@/components/HomePage';
import { CompetitionsPage } from '@/components/CompetitionsPage';
import { JobsPage } from '@/components/JobsPage';
import { ScholarshipsPage } from '@/components/ScholarshipsPage';
import { AboutPage } from '@/components/AboutPage';
import { ContactPage } from '@/components/ContactPage';

type Page = 'home' | 'competitions' | 'jobs' | 'scholarships' | 'about' | 'contact';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'competitions':
        return <CompetitionsPage />;
      case 'jobs':
        return <JobsPage />;
      case 'scholarships':
        return <ScholarshipsPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ℹ️</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Infortic
              </h1>
            </div>
            
            <nav className="flex space-x-6">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('home')}
                className="text-sm"
              >
                🏠 Home
              </Button>
              <Button
                variant={currentPage === 'competitions' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('competitions')}
                className="text-sm"
              >
                🏆 Competitions
              </Button>
              <Button
                variant={currentPage === 'jobs' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('jobs')}
                className="text-sm"
              >
                💼 Jobs
              </Button>
              <Button
                variant={currentPage === 'scholarships' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('scholarships')}
                className="text-sm"
              >
                🎓 Scholarships
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ℹ️</span>
                </div>
                <h3 className="text-xl font-bold">Infortic</h3>
              </div>
              <p className="text-gray-300">
                Your one-stop destination for competitions, jobs, and scholarships. 
                Stay informed, stay ahead! 🚀
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCurrentPage('competitions')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    🏆 Competitions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('jobs')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    💼 Jobs
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('scholarships')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    🎓 Scholarships
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Information</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCurrentPage('about')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    ℹ️ About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('contact')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    📞 Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-700" />
          
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Infortic. All rights reserved. Made with ❤️ for students and professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;