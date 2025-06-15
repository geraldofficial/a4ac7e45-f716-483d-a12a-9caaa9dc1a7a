
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

export const ContentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock content data
  const content = [
    {
      id: 1,
      title: "Inception",
      type: "movie",
      status: "published",
      views: 1250000,
      rating: 8.8,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Breaking Bad",
      type: "tv",
      status: "published",
      views: 2500000,
      rating: 9.5,
      createdAt: "2024-01-10"
    },
    {
      id: 3,
      title: "The Matrix",
      type: "movie",
      status: "draft",
      views: 0,
      rating: 0,
      createdAt: "2024-01-20"
    }
  ];

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Content Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
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
                <th className="text-left py-3 px-4 font-medium">Title</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Views</th>
                <th className="text-left py-3 px-4 font-medium">Rating</th>
                <th className="text-left py-3 px-4 font-medium">Created</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-3 px-4 font-medium">{item.title}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">
                      {item.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">{item.views.toLocaleString()}</td>
                  <td className="py-3 px-4">{item.rating}/10</td>
                  <td className="py-3 px-4">{item.createdAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
