
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Matters</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-muted-foreground space-y-6">
              <p>Last updated: December 12, 2024</p>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">How We Use Your Information</h3>
                <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Information Sharing</h3>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in specific circumstances outlined in this policy.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Data Security</h3>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at privacy@flickpick.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
