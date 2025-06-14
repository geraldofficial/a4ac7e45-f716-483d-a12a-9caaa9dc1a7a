
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <ErrorBoundary>
          <Navbar />
        </ErrorBoundary>
        
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-8">Contact Us</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
              <ErrorBoundary fallback={
                <div className="p-4 text-center text-muted-foreground">
                  Contact form unavailable
                </div>
              }>
                <Card>
                  <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                    <CardDescription>Send us a message and we'll get back to you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Name *</label>
                        <Input 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name" 
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Email *</label>
                        <Input 
                          name="email"
                          type="email" 
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com" 
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Subject</label>
                        <Input 
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="How can we help?" 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Message *</label>
                        <Textarea 
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Your message..." 
                          rows={5} 
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </ErrorBoundary>
              
              <div className="space-y-6">
                <ErrorBoundary>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Mail className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-semibold text-foreground">Email</h3>
                          <p className="text-muted-foreground">support@flickpick.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ErrorBoundary>
                
                <ErrorBoundary>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Phone className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-semibold text-foreground">Phone</h3>
                          <p className="text-muted-foreground">+1 (555) 123-4567</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ErrorBoundary>
                
                <ErrorBoundary>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <MapPin className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-semibold text-foreground">Address</h3>
                          <p className="text-muted-foreground">123 Entertainment St<br />Hollywood, CA 90210</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
        
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default Contact;
