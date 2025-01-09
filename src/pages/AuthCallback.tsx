import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        if (!hash) return;

        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

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
              navigate("/auth", { state: { showLanguageSelect: true } });
            }
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate("/auth", { state: { error: error.message } });
      }
    };

    handleCallback();
  }, [navigate]);

  return null;
};

export default AuthCallback; 