'use client'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Pencil, Trash2, Eye, Plus, Download } from "lucide-react";
import { useProcedureStore } from "@/lib/state";
import { useEffect, useState } from "react";
import { ProcedureValues } from "@/lib/schema";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import autoTable, { UserOptions } from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: { finalY: number };
}

async function getProcedures() {
    const res = await fetch("/api/procedures");
    return res.json();
}

async function deleteProcedure(id: string) {
    const res = await fetch(`/api/procedures/${id}`, { method: "DELETE" });
    return res.json();
}


const imageToBase64 = (img: HTMLImageElement): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        } else {
            reject(new Error('Could not get canvas context.'));
        }
    });
};

export default function Home() {
    const { procedures, setProcedures, setIsProcedureViewActive } = useProcedureStore();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["procedures"],
        queryFn: getProcedures,
        enabled: useProcedureStore.getState().isProcedureViewActive,
    });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: deleteProcedure,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["procedures"] });
        },
    });

    useEffect(() => {
        setIsProcedureViewActive(true);

        return () => {
            setIsProcedureViewActive(false);
        };
    }, [setIsProcedureViewActive]);

    useEffect(() => {
        if (data) {
            setProcedures(data);
        }
    }, [data, setProcedures]);

    const showSkeleton = isLoading && procedures.length === 0;

    const [logoBase64, setLogoBase64] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await fetch('/logo.png');
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoBase64(reader.result as string);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error("Error fetching logo:", error);
            }
        };

        fetchLogo();
    }, []);

    const generatePdf = async () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;

        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 10, 10, 20, 10);
        } else {
            console.warn("Logo not loaded, using placeholder.");

            doc.text("Logo not available", 10, 20);
        }

        doc.setFontSize(12);
        doc.text('Cliente: Ejemplo Cliente', 10, 30);
        doc.text('Dirección: Ejemplo Dirección', 10, 35);
        doc.text('Fecha: ' + new Date().toLocaleDateString(), 10, 40);

        const tableData = procedures?.map((procedure: ProcedureValues) => {
            const pricesText = procedure.prices.map(price => `${price.type}: $${price.amount}`).join('\n');
            return [
                procedure.pk,
                procedure.title,
                pricesText
            ];
        });

        const tableHeaders = ['ID', 'Título', 'Precios'];

        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: 50,
        });

        const totalProcedures = procedures?.length || 0;

        const finalY = doc.lastAutoTable.finalY || 60;
        doc.setFontSize(14);
        doc.text(`Total Procedimientos: ${totalProcedures}`, 10, finalY + 10);

        doc.save('procedimientos.pdf');
    };


    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-2 sm:mb-0">Procedimientos</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" className="bg-green-500 hover:bg-green-700 text-white">
                        <Link href="/procedures/create" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Crear Nuevo
                        </Link>
                    </Button>
                    <Button variant="secondary" onClick={generatePdf} className="bg-blue-500 hover:bg-blue-700 text-white" disabled={!logoBase64}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            <Table className="w-full mx-4 md:mx-6 lg:mx-8">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] md:w-[150px]">ID</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {showSkeleton ? (
                        <>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                </TableRow>
                            ))}
                        </>
                    ) : (
                        procedures?.map((procedure: ProcedureValues) => (
                            <TableRow key={procedure.id}>
                                <TableCell className="font-medium">{procedure.pk}</TableCell>
                                <TableCell>{procedure.title}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/procedures/${procedure.id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/procedures/edit/${procedure.id}`}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Editar
                                            </Link>
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => mutation.mutate(procedure.id!)} disabled={mutation.isPending}>
                                            {mutation.isPending ? "Eliminando..." : <Trash2 className="h-4 w-4 mr-2" />}
                                            Eliminar
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}