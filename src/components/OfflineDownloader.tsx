
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Trash2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DownloadItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  tmdbId: number;
  season?: number;
  episode?: number;
  progress: number;
  status: 'downloading' | 'completed' | 'paused' | 'error';
  size: string;
  downloadedAt?: Date;
}

interface OfflineDownloaderProps {
  tmdbId: number;
  title: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  poster_path?: string;
}

export const OfflineDownloader: React.FC<OfflineDownloaderProps> = ({
  tmdbId,
  title,
  type,
  season,
  episode,
  poster_path
}) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Load downloads from localStorage on mount
  useEffect(() => {
    const savedDownloads = localStorage.getItem('flickpick-downloads');
    if (savedDownloads) {
      setDownloads(JSON.parse(savedDownloads));
    }
  }, []);

  // Save downloads to localStorage when updated
  useEffect(() => {
    localStorage.setItem('flickpick-downloads', JSON.stringify(downloads));
  }, [downloads]);

  const downloadId = `${tmdbId}-${type}${season ? `-s${season}` : ''}${episode ? `-e${episode}` : ''}`;
  const existingDownload = downloads.find(d => d.id === downloadId);

  const startDownload = async () => {
    if (existingDownload) {
      toast({
        title: "Already downloaded",
        description: "This content is already in your downloads.",
      });
      return;
    }

    setIsDownloading(true);
    
    const newDownload: DownloadItem = {
      id: downloadId,
      title: type === 'tv' && season && episode ? `${title} S${season}E${episode}` : title,
      type,
      tmdbId,
      season,
      episode,
      progress: 0,
      status: 'downloading',
      size: '0 MB'
    };

    setDownloads(prev => [...prev, newDownload]);

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloads(prev => prev.map(download => {
        if (download.id === downloadId && download.status === 'downloading') {
          const newProgress = Math.min(download.progress + Math.random() * 15, 100);
          const estimatedSize = Math.round((newProgress / 100) * 1500); // MB
          
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            setIsDownloading(false);
            toast({
              title: "Download completed",
              description: `${newDownload.title} is now available offline.`,
            });
            
            return {
              ...download,
              progress: 100,
              status: 'completed' as const,
              size: `${estimatedSize} MB`,
              downloadedAt: new Date()
            };
          }
          
          return {
            ...download,
            progress: newProgress,
            size: `${estimatedSize} MB`
          };
        }
        return download;
      }));
    }, 500);

    toast({
      title: "Download started",
      description: `Downloading ${newDownload.title} for offline viewing.`,
    });
  };

  const pauseDownload = (downloadId: string) => {
    setDownloads(prev => prev.map(download =>
      download.id === downloadId
        ? { ...download, status: 'paused' as const }
        : download
    ));
  };

  const resumeDownload = (downloadId: string) => {
    setDownloads(prev => prev.map(download =>
      download.id === downloadId
        ? { ...download, status: 'downloading' as const }
        : download
    ));
  };

  const removeDownload = (downloadId: string) => {
    setDownloads(prev => prev.filter(download => download.id !== downloadId));
    toast({
      title: "Download removed",
      description: "Content has been removed from your downloads.",
    });
  };

  return (
    <div className="space-y-4">
      {!existingDownload ? (
        <Button
          onClick={startDownload}
          disabled={isDownloading}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? 'Starting Download...' : 'Download for Offline'}
        </Button>
      ) : (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{existingDownload.title}</h4>
              <div className="flex items-center gap-2">
                {existingDownload.status === 'downloading' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => pauseDownload(existingDownload.id)}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                {existingDownload.status === 'paused' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resumeDownload(existingDownload.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDownload(existingDownload.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {existingDownload.status !== 'completed' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{existingDownload.status}</span>
                  <span>{Math.round(existingDownload.progress)}%</span>
                </div>
                <Progress value={existingDownload.progress} />
              </div>
            )}
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Size: {existingDownload.size}</span>
              {existingDownload.downloadedAt && (
                <span>Downloaded: {existingDownload.downloadedAt.toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
