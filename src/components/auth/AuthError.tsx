import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthErrorProps {
  message: string;
}

export const AuthError = ({ message }: AuthErrorProps) => {
  return message ? (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null;
};