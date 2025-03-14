"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ErrorDisplay from "@/components/ErrorDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useProcedureStore } from "@/lib/state";
import { ProcedureValues } from "@/lib/schema";
import ProcedureForm from "@/components/ProcedureForm";

async function deleteProcedure(id: string) {
  const res = await fetch(`/api/procedures/${id}`, { method: "DELETE" });
  return res.json();
}
async function getProcedure(id: string): Promise<ProcedureValues> {
    const res = await fetch(`/api/procedures/${id}`);
    if (!res.ok) {
        const errorText = await res.text(); 
        throw new Error(`Failed to fetch procedure: ${res.status} - ${errorText}`);
    }
    return res.json();
}

async function updateProcedure(data: any) {
    const { id, ...updates } = data;
    const res = await fetch(`/api/procedures/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });
    return res.json();
}
export default function EditProcedure() {
  const router = useRouter();
  const { id } = useParams();
  const procedureId = Array.isArray(id) ? id[0] : id;
  const { getProcedureById } = useProcedureStore();
  const procedureFromStore = procedureId ? getProcedureById(procedureId) : undefined;

  const {
      data: procedure,
      isLoading,
      isError,
      error
  } = useQuery({
      queryKey: ["procedures", procedureId],
      queryFn: () => {
          if (!procedureId) throw new Error("Procedure ID is required");
          return getProcedure(procedureId);
      },
      enabled: !procedureFromStore && !!procedureId,
      retry: false, 
  });

  const {
      register,
      handleSubmit,
      reset,
      formState: { errors },  
  } = useForm<ProcedureValues>({
      defaultValues: {
          pk: "",
          sk: "DETAILS",
          title: "",
          prices: [],
          createdAt: new Date().toISOString(),
      },
      mode: "onChange",
  });

  useEffect(() => {
      if (procedureFromStore) {
          reset(procedureFromStore);
      } else if (procedure) {
          reset(procedure);
      }
  }, [procedureFromStore, procedure, reset]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
      mutationFn: updateProcedure,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["procedures"] });
          router.push("/");
      },
      onError: (error: any) => {
          console.error("Error updating procedure:", error);
      },
  });

  const deleteMutation = useMutation({
      mutationFn: deleteProcedure,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["procedures"] });
          router.push("/procedures");
      },
  });


  const onSubmit = async (data: ProcedureValues) => {
      if (data.title.length < 3) {
          return
      } else {
          await mutation.mutateAsync({ id: procedureId, ...data });
      }
  };

  const handleDelete = async () => {
      if (!procedureId) return;
      if (confirm("¿Estás seguro de que quieres eliminar este procedimiento?")) {
          await deleteMutation.mutateAsync(procedureId);
      }
  };

  if (isLoading) return <div>Cargando...</div>;

  if (isError) {
      let errorMessage = "Error al cargar el procedimiento.";
      if (error instanceof Error) {
          errorMessage = error.message;
          if (errorMessage.includes("404")) {
              errorMessage = "Procedimiento no encontrado.";
          }
      }

      return <ErrorDisplay errorMessage={errorMessage} />;
  }

  const initialProcedure = procedureFromStore || procedure;

  if (!initialProcedure) {
      return <ErrorDisplay errorMessage="Procedimiento no encontrado." />;
  }

  return (
      <ProcedureForm
          initialValues={initialProcedure}
          onSubmit={onSubmit}
          onDelete={handleDelete}
          isLoading={isLoading}
          isError={isError}
          mutationPending={mutation.isPending || deleteMutation.isPending}
      />
  );
}
