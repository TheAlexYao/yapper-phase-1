import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { AuthLoadingSpinner } from "@/components/auth/AuthLoadingSpinner";
import { AuthProgress } from "@/components/auth/AuthProgress";
import { AuthError as AuthErrorComponent } from "@/components/auth/AuthError";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { InitialLanguageSelect } from "@/components/auth/InitialLanguageSelect";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  // Handle hash fragment and initial session check
  useEffect(() => {
    const handleHashFragment = async () => {
      try {
        // If we have a hash in the URL, we're coming back from OAuth
        if (window.location.hash) {
          console.log("Detected hash fragment, processing OAuth callback...");
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data?.session) {
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (error) {
        console.error("Error processing hash fragment:", error);
        setErrorMessage(getErrorMessage(error as AuthError));
      }
    };

    handleHashFragment();
  }, []);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          console.log("Session found, checking profile...");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('target_language')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) throw profileError;

          if (profile?.target_language) {
            console.log("Language preference found, redirecting to topics...");
            navigate("/topics");
          } else {
            console.log("No language preference, showing language select...");
            setShowLanguageSelect(true);
          }
        }
      } catch (error) {
        console.error("Error in checkSession:", error);
        setErrorMessage(getErrorMessage(error as AuthError));
      } finally {
        setIsLoading(false);
      }
    };

    const startProgressBar = () => {
      setProgress(0);
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in, starting progress...");
          startProgressBar();
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('target_language')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError) throw profileError;

            if (profile?.target_language) {
              console.log("Language preference exists, completing progress...");
              setProgress(100);
              setTimeout(() => navigate("/topics"), 500);
            } else {
              console.log("No language preference, showing selector...");
              setProgress(100);
              setShowLanguageSelect(true);
            }
          } catch (error) {
            console.error("Error checking profile:", error);
            setErrorMessage('An unexpected error occurred during sign in');
            setProgress(0);
          }
        }
        if (event === "USER_UPDATED") {
          const { error } = await supabase.auth.getSession();
          if (error) setErrorMessage(getErrorMessage(error));
        }
        if (event === "SIGNED_OUT") {
          console.log("User signed out, resetting state...");
          setErrorMessage("");
          setProgress(0);
          setShowLanguageSelect(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.code) {
        case "invalid_credentials":
          return "Invalid email or password. Please check your credentials and try again.";
        case "user_not_found":
          return "No user found with these credentials.";
        case "invalid_grant":
          return "Invalid login credentials.";
        case "email_not_confirmed":
          return "Please verify your email address before signing in.";
        case "network_error":
          return "Network error. Please check your internet connection.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <AuthContainer>
      <AuthProgress progress={progress} />
      <AuthErrorComponent message={errorMessage} />
      
      {showLanguageSelect ? (
        <InitialLanguageSelect />
      ) : (
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#38b6ff",
                  brandAccent: "#7843e6",
                },
              },
            },
            style: {
              button: {
                backgroundColor: 'white',
                color: '#333',
                border: '1px solid #ddd'
              },
            },
          }}
          providers={["google"]}
          redirectTo={`${window.location.origin}/auth/callback`}
          view="sign_in"
          showLinks={false}
          onlyThirdPartyProviders={true}
          localization={{
            variables: {
              sign_in: {
                social_provider_text: "Continue with {{provider}}"
              }
            }
          }}
        />
      )}
    </AuthContainer>
  );
};

export default Auth;