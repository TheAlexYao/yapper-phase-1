import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        console.log("Hash present:", !!hash);

        if (!hash) {
          console.log("No hash found in URL");
          navigate("/auth");
          return;
        }

        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        console.log("Tokens present:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });

        if (error) {
          console.error("Error in callback:", errorDescription || error);
          navigate("/auth", { state: { error: errorDescription || error } });
          return;
        }

        if (accessToken && refreshToken) {
          console.log("Setting session...");
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (sessionError) {
            console.error("Session error:", sessionError);
            throw sessionError;
          }

          console.log("Session set successfully:", !!sessionData);

          const {
            data: { session },
          } = await supabase.auth.getSession();
          console.log("Got session:", !!session);

          if (session) {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("target_language")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              console.error("Profile error:", profileError);
            }

            console.log("Profile data:", profile);

            if (profile?.target_language) {
              console.log("Navigating to topics");
              navigate("/topics");
            } else {
              console.log("Navigating to language select");
              navigate("/auth", { state: { showLanguageSelect: true } });
            }
          } else {
            console.log("No session found after setting");
            navigate("/auth");
          }
        } else {
          console.error("Access token or refresh token missing");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/auth", { state: { error: error.message } });
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Processing authentication...</div>;
};

export default AuthCallback; 