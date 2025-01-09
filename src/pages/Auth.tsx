import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { InitialLanguageSelect } from "@/components/auth/InitialLanguageSelect";
import { AuthError } from "@/components/auth/AuthError";
import { useEffect, useState } from "react";

const Auth = () => {
  const navigate = useNavigate();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorDesc = params.get('error_description');
    if (errorDesc) {
      setError(errorDesc);
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("target_language")
          .eq("id", session.user.id)
          .single();

        if (profile?.target_language) {
          navigate("/topics");
        } else {
          setShowLanguageSelect(true);
        }
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <AuthContainer>
      <AuthError message={error} />
      {showLanguageSelect ? (
        <InitialLanguageSelect />
      ) : (
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
          redirectTo={`${window.location.origin}/auth/callback`}
          onlyThirdPartyProviders={true}
        />
      )}
    </AuthContainer>
  );
};

export default Auth;