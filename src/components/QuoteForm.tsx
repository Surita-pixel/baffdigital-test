"use client";

import { useState, useEffect, useCallback } from "react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, SubmitHandler } from "react-hook-form";
import { QuoteValues, QuoteSchema, ProcedureValues, PriceValues } from "@/lib/schema";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useProcedureStore, useQuoteStore } from "@/lib/state";
import { useQuery } from "@tanstack/react-query";

interface QuoteFormProps {
    initialValues?: QuoteValues;
    onSubmit: SubmitHandler<QuoteValues>;
    onDelete?: () => void;
    isCreate?: boolean;
    isLoading: boolean;
    isError: boolean;
    mutationPending: boolean;
    onCancel?: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
    initialValues,
    onSubmit: _onSubmit,
    onDelete,
    isCreate = false,
    isLoading,
    isError,
    mutationPending,
}) => {
    const router = useRouter();
    const proceduresFromStore = useProcedureStore((state) => state.procedures);
    const setProcedures = useProcedureStore((state) => state.setProcedures);
    const [procedures, setProceduresLocal] = useState<ProcedureValues[]>(proceduresFromStore);
    const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
    const [prices, setPrices] = useState<PriceValues[]>([]);
    const { addQuote } = useQuoteStore();
    const [mutationPendingLocal, setMutationPendingLocal] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string | undefined>(initialValues?.clientId);
    const [selectedProcedureId, setSelectedProcedureId] = useState<string | undefined>(initialValues?.procedureId);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        getValues, //Import getValues
        formState: { errors, isSubmitSuccessful },
    } = useForm<QuoteValues>({
        defaultValues: {
            clientId: "",
            discount: 0,
            procedureId: "",
            procedurePrice: { id: "", type: "", amount: 0 },
            amount: 0,
            notes: "",
        },
        mode: "onChange",
        resolver: zodResolver(QuoteSchema),
    });

    useEffect(() => {
        if (initialValues) {
            reset(initialValues);
            setSelectedClientId(initialValues.client_id);
            setSelectedProcedureId(initialValues.procedure_id);
            console.log(initialValues.clientId)
            setValue("clientId", initialValues.client_id);
            setValue("procedureId", initialValues.procedure_id);
        }
    }, [initialValues, reset, setValue]);


    const procedureId = watch("procedureId");

    
    const handlePriceChange = useCallback((price: PriceValues) => {
        setValue("procedurePrice", { ...price, id: price.id || "" });
        setValue("amount", price.amount);
    }, [setValue]); 

    
    useEffect(() => {
        const getPrices = async () => {
            if (procedureId) {
                try {
                    const response = await fetch(`/api/procedures/${procedureId}/prices`, { method: 'POST' });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data: PriceValues[] = await response.json();
                    setPrices(data);

                    
                    if (data.length > 0) {
                        handlePriceChange(data[0]);
                    } else {
                        setValue("procedurePrice", { id: "", type: "", amount: 0 });
                        setValue("amount", 0);
                    }

                } catch (error) {
                    console.error("Error fetching prices:", error);
                    setPrices([]);
                    setValue("procedurePrice", { id: "", type: "", amount: 0 });
                    setValue("amount", 0);
                }
            } else {
                setPrices([]);
                setValue("procedurePrice", { id: "", type: "", amount: 0 });
                setValue("amount", 0);
            }
        };

        getPrices();
    }, [procedureId, setValue, handlePriceChange]);  //handlePriceChange es una dependencia pero ahora esta bien definida

    const calculateTotal = () => {
        const discount = watch("discount") || 0;
        const amount = watch("amount") || 0;
        return amount * (1 - discount / 100);
    };

    const total = calculateTotal();

    const fetchClients = async () => {
        const response = await fetch('/api/clients');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    };

    const {
        isLoading: clientsLoading,
        isError: clientsError,
        data: clientsData,
    } = useQuery({
        queryKey: ["clients"],
        queryFn: fetchClients,
    });

    useEffect(() => {
        if (clientsData) {
            setClients(clientsData);
        }
    }, [clientsData]);

    const fetchProcedures = async (): Promise<ProcedureValues[]> => {
        const response = await fetch('/api/procedures');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data as ProcedureValues[];
    };

    const {
        isLoading: proceduresLoading,
        isError: proceduresError,
        data: proceduresData,
    } = useQuery({
        queryKey: ["procedures"],
        queryFn: fetchProcedures,
        enabled: !proceduresFromStore || proceduresFromStore.length === 0,
    });

    useEffect(() => {
        if (proceduresData) {
            setProceduresLocal(proceduresData);
        } else {
            setProceduresLocal(proceduresFromStore);
        }
    }, [proceduresData, proceduresFromStore]);


    const onSubmit: SubmitHandler<QuoteValues> = async (data) => {
        setMutationPendingLocal(true);
        setFormError(null); 
        try {
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create quote');
            }

            const newQuote = await response.json(); 
            addQuote(newQuote.quote); 
            reset(); 
            router.push('/quotes');
        } catch (error: any) {
            console.error("Error creating quote:", error);
            setFormError(error.message || 'Failed to create quote.');
        } finally {
            setMutationPendingLocal(false);
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
                    <CardTitle className="text-2xl font-bold">
                        {isCreate ? "Crear Cotización" : "Editar Cotización"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {formError && <div className="text-red-500">{formError}</div>}
                        <div>
                            <Label htmlFor="clientId">Cliente:</Label>
                            <Select value={selectedClientId} onValueChange={(value) => {
                                setValue("clientId", value);
                                setSelectedClientId(value);
                            }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.clientId && <p className="text-red-500">{errors.clientId?.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="procedureId">Procedimiento:</Label>
                            <Select value={selectedProcedureId} onValueChange={(value) => {
                                setValue("procedureId", value);
                                setSelectedProcedureId(value);
                                setPrices([]);
                            }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un procedimiento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {procedures.map((procedure) => (
                                        <SelectItem key={procedure.id} value={procedure.id!}>
                                            {procedure.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.procedureId && <p className="text-red-500">{errors.procedureId?.message}</p>}
                        </div>

                        {prices.length > 0 && (
                            <div>
                                <Label htmlFor="procedurePrice">Precio:</Label>
                                <Select onValueChange={(value) => {
                                    const price = prices.find(pr => pr.id === value);
                                    if (price) {
                                        handlePriceChange(price)
                                    }
                                }}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un precio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {prices.map((price) => (
                                            <SelectItem key={price.id} value={price.id ?? ''}>
                                                {`${price.type} - $${price.amount}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="discount">Descuento (%):</Label>
                            <Input
                                type="number"
                                id="discount"
                                {...register("discount", { valueAsNumber: true })}
                            />
                            {errors.discount && <p className="text-red-500">{errors.discount?.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="amount">Monto:</Label>
                            <Input
                                type="number"
                                id="amount"
                                {...register("amount", { valueAsNumber: true })}
                                readOnly
                            />
                            {errors.amount && <p className="text-red-500">{errors.amount?.message}</p>}
                        </div>

                        <div>
                            <Label>Total:</Label>
                            <p className="font-bold">${total.toFixed(2)}</p>
                        </div>

                        <div>
                            <Label htmlFor="notes">Notas:</Label>
                            <Textarea id="notes" {...register("notes")} />
                            {errors.notes && <p className="text-red-500">{errors.notes?.message}</p>}
                        </div>

                        <div className="flex justify-between">
                            <Button type="submit" disabled={mutationPendingLocal || isLoading || clientsLoading || proceduresLoading}>
                                {mutationPendingLocal ? "Guardando..." : "Guardar"}
                            </Button>
                            {onDelete && !isCreate && (
                                <Button
                                    variant="destructive"
                                    type="button"
                                    onClick={onDelete}
                                    disabled={mutationPendingLocal || isLoading || clientsLoading || proceduresLoading}
                                >
                                    {mutationPendingLocal ? "Borrando..." : <Trash2 className="mr-2 h-4 w-4" />}
                                    Borrar
                                </Button>
                            )}
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuoteForm;