
"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProcedureForm from "@/components/ProcedureForm";
import { ProcedureValues } from "@/lib/schema";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useState } from "react";

async function createProcedure(data: ProcedureValues) {
  const res = await fetch("/api/procedures", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create procedure: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export default function CreateProcedure() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createError, setCreateError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      router.push("/procedures");
    },
    onError: (error: any) => {
      console.error("Error creating procedure:", error);
      setCreateError(error.message || "Error creating procedure");
    },
  });

  const onSubmit = async (data: ProcedureValues) => {
    console.log("Creating procedure:", data);
    setCreateError(null);

      await mutation.mutateAsync(data);
   
  };

  if (createError) {
    return <ErrorDisplay errorMessage={createError} />;
  }

  return (
    <ProcedureForm
      isCreate={true}
      onSubmit={onSubmit}
      isLoading={mutation.isPending}
      isError={mutation.isError}
      mutationPending={mutation.isPending}
    />
  );
}