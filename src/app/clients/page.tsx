"use client";

import React, { useEffect } from "react";
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
import { Pencil, Trash2, Eye, Plus } from "lucide-react";
import { ClientValues } from "@/lib/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; 
import { useClientStore } from "@/lib/state";

const getClients = async (): Promise<ClientValues[]> => {
  const res = await fetch("/api/clients");
  if (!res.ok) {
    throw new Error(`Failed to fetch clients: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

const deleteClient = async (id: string): Promise<{ message: string }> => {
  const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete client: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

export default function ClientsPage() {
  const { setClients } = useClientStore(); 
  const queryClient = useQueryClient();

  
  const { data: clients, isLoading, isError, error } = useQuery<ClientValues[], Error>({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  useEffect(() => {
    if (error) {
      toast.error("Error fetching clients", {
        description: error.message,
      });
    }
  }, [error]);

  const mutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deleted");
    },
    onError: (error: any) => {
      toast.error("Error deleting client", {
        description: error.message,
      });
    },
  });

  
  useEffect(() => {
    if (clients) {
      setClients(clients);
    }
  }, [clients, setClients]);

  
  const showSkeleton = isLoading && (!clients || clients.length === 0);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Clientes</h1>
        <Button variant="secondary" className="bg-green-500 hover:bg-green-700 text-white">
          <Link href="/clients/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Nuevo
          </Link>
        </Button>
      </div>

      <Table className="w-full mx-4 md:mx-6 lg:mx-8">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] md:w-[150px]">ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
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
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            clients?.map((client: ClientValues) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.id}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/clients/${client.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/clients/edit/${client.id}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => mutation.mutate(client.id!)} disabled={mutation.isPending}>
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