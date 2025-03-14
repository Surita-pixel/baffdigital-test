import { NextResponse } from "next/server";
import { PriceSchema, PriceValues, ProcedureSchema, ProcedureValues } from "@/lib/schema";
import { ZodError } from "zod";
import pool, { createProcedure, fetchProcedures } from "@/lib/db";
export async function GET() {
    try {
      const client = await pool.connect();
      try {
        const procedures = await fetchProcedures(client);
        return NextResponse.json(procedures);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error al obtener procedimientos:", error);
      return NextResponse.json({ error: "Error al obtener procedimientos" }, { status: 500 });
    }
  }
  
  export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      const procedureId = crypto.randomUUID();
  
      
      const pk = `PROCEDURE#${procedureId}`;
  
      const procedureWithId = {
        id: procedureId,
        pk: pk, 
        sk: "DETAILS",
        createdAt: new Date().toISOString(),
        title: body.title,
        prices: body.prices
      };
  
      const validatedData: ProcedureValues = ProcedureSchema.parse(procedureWithId);
  
      const client = await pool.connect();
  
      try {
        await client.query('BEGIN');
        await createProcedure(client, validatedData);
        await client.query('COMMIT');
  
        return NextResponse.json(
          { message: "Procedimiento creado", procedure: validatedData },
          { status: 201 }
        );
      } catch (transactionError) {
        await client.query('ROLLBACK');
        console.error("Error en la transacción:", transactionError);
        return NextResponse.json(
          { error: "Error al crear procedimiento", details: (transactionError as Error).message },
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
          { error: "Datos inválidos", details: formattedErrors },
          { status: 400 }
        );
      } else if (error instanceof Error) {
        console.error("Error general:", error);
        return NextResponse.json(
          { error: "Datos inválidos", details: error.message },
          { status: 400 }
        );
      }
      console.error("Error inesperado:", error);
      return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
    }
  }