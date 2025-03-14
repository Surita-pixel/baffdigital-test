
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ClientValues } from "@/lib/schema";
import ClientForm from "@/components/ClientForm";
import ErrorDisplay from "@/components/ErrorDisplay";

async function deleteClient(id: string) {
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete client: ${res.status} - ${errorText}`);
    }
    return res.json();
}

async function getClient(id: string): Promise<ClientValues> {
    const res = await fetch(`/api/clients/${id}`);
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch client: ${res.status} - ${errorText}`);
    }
    return res.json();
}

async function updateClient(data: any) {
    const { id, ...updates } = data;
    const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update client: ${res.status} - ${errorText}`);
    }
    return res.json();
}

export default function EditClient() {
    const router = useRouter();
    const { id } = useParams(); 
    const clientId = Array.isArray(id) ? id[0] : id; 

    const {
        data: client,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["clients", clientId],
        queryFn: () => {
            if (!clientId) throw new Error("Client ID is required");
            return getClient(clientId);
        },
        retry: false, 
    });


    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: updateClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] }); 
            router.push("/clients");
        },
        onError: (error: any) => {
            console.error("Error updating client:", error);
        },
    });

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

    const onSubmit = async (data: ClientValues) => {
        try {
            await mutation.mutateAsync({ id: clientId, ...data });
        } catch (error) {
            
            console.error("Error in onSubmit:", error);
        }
    };

    const handleDelete = async () => {
        if (!clientId) return;
        if (confirm("Are you sure you want to delete this client?")) {
            try {
                await deleteMutation.mutateAsync(clientId);
            } catch (error) {
                console.error("Error in handleDelete:", error);
            }
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

    if (!client) {
        return <ErrorDisplay errorMessage="Client not found." />;
    }

    return (
        <ClientForm
            initialValues={client} 
            onSubmit={onSubmit}
            onDelete={handleDelete}
            isLoading={isLoading}
            isError={isError}
            mutationPending={mutation.isPending || deleteMutation.isPending}
        />
    );
}