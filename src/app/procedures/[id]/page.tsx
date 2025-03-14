"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useEffect } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";

async function getProcedure(id: string) {
    const res = await fetch(`/api/procedures/${id}`);
    if (!res.ok) {
       
        const errorText = await res.text();
        throw new Error(`Failed to fetch procedure: ${res.status} - ${errorText}`);

    }
    return res.json();
}

async function deleteProcedure(id: string) {
    const res = await fetch(`/api/procedures/${id}`, { method: "DELETE" });
    return res.json();
}

export default function ProcedureDetail() {
    const router = useRouter();
    const { id } = useParams();
    const procedureId = Array.isArray(id) ? id[0] : id;

    if (!procedureId) return <div>ID no encontrado</div>;

    const { data: procedure, isLoading, isError, error } = useQuery({
        queryKey: ["procedures", procedureId],
        queryFn: () => getProcedure(procedureId),
        retry: false, 
    });

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: deleteProcedure,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["procedures"] });
            router.push("/procedures");
        },
    });

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


    const handleDelete = () => {
        if (confirm("¿Estás seguro de que quieres eliminar este procedimiento?")) {
            deleteMutation.mutate(procedureId);
        }
    };

    return (
        <div className="container py-4">
            <div className="mb-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{procedure?.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p><strong>ID:</strong> {procedure?.id}</p>
                    <p><strong>Título:</strong> {procedure?.title}</p>
                    {procedure?.prices && procedure.prices.length > 0 ? (
                        <div>
                            <strong>Precios:</strong>
                            <ul>
                                {procedure.prices.map((price: any, index: number) => (
                                    <li key={index}>
                                        {price.type}: ${price.amount}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p><strong>Precios:</strong> No hay precios definidos.</p>
                    )}
                    <p><strong>Fecha de Creación:</strong> {procedure?.createdAt}</p>
                </CardContent>
            </Card>

            <div className="mt-4 flex space-x-2">
                <Button asChild className="custom-edit-button">
                    <Link href={`/procedures/edit/${procedure?.id}`}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Link>
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? "Borrando..." : <Trash2 className="mr-2 h-4 w-4" />}
                    Borrar
                </Button>
            </div>
        </div>
    );
}