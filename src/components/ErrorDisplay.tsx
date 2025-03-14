"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface ErrorDisplayProps {
  errorMessage: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage }) => {
  const router = useRouter();

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 font-semibold">{errorMessage}</p>
          <p className="text-gray-500">Es posible que el procedimiento no exista o haya sido eliminado.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDisplay;