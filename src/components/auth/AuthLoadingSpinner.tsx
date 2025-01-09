import React from "react";

export const AuthLoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#38b6ff] to-[#7843e6]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
    </div>
  );
};