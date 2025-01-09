import React from "react";

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#38b6ff] to-[#7843e6] p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent mb-4">
            Yapper
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Sign in to continue your language learning journey
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};