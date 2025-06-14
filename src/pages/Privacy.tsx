
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Users } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Privacy = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    try {
      navigate(-1);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
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
              <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
            </div>
            
            <ErrorBoundary fallback={
              <div className="p-4 text-center text-muted-foreground">
                Privacy policy content unavailable
              </div>
            }>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Your Privacy Matters
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none text-muted-foreground space-y-8">
                  <p className="text-sm">Last updated: December 14, 2024</p>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-primary pl-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Information We Collect</h3>
                      </div>
                      <p>
                        We collect information you provide directly to us, such as when you create an account, 
                        use our services, or contact us for support. This includes your username, email address, 
                        viewing preferences, and watchlist data.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">How We Use Your Information</h3>
                      </div>
                      <p>
                        We use the information we collect to provide, maintain, and improve our services, 
                        process transactions, send you technical notices and support messages, and communicate 
                        with you about products, services, and promotional offers.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Lock className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Information Sharing</h3>
                      </div>
                      <p>
                        We do not sell, trade, or rent your personal information to third parties. We may share 
                        your information only in specific circumstances outlined in this policy, such as with 
                        your consent, to comply with legal obligations, or to protect our rights.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Data Security</h3>
                      </div>
                      <p>
                        We implement appropriate security measures to protect your personal information against 
                        unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
                        secure servers, and regular security audits.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Your Rights</h3>
                      </div>
                      <p>
                        You have the right to access, update, or delete your personal information. You can 
                        also opt out of certain communications and request a copy of the data we have about you. 
                        Contact us to exercise these rights.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Cookies and Tracking</h3>
                      </div>
                      <p>
                        We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                        and provide personalized content. You can control cookie settings through your browser preferences.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
                      </div>
                      <p>
                        If you have any questions about this Privacy Policy or our data practices, 
                        please contact us at privacy@flickpick.com or through our contact form.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ErrorBoundary>
          </div>
        </div>
        
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default Privacy;
