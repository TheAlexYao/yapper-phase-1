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
        // Get hash parameters from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        // If we have tokens in the URL, set the session
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;
        }

        // Always check for existing session after setting or if no tokens in URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
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
      } catch (error) {
        console.error('Auth error:', error);
        setError(error.message);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
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
    });

    // If we're on the callback page or have a hash, handle the auth callback
    if (window.location.pathname.includes('/auth/callback') || window.location.hash) {
      handleAuthCallback();
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

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