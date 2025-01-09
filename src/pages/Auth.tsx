import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError, AuthChangeEvent } from "@supabase/supabase-js";
import { AuthLoadingSpinner } from "@/components/auth/AuthLoadingSpinner";
import { AuthProgress } from "@/components/auth/AuthProgress";
import { AuthError as AuthErrorComponent } from "@/components/auth/AuthError";
import { AuthContainer } from "@/components/auth/AuthContainer";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          navigate("/topics");
        }
        if (error) {
          setErrorMessage(getErrorMessage(error));
        }
      } catch (error) {
        setErrorMessage("Failed to check authentication status");
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
      async (event: AuthChangeEvent, session) => {
        if (event === "SIGNED_IN" && session) {
          startProgressBar();
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select()
              .eq('id', session.user.id)
              .single();

            if (!profile) {
              const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: session.user.id,
                    full_name: session.user.user_metadata.full_name,
                    avatar_url: session.user.user_metadata.avatar_url,
                    onboarding_completed: false
                  }
                ]);

              if (profileError) {
                console.error('Error creating profile:', profileError);
                setErrorMessage('Failed to create user profile');
                return;
              }
            }

            setProgress(100);
            setTimeout(() => navigate("/topics"), 500);
          } catch (error) {
            setErrorMessage('An unexpected error occurred during sign in');
            setProgress(0);
          }
        }
        if (event === "USER_UPDATED") {
          const { error } = await supabase.auth.getSession();
          if (error) setErrorMessage(getErrorMessage(error));
        }
        if (event === "SIGNED_OUT") {
          setErrorMessage("");
          setProgress(0);
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
        redirectTo={`${window.location.origin}/topics`}
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
    </AuthContainer>
  );
};

export default Auth;