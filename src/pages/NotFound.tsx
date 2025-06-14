
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    try {
      navigate('/');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    try {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };

  const handleSearch = () => {
    try {
      navigate('/search');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/search';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="text-6xl font-bold text-primary mb-4">404</div>
                <CardTitle className="text-2xl">Page Not Found</CardTitle>
                <CardDescription>
                  Oops! The page you're looking for doesn't exist.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  The page at <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code> could not be found.
                </p>
                
                <div className="flex flex-col gap-3">
                  <Button onClick={handleGoHome} className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                  
                  <Button onClick={handleGoBack} variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  
                  <Button onClick={handleSearch} variant="outline" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
