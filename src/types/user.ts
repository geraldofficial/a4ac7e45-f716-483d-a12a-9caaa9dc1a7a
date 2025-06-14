
export interface SubAccount {
  id: string;
  name: string;
  avatar: string;
  type: 'adult' | 'teen' | 'kids';
  isActive: boolean;
}

export interface ExtendedUserProfile {
  id?: string;
  name?: string;
  username?: string;
  avatar?: string;
  avatar_url?: string;
  sub_accounts?: SubAccount[];
  active_account_type?: 'adult' | 'teen' | 'kids';
  onboarding_completed?: boolean;
  genre_preferences?: string[];
}
