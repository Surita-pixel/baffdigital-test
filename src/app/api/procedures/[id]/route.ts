import { NextResponse } from "next/server";
import { ProcedureSchema, ProcedureValues } from "@/lib/schema";
import { ZodError } from "zod";
import pool, { deleteProcedure, getProcedure, updateProcedure } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { id } = params;

    const validatedData: ProcedureValues = ProcedureSchema.parse({ id, ...body });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updatedProcedure = await updateProcedure(client, validatedData, id);

      await client.query('COMMIT');

      return NextResponse.json(
        { message: "Procedimiento actualizado", procedure: updatedProcedure },
        { status: 200 }
      );
    } catch (transactionError) {
      await client.query('ROLLBACK');
      console.error("Error en la transacción:", transactionError);
      return NextResponse.json(
        { error: "Error al actualizar procedimiento", details: (transactionError as Error).message },
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
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const client = await pool.connect();
    try {
      const deletedProcedure = await deleteProcedure(client, id);

      return NextResponse.json(
        { message: "Procedimiento eliminado", procedure: deletedProcedure },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error al eliminar procedimiento:", error);
    return NextResponse.json(
      { error: "Error al eliminar procedimiento", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const client = await pool.connect();
    try {
      const procedure = await getProcedure(client, id);

      return NextResponse.json(procedure, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error al obtener procedimiento:", error);
    return NextResponse.json(
      { error: "Error al obtener procedimiento", details: (error as Error).message },
      { status: 500 }
    );
  }
}