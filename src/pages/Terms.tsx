
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-muted-foreground space-y-6">
              <p>Last updated: December 12, 2024</p>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Acceptance of Terms</h3>
                <p>By accessing and using FlickPick, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Use License</h3>
                <p>Permission is granted to temporarily download one copy of FlickPick materials for personal, non-commercial transitory viewing only.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Disclaimer</h3>
                <p>The materials on FlickPick are provided on an 'as is' basis. FlickPick makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Limitations</h3>
                <p>In no event shall FlickPick or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use FlickPick materials.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Contact Information</h3>
                <p>If you have any questions about these Terms of Service, please contact us at legal@flickpick.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
