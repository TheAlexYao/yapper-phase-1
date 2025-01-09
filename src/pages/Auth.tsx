import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { InitialLanguageSelect } from "@/components/auth/InitialLanguageSelect";

const Auth = () => {
  const navigate = useNavigate();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  useEffect(() => {
    // Handle hash fragment from OAuth callback
    const handleHashCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      
      if (accessToken) {
        // Set the session using the access token
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get("refresh_token") || "",
        });

        if (data.session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('target_language')
            .eq('id', data.session.user.id)
            .single();

          if (profile?.target_language) {
            navigate("/topics");
          } else {
            setShowLanguageSelect(true);
          }
        }
      }
    };

    // Check for existing session
    const checkSession = async () => {
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
    };

    // Handle both hash callback and regular session check based on the current path
    if (window.location.pathname.includes('/callback') && window.location.hash) {
      handleHashCallback();
    } else {
      checkSession();
    }

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

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <AuthContainer>
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