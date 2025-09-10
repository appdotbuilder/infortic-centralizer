import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Clock, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin,
  HelpCircle,
  Bug,
  Lightbulb,
  UserPlus
} from 'lucide-react';
import { useState } from 'react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We\'ll get back to you soon. 📧');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Contact Us 📞
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-6">
          We'd love to hear from you!
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions, feedback, or suggestions? Reach out to our team and we'll get back to you 
          as soon as possible. Your input helps us make Infortic better! ✨
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="text-blue-600" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData(prev => ({ ...prev, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category || 'general'} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          General Question
                        </div>
                      </SelectItem>
                      <SelectItem value="bug">
                        <div className="flex items-center gap-2">
                          <Bug className="w-4 h-4" />
                          Bug Report
                        </div>
                      </SelectItem>
                      <SelectItem value="feature">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Feature Request
                        </div>
                      </SelectItem>
                      <SelectItem value="partnership">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Partnership Inquiry
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Brief description of your message"
                    value={formData.subject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, subject: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your question or feedback..."
                    rows={6}
                    value={formData.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      setFormData(prev => ({ ...prev, message: e.target.value }))
                    }
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Quick Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="text-green-600" />
                Quick Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">hello@infortic.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Response Time</p>
                  <p className="text-sm text-gray-600">Within 24 hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Available</p>
                  <p className="text-sm text-gray-600">24/7 Online</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
              <CardDescription>
                Quick answers to frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">How often is data updated?</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Our data is continuously updated as new opportunities are scraped and old ones are automatically removed after their deadlines.
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">Is Infortic free to use?</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Yes! Infortic is completely free and always will be. Our mission is to make opportunities accessible to everyone.
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">How can I suggest new features?</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Use the contact form and select "Feature Request" as the category. We love hearing your ideas!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Connect With Us</CardTitle>
              <CardDescription>
                Follow us for updates and announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="justify-start">
                  <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                  Twitter
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start">
                  <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                  LinkedIn
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start">
                  <Mail className="w-4 h-4 mr-2 text-red-500" />
                  Newsletter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support Hours */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900">We're Here to Help!</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Our team is committed to providing you with the best experience possible. 
                  Don't hesitate to reach out! 🤝
                </p>
                <Badge className="mt-3 bg-blue-100 text-blue-800">
                  🚀 Growing Community
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Information */}
      <section className="text-center bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">Other Ways to Reach Us 📬</h2>
        <p className="text-gray-600 mb-6">
          We're always looking for ways to improve Infortic and serve our community better.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bug className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold">Found a Bug?</h3>
            <p className="text-sm text-gray-600">
              Report technical issues to help us improve the platform
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Have Ideas?</h3>
            <p className="text-sm text-gray-600">
              Share your suggestions for new features or improvements
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Want to Partner?</h3>
            <p className="text-sm text-gray-600">
              Interested in collaborating or integrating with Infortic?
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}