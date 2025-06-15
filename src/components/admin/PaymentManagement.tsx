
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KeshoPayIntegration } from '@/components/payment/KeshoPayIntegration';
import { Search, DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';

export const PaymentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentTest, setShowPaymentTest] = useState(false);

  // Mock payment data
  const payments = [
    {
      id: 'pay_001',
      user: 'john_doe',
      amount: 1500,
      currency: 'KES',
      status: 'completed',
      date: '2024-01-20',
      method: 'M-Pesa'
    },
    {
      id: 'pay_002',
      user: 'jane_smith',
      amount: 1000,
      currency: 'KES',
      status: 'pending',
      date: '2024-01-19',
      method: 'Airtel Money'
    },
    {
      id: 'pay_003',
      user: 'test_user',
      amount: 2000,
      currency: 'KES',
      status: 'failed',
      date: '2024-01-18',
      method: 'Card'
    }
  ];

  const stats = {
    totalRevenue: 125000,
    monthlyRevenue: 45000,
    activeSubscribers: 1250,
    conversionRate: 12.5
  };

  const filteredPayments = payments.filter(payment =>
    payment.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Payment Management</h2>
        <Button onClick={() => setShowPaymentTest(true)}>
          Test Payment
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">KES {stats.monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
              <p className="text-2xl font-bold">{stats.activeSubscribers.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Payment ID</th>
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Method</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-border">
                  <td className="py-3 px-4 font-mono text-sm">{payment.id}</td>
                  <td className="py-3 px-4">{payment.user}</td>
                  <td className="py-3 px-4">{payment.currency} {payment.amount}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={
                        payment.status === 'completed' ? 'default' :
                        payment.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">{payment.method}</td>
                  <td className="py-3 px-4">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Test Payment Modal */}
      {showPaymentTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPaymentTest(false)}
              className="absolute -top-10 right-0"
            >
              Close Test
            </Button>
            <KeshoPayIntegration
              amount={1500}
              title="Test Premium Subscription"
              description="Testing payment integration"
              onSuccess={() => {
                console.log('Test payment successful!');
                setShowPaymentTest(false);
              }}
              onError={(error) => {
                console.error('Test payment failed:', error);
              }}
              onCancel={() => setShowPaymentTest(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
