
import { supabase } from '@/integrations/supabase/client';

export interface UserCollection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  movieIds: number[];
  createdBy: string;
}

class UserCollectionsService {
  private getStorageKey(userId: string): string {
    return `userCollections_${userId}`;
  }

  async createCollection(name: string, description?: string, isPublic: boolean = false): Promise<UserCollection> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const collection: UserCollection = {
      id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      movieIds: [],
      createdBy: user.id
    };

    const existingCollections = await this.getUserCollections();
    existingCollections.push(collection);
    
    localStorage.setItem(this.getStorageKey(user.id), JSON.stringify(existingCollections));
    return collection;
  }

  async getUserCollections(): Promise<UserCollection[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const collections = localStorage.getItem(this.getStorageKey(user.id));
    return collections ? JSON.parse(collections) : [];
  }

  async getCollection(collectionId: string): Promise<UserCollection | null> {
    const collections = await this.getUserCollections();
    return collections.find(c => c.id === collectionId) || null;
  }

  async addToCollection(collectionId: string, movieId: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const collections = await this.getUserCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) throw new Error('Collection not found');

    const collection = collections[collectionIndex];
    if (!collection.movieIds.includes(movieId)) {
      collection.movieIds.push(movieId);
      collection.updatedAt = new Date().toISOString();
      
      localStorage.setItem(this.getStorageKey(user.id), JSON.stringify(collections));
    }
  }

  async removeFromCollection(collectionId: string, movieId: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const collections = await this.getUserCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) throw new Error('Collection not found');

    const collection = collections[collectionIndex];
    collection.movieIds = collection.movieIds.filter(id => id !== movieId);
    collection.updatedAt = new Date().toISOString();
    
    localStorage.setItem(this.getStorageKey(user.id), JSON.stringify(collections));
  }

  async deleteCollection(collectionId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const collections = await this.getUserCollections();
    const filteredCollections = collections.filter(c => c.id !== collectionId);
    
    localStorage.setItem(this.getStorageKey(user.id), JSON.stringify(filteredCollections));
  }
}

export const userCollectionsService = new UserCollectionsService();
