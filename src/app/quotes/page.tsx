"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QuoteForm from "@/components/QuoteForm";
import { QuoteValues } from "@/lib/schema";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useState, useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useQuoteStore } from "@/lib/state";
import { Button } from "@/components/ui/button";

async function createQuote(data: QuoteValues) {
    const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create quote: ${res.status} - ${errorText}`);
    }
    return res.json();
}

async function updateQuote(id: string, data: QuoteValues) {
    const res = await fetch(`/api/quotes/${id}`, {  
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update quote: ${res.status} - ${errorText}`);
    }
    return res.json();
}

const fetchQuotesFromApi = async (): Promise<QuoteValues[]> => {
    const res = await fetch("/api/quotes");
    if (!res.ok) {
        throw new Error(`Failed to fetch quotes from API: ${res.status} ${res.statusText}`);
    }
    return res.json();
};

export default function CreateQuote() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [createError, setCreateError] = useState<string | null>(null);
    const { quotes, setQuotes } = useQuoteStore(); 
    const [quoteToEdit, setQuoteToEdit] = useState<QuoteValues | null>(null); 

    const createMutation = useMutation({
        mutationFn: createQuote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
            router.push("/quotes");
        },
        onError: (error: any) => {
            console.error("Error creating quote:", error);
            setCreateError(error.message || "Error creating quote");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: QuoteValues }) => updateQuote(id, data), 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
            setQuoteToEdit(null); 
            router.push("/quotes");
        },
        onError: (error: any) => {
            console.error("Error updating quote:", error);
            setCreateError(error.message || "Error updating quote");
        },
    });

    const onSubmit: SubmitHandler<QuoteValues> = async (data: QuoteValues) => {
        console.log("Creating quote:", data);
        setCreateError(null);

        try {
            if (quoteToEdit) {
                await updateMutation.mutateAsync({ id: quoteToEdit.id, data: data });  
            } else {
                await createMutation.mutateAsync(data);
            }
        } catch (error: any) {
            setCreateError(error.message || "Error creating/updating quote");
        }
    };

    
    useEffect(() => {
        if (quotes.length === 0) {
            fetchQuotesFromApi()
                .then(data => {
                    setQuotes(data); 
                })
                .catch(error => {
                    console.error("Error fetching quotes from API:", error);
                    setCreateError("Error fetching initial quotes from API");
                });
        }
    }, [quotes.length, setQuotes]);

    if (createError) {
        return <ErrorDisplay errorMessage={createError} />;
    }

    return (
        <div>
            <QuoteForm
                isCreate={!quoteToEdit}
                initialValues={quoteToEdit}
                onSubmit={onSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                isError={createMutation.isError || updateMutation.isError}
                mutationPending={createMutation.isPending || updateMutation.isPending}
            />

            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <h2 className="text-xl font-bold mb-4">Lista de Cotizaciones</h2>

                <Table className="w-full mx-4 md:mx-6 lg:mx-8">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Procedimiento</TableHead>
                            <TableHead>Monto Original</TableHead>
                            <TableHead>Descuento (%)</TableHead>
                            <TableHead>Total Descuento</TableHead>
                            <TableHead>Monto Total</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">No hay cotizaciones.</TableCell>
                            </TableRow>
                        ) : (
                            quotes.map((quote) => {
                                
                                const discountAmount = (quote.amount * quote.discount) / 100;

                                
                                const totalAmount = quote.amount - discountAmount;

                                return (
                                    <TableRow key={quote.id}>
                                        <TableCell className="font-medium">{quote.id}</TableCell>
                                        <TableCell>{quote.clientname}</TableCell>
                                        <TableCell>{quote.proceduretitle}</TableCell>
                                        <TableCell>{quote.amount}</TableCell>
                                        <TableCell>{quote.discount}</TableCell>
                                        <TableCell>{discountAmount.toFixed(2)}</TableCell>
                                        <TableCell>{totalAmount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/quotes/${quote.id}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Ver
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setQuoteToEdit(quote)}  
                                                >
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Editar
                                                </Button>
                                                <Button variant="destructive" size="sm" asChild>
                                                    <Link href={`/quotes/delete/${quote.id}`}>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}