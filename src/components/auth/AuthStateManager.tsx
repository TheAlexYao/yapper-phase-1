import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthStateManagerProps {
  setErrorMessage: (message: string) => void;
  setProgress: (progress: number) => void;
  setShowLanguageSelect: (show: boolean) => void;
  getErrorMessage: (error: AuthError) => string;
}

export const AuthStateManager = ({
  setErrorMessage,
  setProgress,
  setShowLanguageSelect,
  getErrorMessage,
}: AuthStateManagerProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const startProgressBar = () => {
      setProgress(0);
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in, starting progress...");
          startProgressBar();
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('target_language')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError) throw profileError;

            if (profile?.target_language) {
              console.log("Language preference exists, completing progress...");
              setProgress(100);
              setTimeout(() => navigate("/topics"), 500);
            } else {
              console.log("No language preference, showing selector...");
              setProgress(100);
              setShowLanguageSelect(true);
            }
          } catch (error) {
            console.error("Error checking profile:", error);
            setErrorMessage('An unexpected error occurred during sign in');
            setProgress(0);
          }
        }
        if (event === "USER_UPDATED") {
          const { error } = await supabase.auth.getSession();
          if (error) setErrorMessage(getErrorMessage(error));
        }
        if (event === "SIGNED_OUT") {
          console.log("User signed out, resetting state...");
          setErrorMessage("");
          setProgress(0);
          setShowLanguageSelect(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [navigate, setErrorMessage, setProgress, setShowLanguageSelect, getErrorMessage]);

  return null;
};