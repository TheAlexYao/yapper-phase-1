import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface InitialSessionCheckProps {
  setErrorMessage: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
  setShowLanguageSelect: (show: boolean) => void;
  getErrorMessage: (error: AuthError) => string;
}

export const InitialSessionCheck = ({
  setErrorMessage,
  setIsLoading,
  setShowLanguageSelect,
  getErrorMessage,
}: InitialSessionCheckProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashFragment = async () => {
      try {
        if (window.location.hash) {
          console.log("Detected hash fragment, processing OAuth callback...");
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data?.session) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (error) {
        console.error("Error processing hash fragment:", error);
        setErrorMessage(getErrorMessage(error as AuthError));
      }
    };

    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          console.log("Session found, checking profile...");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('target_language')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) throw profileError;

          if (profile?.target_language) {
            console.log("Language preference found, redirecting to topics...");
            navigate("/topics");
          } else {
            console.log("No language preference, showing language select...");
            setShowLanguageSelect(true);
          }
        }
      } catch (error) {
        console.error("Error in checkSession:", error);
        setErrorMessage(getErrorMessage(error as AuthError));
      } finally {
        setIsLoading(false);
      }
    };

    handleHashFragment();
    checkSession();
  }, [navigate, setErrorMessage, setIsLoading, setShowLanguageSelect, getErrorMessage]);

  return null;
};