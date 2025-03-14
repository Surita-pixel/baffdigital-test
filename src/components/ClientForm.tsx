"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { ClientValues, ClientSchema } from "@/lib/schema";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

interface ClientFormProps {
    initialValues?: ClientValues;
    onSubmit: SubmitHandler<ClientValues>;
    onDelete?: () => void;
    isCreate?: boolean;
    isLoading: boolean;
    isError: boolean;
    mutationPending: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
    initialValues,
    onSubmit,
    onDelete,
    isCreate = false,
    isLoading,
    isError,
    mutationPending,
}) => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitSuccessful },
    } = useForm<ClientValues>({
        defaultValues: {
            name: "",
            email: "",
        },
        mode: "onChange",
        resolver: zodResolver(ClientSchema),
    });

    useEffect(() => {
        if (initialValues) {
            reset(initialValues);
        }
    }, [initialValues, reset]);

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
                        {isCreate ? "Crear Cliente" : "Editar Cliente"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nombre:</Label>
                            <Input type="text" id="name" {...register("name")} />
                            {errors.name && <p className="text-red-500">{errors.name?.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email:</Label>
                            <Input type="email" id="email" {...register("email")} />
                            {errors.email && <p className="text-red-500">{errors.email?.message}</p>}
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

                        {isError && <div className="text-red-500">Error al guardar.</div>}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientForm;