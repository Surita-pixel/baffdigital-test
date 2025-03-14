

import { NextResponse } from 'next/server';
import pool, { createQuote, fetchQuotes } from '@/lib/db'; 
import { QuoteSchema, QuoteValues } from '@/lib/schema'; 
export async function GET(request: Request) {
    try {
        const client = await pool.connect();
        try {
            const quotes = await fetchQuotes(client);
            return NextResponse.json(quotes);
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error("Error al obtener las cotizaciones:", error);
        return NextResponse.json({ error: "Error al obtener las cotizaciones", details: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        
        const quoteId = crypto.randomUUID();
        const quoteWithId = { ...body, id: quoteId };

        
        const validatedData: QuoteValues = QuoteSchema.parse(quoteWithId);

        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            await createQuote(client, validatedData);
            await client.query('COMMIT');

            return NextResponse.json(
                { message: "Cotización creada exitosamente", quote: validatedData },
                { status: 201 }
            );
        } catch (transactionError: any) {
            await client.query('ROLLBACK');
            console.error("Transaction error creating quote:", transactionError);
            return NextResponse.json(
                { error: "Failed to create quote", details: transactionError.message },
                { status: 500 }
            );
        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error("Unexpected error creating quote:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}