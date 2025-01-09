import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError, AuthChangeEvent } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) navigate("/topics");
      if (error) setErrorMessage(getErrorMessage(error));
      setIsLoading(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        if (event === "SIGNED_IN" && session) {
          // Create profile if it doesn't exist
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

          navigate("/topics");
        }
        if (event === "USER_UPDATED") {
          const { error } = await supabase.auth.getSession();
          if (error) setErrorMessage(getErrorMessage(error));
        }
        if (event === "SIGNED_OUT") {
          setErrorMessage("");
        }
      }
    );

    return () => subscription.unsubscribe();
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
        default:
          return error.message;
      }
    }
    return error.message;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#38b6ff] to-[#7843e6]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#38b6ff] to-[#7843e6] p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent mb-4">
            Yapper
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Sign in to continue your language learning journey
          </p>
        </div>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
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
      </div>
    </div>
  );
};

export default Auth;