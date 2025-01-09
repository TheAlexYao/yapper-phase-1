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
  }, []);

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
        />
      )}
    </AuthContainer>
  );
};

export default Auth;