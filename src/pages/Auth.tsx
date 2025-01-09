import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { InitialLanguageSelect } from "@/components/auth/InitialLanguageSelect";
import { AuthError } from "@/components/auth/AuthError";

const Auth = () => {
  const navigate = useNavigate();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Store hash immediately to prevent loss during re-renders
        const hash = window.location.hash;
        
        // If we're on the callback page but don't have a hash, return early
        if (window.location.pathname.includes('/auth/callback') && !hash) {
          return;
        }

        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;
          
          // Clear the hash after setting session
          window.history.replaceState(null, '', '/auth/callback');
          
          // Immediately check session and redirect
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('target_language')
              .eq('id', session.user.id)
              .single();

            if (profile?.target_language) {
              navigate("/topics");
            } else {
              setShowLanguageSelect(true);
            }
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        setError(error.message);
      }
    };

    handleAuthCallback();

    return () => {}; // Clean up not needed for this case
  }, []); // Run only once on mount

  return (
    <AuthContainer>
      <AuthError message={error} />
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
          }}
          providers={["google"]}
          redirectTo={`${window.location.origin}/auth/callback`}
          view="sign_in"
          showLinks={false}
          onlyThirdPartyProviders={true}
        />
      )}
    </AuthContainer>
  );
};

export default Auth;