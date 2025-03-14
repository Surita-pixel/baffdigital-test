
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { ClientValues } from "@/lib/schema";
import ErrorDisplay from "@/components/ErrorDisplay";


async function getClient(id: string): Promise<ClientValues> {
    const res = await fetch(`/api/clients/${id}`);
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch client: ${res.status} - ${errorText}`);
    }
    return res.json();
}

async function deleteClient(id: string) {
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete client: ${res.status} - ${errorText}`);
    }
    return res.json();
}

export default function ClientDetail() {
    const router = useRouter();
    const { id } = useParams();
    const clientId = Array.isArray(id) ? id[0] : id;

    if (!clientId) return <div>Client ID not found</div>;

    const { data: client, isLoading, isError, error } = useQuery({
        queryKey: ["clients", clientId],
        queryFn: () => getClient(clientId),
        retry: false, 
    });

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: deleteClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            router.push("/clients");
        },
        onError: (error: any) => {
            console.error("Error deleting client:", error);
        },
    });

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this client?")) {
            deleteMutation.mutate(clientId);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    if (isError) {
        let errorMessage = "Error loading client.";
        if (error instanceof Error) {
            errorMessage = error.message;
            if (errorMessage.includes("404")) {
                errorMessage = "Client not found.";
            }
        }

        return <ErrorDisplay errorMessage={errorMessage} />;
    }

    return (
        <div className="container py-4">
            <div className="mb-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{client?.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>
                        <strong>ID:</strong> {client?.id}
                    </p>
                    <p>
                        <strong>Name:</strong> {client?.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {client?.email}
                    </p>
                </CardContent>
            </Card>

            <div className="mt-4 flex space-x-2 ">
                <Button asChild variant="secondary" className="w-fit">  
                    <Link href={`/clients/edit/${client?.id}`}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Link>
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? "Deleting..." : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete
                </Button>
            </div>
        </div>
    );
}