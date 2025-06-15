
export interface ShareableContent {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster_path?: string;
  description?: string;
}

class ContentSharingService {
  async shareContent(content: ShareableContent): Promise<void> {
    const shareUrl = `${window.location.origin}/${content.type}/${content.id}`;
    const shareText = `Check out "${content.title}" on FlickPick!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share canceled or failed');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      return Promise.resolve();
    }
  }

  async shareToSocial(content: ShareableContent, platform: 'twitter' | 'facebook' | 'whatsapp'): Promise<void> {
    const shareUrl = `${window.location.origin}/${content.type}/${content.id}`;
    const shareText = `Check out "${content.title}" on FlickPick!`;
    
    let socialUrl = '';
    
    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        socialUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
    }
    
    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400');
    }
  }

  generateWatchPartyLink(movieId: number, movieTitle: string): string {
    return `${window.location.origin}/watch-party/invite?movie=${movieId}&title=${encodeURIComponent(movieTitle)}`;
  }
}

export const contentSharingService = new ContentSharingService();
