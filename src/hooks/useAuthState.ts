import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { userApi } from "@/services/user";
import { UserProfile } from "@/types/auth";
import { formatError } from "@/lib/utils";

// Global state to prevent multiple simultaneous profile fetches
let globalProfileFetchState = {
  isProfileFetching: false,
  consecutiveTimeouts: 0,
  profileFetchDisabled: true, // Disabled for stability - use window.enableProfileFetch() to test
  maxTimeouts: 2,
};

// Add to window for easy re-enabling in console: window.enableProfileFetch()
if (typeof window !== "undefined") {
  (window as any).enableProfileFetch = () => {
    globalProfileFetchState.profileFetchDisabled = false;
    globalProfileFetchState.consecutiveTimeouts = 0;
    console.log(
      "✅ Profile fetching re-enabled. Refresh the page to attempt profile loading.",
    );
  };
  (window as any).disableProfileFetch = () => {
    globalProfileFetchState.profileFetchDisabled = true;
    console.log("🚫 Profile fetching disabled.");
  };
}

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const maxRetries = 1; // Reduced to just 1 retry to minimize timeouts

  useEffect(() => {
    mountedRef.current = true;
    let subscription: any;

    // Notify about profile fetching status
    if (globalProfileFetchState.profileFetchDisabled) {
      console.log(
        "ℹ️ Profile fetching is currently disabled due to timeout issues. Basic auth will work normally.",
      );
    }

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Safety timeout using ref to avoid stale closure
    loadingTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        console.log("🕒 Safety timeout: forcing loading to false");
        setLoading(false);
      }
    }, 3000); // Reduced from 2000ms for faster fallback

    const initializeAuth = async () => {
      try {
        console.log("🔐 Initializing auth...");

        // Profile fetching with global disable check
        const fetchProfileSafely = async (userId: string) => {
          if (globalProfileFetchState.profileFetchDisabled) {
            console.log(
              "🔍 Profile fetching disabled to prevent timeout errors. Use window.enableProfileFetch() to re-enable.",
            );
            return null;
          }

          try {
            console.log("🔍 Fetching user profile...");
            const profile = await userApi.getUserProfile(userId);
            console.log("✅ Profile fetch successful");
            return profile;
          } catch (error) {
            const errorMessage = formatError(error);
            console.error("❌ Error fetching user profile:", errorMessage);
            return null;
          }
        };

        // Set up auth state listener first
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(
              "🔄 Auth state changed:",
              event,
              session?.user?.id || "no-user",
            );

            if (!mountedRef.current) {
              console.log("🚫 Component unmounted, ignoring auth state change");
              return;
            }

            try {
              if (event === "SIGNED_IN" && session?.user) {
                console.log(
                  "✅ User signed in, setting basic user data first...",
                );

                // Set basic user data immediately with sensible defaults
                const basicUser: UserProfile = {
                  id: session.user.id,
                  email: session.user.email,
                  username: session.user.email?.split("@")[0] || "user",
                  full_name:
                    session.user.user_metadata?.full_name ||
                    session.user.email?.split("@")[0] ||
                    "Anonymous User",
                  avatar: "👤",
                  watchlist: [],
                  genre_preferences: [],
                  onboarding_completed: false,
                };

                if (mountedRef.current) {
                  setUser(basicUser);
                  console.log("👤 Basic user data set:", basicUser);
                }

                // Defer profile fetching to avoid deadlocks
                setTimeout(async () => {
                  if (mountedRef.current) {
                    console.log("🔍 Fetching detailed profile...");
                    const profile = await fetchProfileSafely(session.user.id);

                    if (mountedRef.current) {
                      if (profile) {
                        const fullUser: UserProfile = {
                          id: session.user.id,
                          email: session.user.email,
                          ...profile,
                        };
                        setUser(fullUser);
                        console.log("👤 Full user profile loaded:", profile);
                      } else {
                        // Keep basic user data even if profile fetch fails
                        console.log(
                          "⚠️ Profile fetch failed, keeping basic user data",
                        );
                      }
                    }
                  }
                }, 0);
              } else if (event === "SIGNED_OUT") {
                console.log("🚪 User signed out");
                if (mountedRef.current) {
                  setUser(null);
                }
              }

              // Always set loading to false after processing auth state change
              if (mountedRef.current) {
                console.log(
                  "✅ Setting loading to false after auth state change",
                );
                setLoading(false);
                // Clear the safety timeout since we're done
                if (loadingTimeoutRef.current) {
                  clearTimeout(loadingTimeoutRef.current);
                }
              }
            } catch (error) {
              console.error("❌ Error processing auth state change:", error);
              if (mountedRef.current) {
                console.log("❌ Error occurred, setting loading to false");
                setLoading(false);
                // Clear the safety timeout
                if (loadingTimeoutRef.current) {
                  clearTimeout(loadingTimeoutRef.current);
                }
              }
            }
          },
        );

        subscription = data.subscription;

        // Check for existing session
        try {
          console.log("🔍 Checking for existing session...");
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("❌ Session check failed:", error);
            if (mountedRef.current) {
              setLoading(false);
            }
          } else if (session?.user) {
            console.log("📍 Found existing session for user:", session.user.id);

            // Set basic user data immediately with sensible defaults
            const basicUser: UserProfile = {
              id: session.user.id,
              email: session.user.email,
              username: session.user.email?.split("@")[0] || "user",
              full_name:
                session.user.user_metadata?.full_name ||
                session.user.email?.split("@")[0] ||
                "Anonymous User",
              avatar: "👤",
              watchlist: [],
              genre_preferences: [],
              onboarding_completed: false,
            };

            if (mountedRef.current) {
              setUser(basicUser);
              console.log("👤 Basic existing user data set:", basicUser);
            }

            // Defer profile fetching
            setTimeout(async () => {
              if (mountedRef.current) {
                console.log("🔍 Fetching existing user profile...");
                const profile = await fetchProfileSafely(session.user.id);

                if (mountedRef.current) {
                  if (profile) {
                    const fullUser: UserProfile = {
                      id: session.user.id,
                      email: session.user.email,
                      ...profile,
                    };
                    setUser(fullUser);
                    console.log(
                      "👤 Existing full user profile loaded:",
                      profile,
                    );
                  } else {
                    // Keep basic user data even if profile fetch fails
                    console.log(
                      "⚠️ Existing profile fetch failed, keeping basic user data",
                    );
                  }
                }
              }
            }, 0);

            if (mountedRef.current) {
              setLoading(false);
              // Clear the safety timeout
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
              }
            }
          } else {
            console.log("📍 No existing session found");
            if (mountedRef.current) {
              setLoading(false);
              // Clear the safety timeout
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
              }
            }
          }
        } catch (sessionError) {
          console.error("💥 Critical session error:", sessionError);
          if (mountedRef.current) {
            setLoading(false);
            // Clear the safety timeout
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
          }
        }
      } catch (error) {
        console.error("💥 Auth initialization failed:", error);
        if (mountedRef.current) {
          console.log("❌ Auth init failed, setting loading to false");
          setLoading(false);
          // Clear the safety timeout
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
        }
      }
    };

    initializeAuth();

    return () => {
      console.log("🧹 Cleaning up auth context");
      mountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { user, setUser, loading, setLoading };
};
