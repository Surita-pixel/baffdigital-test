import { Pool } from 'pg';
import { PoolClient } from 'pg';
import { ClientValues, PriceSchema, PriceValues, ProcedureValues, QuoteValues } from './schema';
import crypto from 'crypto';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

pool.on('connect', () => {
  console.log('Conexión a la base de datos establecida!');
});

pool.on('error', (err: Error, client: any) => {
  console.error('Error en el pool de conexiones:', err);
});
export const fetchClients = async (client: PoolClient): Promise<ClientValues[]> => {
  try {
      const result = await client.query(`SELECT id, name, email FROM Clients ORDER BY name ASC`);
      return result.rows as ClientValues[];
  } catch (error) {
      console.error("Error fetching clients from the database:", error);
      throw new Error("Failed to fetch clients");
  }
};

export const fetchClientById = async (client: PoolClient, id: string): Promise<ClientValues | null> => {
  try {
      const result = await client.query(`SELECT id, name, email FROM Clients WHERE id = $1`, [id]);

      if (result.rows.length === 0) {
          return null; 
      }

      return result.rows[0] as ClientValues;
  } catch (error) {
      console.error("Error fetching client by ID from the database:", error);
      throw new Error("Failed to fetch client by ID");
  }
};

export const fetchClientByEmail = async (client: PoolClient, email: string): Promise<ClientValues | null> => {
  try {
      const result = await client.query(`SELECT id, name, email FROM Clients WHERE email = $1`, [email]);

      if (result.rows.length === 0) {
          return null; 
      }

      return result.rows[0] as ClientValues;
  } catch (error) {
      console.error("Error fetching client by email from the database:", error);
      throw new Error("Failed to fetch client by email");
  }
};

export const createClient = async (client: PoolClient, validatedData: ClientValues): Promise<void> => {
  try {
      await client.query(
          `INSERT INTO Clients (id, name, email) VALUES ($1, $2, $3)`,
          [validatedData.id, validatedData.name, validatedData.email]
      );
  } catch (error) {
      console.error("Error creating client in the database:", error);
      throw new Error("Failed to create client");
  }
};

export const updateClient = async (client: PoolClient, validatedData: ClientValues, id: string): Promise<void> => {
  try {
      await client.query(
          `UPDATE Clients SET name = $1, email = $2 WHERE id = $3`,
          [validatedData.name, validatedData.email, id]
      );
  } catch (error) {
      console.error("Error updating client in the database:", error);
      throw new Error("Failed to update client");
  }
};

export const deleteClient = async (client: PoolClient, id: string): Promise<void> => {
  try {
      await client.query(`DELETE FROM Clients WHERE id = $1`, [id]);
  } catch (error) {
      console.error("Error deleting client from the database:", error);
      throw new Error("Failed to delete client");
  }
};

export const fetchClientTotal = async (client: PoolClient, id: string): Promise<{ discount: number; procedure_prices: any[]; procedure_id: string | null }> => {
  try {
    const result = await client.query(`
      SELECT 
        c.discount,
        p.id as procedure_id, 
        COALESCE (
          json_agg(json_build_object('id', pr.id, 'type', pr.type, 'amount', pr.amount)) FILTER (WHERE pr.id IS NOT NULL),
          '[]'::json
        ) AS procedure_prices
      FROM Clients c
      LEFT JOIN Procedures p ON c.procedure_id = p.id
      LEFT JOIN Prices pr ON p.id = pr.procedure_id
      WHERE c.id = $1
      GROUP BY c.id, p.id;
    `, [id]);

    if (result.rows.length === 0) {
      throw new Error("Cliente no encontrado");
    }

    return {
      discount: result.rows[0].discount,
      procedure_prices: result.rows[0].procedure_prices || [],
      procedure_id: result.rows[0].procedure_id
    };
  } catch (error) {
    console.error("Error fetching client total:", error);
    throw error; 
  }
};

export const updateProcedure = async (client: PoolClient, validatedData: ProcedureValues, id: string): Promise<ProcedureValues> => {
  try {
    const result = await client.query(
      `UPDATE Procedures SET PK = $1, SK = $2, title = $3, createdAt = $4 WHERE id = $5 RETURNING *`,
      [validatedData.pk, validatedData.sk, validatedData.title, validatedData.createdAt, id]
    );

    if (result.rows.length === 0) {
      throw new Error("Procedimiento no encontrado");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error updating procedure:", error);
    throw error; 
  }
};


export const deleteProcedure = async (client: PoolClient, id: string): Promise<ProcedureValues> => {
  try {
    const result = await client.query(
      `DELETE FROM Procedures WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error("Procedimiento no encontrado");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error deleting procedure:", error);
    throw error; 
  }
};


export const getProcedure = async (client: PoolClient, id: string): Promise<ProcedureValues> => {
  try {
    const result = await client.query(
      `SELECT * FROM Procedures WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error("Procedimiento no encontrado");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error getting procedure:", error);
    throw error; 
  }
};

export const fetchProcedures = async (client: PoolClient): Promise<ProcedureValues[]> => {
  try {
    const result = await client.query(`
      SELECT 
        p.*,
        COALESCE (
          json_agg(json_build_object('id', pr.id, 'type', pr.type, 'amount', pr.amount)) FILTER (WHERE pr.id IS NOT NULL),
          '[]'::json
        ) AS prices
      FROM Procedures p
      LEFT JOIN Prices pr ON p.id = pr.procedure_id
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `);

    return result.rows.map(row => ({
      ...row,
      prices: row.prices || [],
    })) as ProcedureValues[];
  } catch (error) {
    console.error("Error fetching procedures:", error);
    throw new Error("Failed to fetch procedures");
  }
};


export const createProcedure = async (client: PoolClient, validatedData: ProcedureValues): Promise<void> => {
  try {
    await client.query(
      `INSERT INTO Procedures (id, pk, sk, title, createdAt) VALUES ($1, $2, $3, $4, $5)`,
      [validatedData.id, validatedData.pk, validatedData.sk, validatedData.title, validatedData.createdAt]
    );

    if (validatedData.prices && validatedData.prices.length > 0) {
      for (const price of validatedData.prices) {
        const validatedPrice: PriceValues = PriceSchema.parse({ ...price, id: crypto.randomUUID() });
        await client.query(
          `INSERT INTO Prices (id, procedure_id, type, amount) VALUES ($1, $2, $3, $4)`,
          [validatedPrice.id, validatedData.id, validatedPrice.type, validatedPrice.amount]
        );
      }
    }
  } catch (error) {
    console.error("Error creating procedure:", error);
    throw new Error("Failed to create procedure");
  }
};
export const fetchQuotes = async (client: any): Promise<any[]> => {
  try {
      const result = await client.query(`
          SELECT
              q.id,
              q.client_id,
              c.name AS clientName,
              q.discount,
              q.procedure_id,
              p.title AS procedureTitle,
              q.procedure_price_id,
              q.amount,
              q.createdat,
              q.notes
          FROM Quotes q
          INNER JOIN Clients c ON q.client_id = c.id
          INNER JOIN Procedures p ON q.procedure_id = p.id
      `);

      return result.rows.map((row: { amount: any; discount: any; }) => ({
          ...row,
          amount: Number(row.amount),
          discount: Number(row.discount)
      }));
  } catch (error) {
      console.error("Error fetching quotes from the database:", error);
      throw new Error("Failed to fetch quotes");
  }
};


export const createQuote = async (client: PoolClient, validatedData: QuoteValues): Promise<void> => {
  try {
      await client.query(`
          INSERT INTO Quotes (id, client_id, discount, procedure_id, procedure_price_id, amount, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [validatedData.id, validatedData.clientId, validatedData.discount, validatedData.procedureId, validatedData.procedurePrice.id, validatedData.amount, validatedData.notes]);
  } catch (error) {
      console.error("Error creating quote in the database:", error);
      throw new Error("Failed to create quote");
  }
};
export default pool;