
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Book } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Help = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    try {
      navigate(-1);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };

  const handleContactUs = () => {
    try {
      navigate('/contact');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/contact';
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
            <div className="flex items-center gap-4 mb-8">
              <Button onClick={handleGoBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-4xl font-bold text-foreground">Help Center</h1>
            </div>
            
            <div className="grid gap-8">
              <ErrorBoundary fallback={
                <div className="p-4 text-center text-muted-foreground">
                  FAQ section unavailable
                </div>
              }>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>Find answers to common questions about FlickPick</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>How do I create an account?</AccordionTrigger>
                        <AccordionContent>
                          Click the "Sign In" button in the top navigation, then select "Sign Up" to create a new account. 
                          You'll need to provide a valid email address and create a secure password.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-2">
                        <AccordionTrigger>How do I add movies to my watchlist?</AccordionTrigger>
                        <AccordionContent>
                          Click the "+" button on any movie or TV show card, or use the "Add to List" button on the detail page. 
                          You need to be signed in to use the watchlist feature.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Is FlickPick free to use?</AccordionTrigger>
                        <AccordionContent>
                          Yes, FlickPick is completely free to use. Create an account and start watching today! 
                          We offer premium features for subscribers who want an ad-free experience.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-4">
                        <AccordionTrigger>How do I search for specific content?</AccordionTrigger>
                        <AccordionContent>
                          Use the search bar in the top navigation to find movies and TV shows. 
                          You can search by title, genre, or actor names.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-5">
                        <AccordionTrigger>Can I watch content offline?</AccordionTrigger>
                        <AccordionContent>
                          Currently, FlickPick requires an internet connection to stream content. 
                          Offline viewing features may be added in future updates.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-6">
                        <AccordionTrigger>How do I report a problem with video playback?</AccordionTrigger>
                        <AccordionContent>
                          If you're experiencing issues with video playback, try refreshing the page first. 
                          If the problem persists, contact our support team with details about your device and browser.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </ErrorBoundary>

              <ErrorBoundary>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Still need help?
                    </CardTitle>
                    <CardDescription>Can't find what you're looking for? Get in touch with us</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleContactUs} className="w-full">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </ErrorBoundary>
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

export default Help;
