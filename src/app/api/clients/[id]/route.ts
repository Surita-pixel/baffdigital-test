import { NextResponse } from "next/server";
import { ClientSchema, ClientValues } from "@/lib/schema";
import { ZodError } from "zod";
import pool, { deleteClient, fetchClientById, updateClient } from "@/lib/db";


export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { id } = params;

        
        const clientWithId = { ...body, id };
        const validatedData: ClientValues = ClientSchema.parse(clientWithId);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await updateClient(client, validatedData, id);
            await client.query('COMMIT');

            return NextResponse.json(
                { message: "Client updated successfully", client: validatedData },
                { status: 200 }
            );
        } catch (transactionError) {
            await client.query('ROLLBACK');
            console.error("Transaction error updating client:", transactionError);
            return NextResponse.json(
                { error: "Failed to update client", details: (transactionError as Error).message },
                { status: 500 }
            );
        } finally {
            client.release();
        }

    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors = error.errors.map(err => ({
                message: err.message,
                path: err.path.join('.'),
                code: err.code
            }));
            return NextResponse.json(
                { error: "Invalid data", details: formattedErrors },
                { status: 400 }
            );
        } else {
            console.error("Unexpected error updating client:", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    }
}


export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await deleteClient(client, id);
            await client.query('COMMIT');
            return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 });
        } catch (error) {
            console.error("Error deleting client:", error);
            return NextResponse.json(
                { error: "Failed to delete client", details: (error as Error).message },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error deleting client:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } =await params;

        const client = await pool.connect();
        try {
            const clientData = await fetchClientById(client, id);

            if (!clientData) {
                return NextResponse.json({ error: "Client not found" }, { status: 404 });
            }

            return NextResponse.json(clientData, { status: 200 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching client:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}