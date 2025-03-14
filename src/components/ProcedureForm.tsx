
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form"; 
import { ProcedureValues, ProcedureSchema, PriceSchema } from "@/lib/schema";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ProcedureFormProps {
    initialValues?: ProcedureValues;
    onSubmit: SubmitHandler<ProcedureValues>;
    onDelete?: () => void;
    isCreate?: boolean;
    isLoading: boolean;
    isError: boolean;
    mutationPending: boolean;
}

const ProcedureForm: React.FC<ProcedureFormProps> = ({
    initialValues,
    onSubmit,
    onDelete,
    isCreate = false,
    isLoading,
    isError,
    mutationPending
}) => {
    console.log("mutationPending:", mutationPending); 
    console.log("isLoading:", isLoading); 
    const router = useRouter();

    const {
        register,
        control, 
        handleSubmit,
        reset,
        formState: { isSubmitSuccessful, errors },
    } = useForm<ProcedureValues>({
        defaultValues: initialValues || {
            pk: "",
            sk: "DETAILS",
            title: "",
            prices: [],
            createdAt: new Date().toISOString(),
        },
        mode: "onChange",
        resolver: zodResolver(ProcedureSchema),
    });
    console.log("Form errors:", errors); 
    
    const { fields, append, remove } = useFieldArray({
        control,
        name: "prices"
    });

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset(initialValues || {
                pk: "",
                sk: "DETAILS",
                title: "",
                prices: [],
                createdAt: new Date().toISOString(),
            })
        }
    }, [isSubmitSuccessful, reset, initialValues])

    return (
        <div className="container py-4">
            <div className="mb-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{isCreate ? "Crear Procedimiento" : "Editar Procedimiento"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Título:</Label>
                            <Input
                                type="text"
                                id="title"
                                {...register("title")}
                            />
                            {errors.title && (
                                <p className="text-red-500">{errors.title?.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="createdAt">Fecha de Creación:</Label>
                            <Input
                                type="date-local"
                                id="createdAt"
                                {...register("createdAt")}
                            />
                            {errors.createdAt && (
                                <p className="text-red-500">{errors.createdAt?.message}</p>
                            )}
                        </div>

                        <div>
                            <Label>Precios:</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex space-x-2 mb-2">
                                    <div>
                                        <Label htmlFor={`prices.${index}.type`}>Tipo:</Label>
                                        <Input
                                            type="text"
                                            id={`prices.${index}.type`}
                                            {...register(`prices.${index}.type`)}
                                        />
                                        {errors.prices?.[index]?.type && (
                                            <p className="text-red-500">
                                                {(errors.prices?.[index]?.type as { message: string })?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor={`prices.${index}.amount`}>Precio:</Label>
                                        <Input
                                            type="number"
                                            id={`prices.${index}.amount`}
                                            {...register(`prices.${index}.amount`, { valueAsNumber: true })}
                                        />
                                        {errors.prices?.[index]?.amount && (
                                            <p className="text-red-500">
                                                {errors.prices[index].amount?.message}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                onClick={() => append({ type: "", amount: 0 })}
                            >
                                Añadir Precio
                            </Button>
                        </div>

                        <div className="flex justify-between">
                            <Button type="submit" disabled={mutationPending || isLoading}>
                                {mutationPending ? "Guardando..." : "Guardar"}
                            </Button>
                            {onDelete && !isCreate && (
                                <Button
                                    variant="destructive"
                                    type="button"
                                    onClick={onDelete}
                                    disabled={mutationPending || isLoading}
                                >
                                    {mutationPending ? "Borrando..." : <Trash2 className="mr-2 h-4 w-4" />}
                                    Borrar
                                </Button>
                            )}
                        </div>

                        {isError && (
                            <div className="text-red-500">Error al guardar.</div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProcedureForm;