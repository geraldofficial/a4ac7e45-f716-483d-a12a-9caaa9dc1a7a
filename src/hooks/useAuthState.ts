import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { userApi } from "@/services/user";
import { UserProfile } from "@/types/auth";
import { formatError } from "@/lib/utils";

// Global state to prevent multiple simultaneous profile fetches
let globalProfileFetchState = {
  isProfileFetching: false,
  consecutiveTimeouts: 0,
  profileFetchDisabled: false,
  maxTimeouts: 2,
};

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

        // Helper function to fetch profile with global circuit breaker pattern
        const fetchProfileSafely = async (userId: string) => {
          // Check global circuit breaker
          if (globalProfileFetchState.profileFetchDisabled) {
            console.warn(
              "🚫 Profile fetching globally disabled due to persistent issues",
            );
            return null;
          }

          // Prevent concurrent profile fetches
          if (globalProfileFetchState.isProfileFetching) {
            console.log("⏳ Profile fetch already in progress, skipping...");
            return null;
          }

          try {
            globalProfileFetchState.isProfileFetching = true;
            retryCountRef.current += 1;

            // Circuit breaker: stop if too many consecutive timeouts globally
            if (
              globalProfileFetchState.consecutiveTimeouts >=
              globalProfileFetchState.maxTimeouts
            ) {
              console.warn(
                "🚫 Global circuit breaker: too many timeouts, disabling profile fetch",
              );
              globalProfileFetchState.profileFetchDisabled = true;
              return null;
            }

            if (retryCountRef.current > maxRetries) {
              console.warn(
                "⚠️ Max retries reached for profile fetch, skipping...",
              );
              return null;
            }

            console.log(
              `🔍 Fetching profile (attempt ${retryCountRef.current}/${maxRetries}, global timeouts: ${globalProfileFetchState.consecutiveTimeouts})...`,
            );

            // Very short timeout - fail fast
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(
                () => reject(new Error("Profile fetch timeout")),
                2000,
              );
            });

            const profile = await Promise.race([
              userApi.getUserProfile(userId),
              timeoutPromise,
            ]);

            // Reset counters on success
            retryCountRef.current = 0;
            globalProfileFetchState.consecutiveTimeouts = 0;
            console.log("✅ Profile fetch successful");
            return profile;
          } catch (error) {
            const errorMessage = formatError(error);

            // Track timeouts globally
            if (errorMessage.includes("timeout")) {
              globalProfileFetchState.consecutiveTimeouts += 1;

              // Only log the first timeout to avoid spam
              if (globalProfileFetchState.consecutiveTimeouts === 1) {
                console.error(
                  `❌ Error fetching user profile: ${errorMessage} (global timeout #${globalProfileFetchState.consecutiveTimeouts})`,
                );
              }

              // Disable profile fetching after consecutive timeouts
              if (
                globalProfileFetchState.consecutiveTimeouts >=
                globalProfileFetchState.maxTimeouts
              ) {
                console.warn(
                  "🚫 Too many consecutive timeouts globally, disabling profile fetch permanently",
                );
                globalProfileFetchState.profileFetchDisabled = true;
              }
            } else {
              console.error("❌ Error fetching user profile:", errorMessage);
              // Reset timeout counter for non-timeout errors
              globalProfileFetchState.consecutiveTimeouts = 0;
            }

            return null;
          } finally {
            globalProfileFetchState.isProfileFetching = false;
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
