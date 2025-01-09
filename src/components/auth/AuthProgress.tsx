import React from "react";
import { Progress } from "@/components/ui/progress";

interface AuthProgressProps {
  progress: number;
}

export const AuthProgress = ({ progress }: AuthProgressProps) => {
  return progress > 0 ? (
    <div className="mb-4">
      <Progress value={progress} className="h-2" />
    </div>
  ) : null;
};