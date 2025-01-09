import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get hash parameters
        const hash = window.location.hash;
        if (!hash) {
          console.error("No hash found in URL");
          navigate("/auth?error_description=Authentication failed");
          return;
        }

        // Parse hash parameters
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        if (error) {
          console.error("Auth error:", errorDescription || error);
          navigate(`/auth?error_description=${encodeURIComponent(errorDescription || error)}`);
          return;
        }

        if (!accessToken || !refreshToken) {
          console.error("Missing tokens");
          navigate("/auth?error_description=Authentication failed");
          return;
        }

        // Set the session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate(`/auth?error_description=${encodeURIComponent(sessionError.message)}`);
          return;
        }

        // Check if user has selected a language
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
            navigate("/auth", { state: { showLanguageSelect: true } });
          }
        } else {
          navigate("/auth?error_description=Session not found");
        }
      } catch (error) {
        console.error("Callback error:", error);
        navigate(`/auth?error_description=${encodeURIComponent(error.message)}`);
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Processing authentication...</div>;
};

export default AuthCallback;