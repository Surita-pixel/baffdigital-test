"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ClientForm from "@/components/ClientForm";
import { ClientValues } from "@/lib/schema";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useState } from "react";

async function createClient(data: ClientValues) {
    const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create client: ${res.status} - ${errorText}`);
    }
    return res.json();
}

export default function CreateClient() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [createError, setCreateError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            router.push("/clients");
        },
        onError: (error: any) => {
            console.error("Error creating client:", error);
            setCreateError(error.message || "Error creating client");
        },
    });

    const onSubmit = async (data: ClientValues) => {
        console.log("Creating client:", data);
        setCreateError(null);

        try {
            await mutation.mutateAsync(data);
        } catch (error: any) {
            setCreateError(error.message || "Error creating client");
        }
    };

    if (createError) {
        return <ErrorDisplay errorMessage={createError} />;
    }

    return (
        <ClientForm
            isCreate={true}
            onSubmit={onSubmit}
            isLoading={mutation.isPending}
            isError={mutation.isError}
            mutationPending={mutation.isPending}
        />
    );
}
