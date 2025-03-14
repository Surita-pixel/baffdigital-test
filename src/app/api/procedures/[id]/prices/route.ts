import { NextResponse } from 'next/server';
import { PoolClient } from 'pg';
import pool from '@/lib/db';
import { PriceSchema, PriceValues } from '@/lib/schema';
import { z } from "zod";

const RequestBodySchema = z.object({
    procedureId: z.string().uuid(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {

        params = await params;
        console.log(params)
        const procedureId = params.id;
        if (!procedureId) {
            return NextResponse.json({ error: "Procedure ID is required" }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const prices = await fetchPrices(client, procedureId);
            return NextResponse.json(prices);
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error("Error al obtener precios:", error);
        return NextResponse.json({ error: "Error al obtener precios", details: error.message }, { status: 500 });
    }
}

const fetchPrices = async (client: PoolClient, procedureId: string): Promise<PriceValues[]> => {
    try {
        const result = await client.query(
            `SELECT id, type, amount FROM Prices WHERE procedure_id = $1`,
            [procedureId]
        );

        
        const processedRows = result.rows.map(row => ({
            ...row,
            amount: Number(row.amount), 
        }));

        const validatedPrices = processedRows.map(row => PriceSchema.parse(row));
        return validatedPrices as PriceValues[];
    } catch (error: any) {
        console.error("Error fetching prices from the database:", error);
        throw new Error(`Error fetching prices from database: ${error.message}`);
    }
};