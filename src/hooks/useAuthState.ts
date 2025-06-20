import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { userApi } from "@/services/user";
import { UserProfile } from "@/types/auth";
import { formatError } from "@/lib/utils";

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    mountedRef.current = true;
    let subscription: any;

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

        // Helper function to fetch profile with timeout and retry limiting
        const fetchProfileSafely = async (userId: string) => {
          try {
            retryCountRef.current += 1;
            console.log(
              `🔍 Fetching profile (attempt ${retryCountRef.current}/${maxRetries})...`,
            );

            if (retryCountRef.current > maxRetries) {
              console.warn(
                "⚠️ Max retries reached for profile fetch, skipping...",
              );
              return null;
            }

            const profile = await userApi.getUserProfile(userId);
            retryCountRef.current = 0; // Reset on success
            return profile;
          } catch (error) {
            const errorMessage = formatError(error);
            console.error("❌ Error fetching user profile:", errorMessage);

            // Only log detailed error on first few attempts
            if (retryCountRef.current <= 2) {
              console.error("Full error details:", error);
            }
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

                // Set basic user data immediately
                const basicUser: UserProfile = {
                  id: session.user.id,
                  email: session.user.email,
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

                    if (mountedRef.current && profile) {
                      const fullUser: UserProfile = {
                        id: session.user.id,
                        email: session.user.email,
                        ...profile,
                      };
                      setUser(fullUser);
                      console.log("👤 Full user profile loaded:", profile);
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

            // Set basic user data immediately
            const basicUser: UserProfile = {
              id: session.user.id,
              email: session.user.email,
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

                if (mountedRef.current && profile) {
                  const fullUser: UserProfile = {
                    id: session.user.id,
                    email: session.user.email,
                    ...profile,
                  };
                  setUser(fullUser);
                  console.log("👤 Existing full user profile loaded:", profile);
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
