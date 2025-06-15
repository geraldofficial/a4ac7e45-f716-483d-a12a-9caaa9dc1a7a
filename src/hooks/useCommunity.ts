
import { useCommunityPosts } from './useCommunityPosts';
import { useCommunityActions } from './useCommunityActions';
import { useCommunityRealtime } from './useCommunityRealtime';

export type { CommunityPost } from './useCommunityPosts';

export const useCommunity = () => {
  const {
    posts,
    setPosts,
    loading,
    setLoading,
    error,
    setError,
    fetchPosts,
    createPost
  } = useCommunityPosts();

  const { toggleLike, toggleBookmark, deletePost } = useCommunityActions(posts, setPosts);
  
  useCommunityRealtime(fetchPosts);

  return {
    posts,
    loading,
    error,
    createPost,
    toggleLike,
    toggleBookmark,
    deletePost,
    refreshPosts: fetchPosts
  };
};
