import React, { useState, useEffect } from "react";
import { CheckCircle, Smartphone, Tv, Search, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UpdateItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  completed: boolean;
}

export const AppStatusUpdate: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);

  const updates: UpdateItem[] = [
    {
      icon: Search,
      title: "Search Functionality Fixed",
      description:
        "Enhanced search with better error handling, filters, and real-time results",
      completed: true,
    },
    {
      icon: Smartphone,
      title: "Mobile Experience Improved",
      description:
        "Better touch targets, responsive design, and mobile-optimized navigation",
      completed: true,
    },
    {
      icon: Tv,
      title: "TV & Large Screen Support",
      description:
        "Enhanced for television viewing with improved focus navigation",
      completed: true,
    },
    {
      icon: Play,
      title: "Video Player Enhanced",
      description:
        "Multiple streaming sources, better error recovery, and reduced sandbox restrictions",
      completed: true,
    },
  ];

  useEffect(() => {
    // Show update notification on first visit or after updates
    const hasSeenUpdate = localStorage.getItem("flickpick-updates-v1");
    if (!hasSeenUpdate) {
      setShowUpdate(true);
    }
  }, []);

  useEffect(() => {
    if (showUpdate && currentUpdateIndex < updates.length) {
      const timer = setTimeout(() => {
        setCurrentUpdateIndex((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showUpdate, currentUpdateIndex, updates.length]);

  const handleDismiss = () => {
    setShowUpdate(false);
    localStorage.setItem("flickpick-updates-v1", "seen");
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">App Updates</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-muted-foreground mb-6 text-sm">
            We've improved FlickPick based on your feedback!
          </p>

          <div className="space-y-4">
            {updates.map((update, index) => {
              const Icon = update.icon;
              const isVisible = index <= currentUpdateIndex;
              const isCompleted = isVisible && update.completed;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 transition-all duration-500 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 transition-all duration-300 ${
                      isCompleted ? "text-green-500" : "text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium transition-colors duration-300 ${
                        isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {update.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {update.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleDismiss}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Great! Let's explore
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh app
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Still experiencing issues? Contact support for help.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
