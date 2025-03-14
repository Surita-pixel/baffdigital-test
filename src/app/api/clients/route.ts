import { NextResponse } from "next/server";
import { ClientSchema, ClientValues } from "@/lib/schema";
import { ZodError } from "zod";
import pool, { createClient, fetchClients } from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const clients = await fetchClients(client);
      return NextResponse.json(clients);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    
    const clientId = crypto.randomUUID();
    const clientWithId = { ...body, id: clientId };

    
    const validatedData: ClientValues = ClientSchema.parse(clientWithId);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await createClient(client, validatedData);
      await client.query('COMMIT');

      return NextResponse.json(
        { message: "Client created successfully", client: validatedData },
        { status: 201 }
      );
    } catch (transactionError) {
      await client.query('ROLLBACK');
      console.error("Transaction error creating client:", transactionError);
      return NextResponse.json(
        { error: "Failed to create client", details: (transactionError as Error).message },
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
      console.error("Unexpected error creating client:", error); 
      return NextResponse.json({ error: "Internal server error" }, { status: 500 }); 
    }
  }
}