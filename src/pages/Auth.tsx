import { useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { AuthLoadingSpinner } from "@/components/auth/AuthLoadingSpinner";
import { AuthProgress } from "@/components/auth/AuthProgress";
import { AuthError as AuthErrorComponent } from "@/components/auth/AuthError";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { InitialLanguageSelect } from "@/components/auth/InitialLanguageSelect";
import { AuthStateManager } from "@/components/auth/AuthStateManager";
import { InitialSessionCheck } from "@/components/auth/InitialSessionCheck";

const Auth = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

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
      <AuthStateManager
        setErrorMessage={setErrorMessage}
        setProgress={setProgress}
        setShowLanguageSelect={setShowLanguageSelect}
        getErrorMessage={getErrorMessage}
      />
      <InitialSessionCheck
        setErrorMessage={setErrorMessage}
        setIsLoading={setIsLoading}
        setShowLanguageSelect={setShowLanguageSelect}
        getErrorMessage={getErrorMessage}
      />
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