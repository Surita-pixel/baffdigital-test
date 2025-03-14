import pool  from "./db";

const TABLES: { [key: string]: string } = {
  clients: `
    CREATE TABLE IF NOT EXISTS Clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE
    );
  `,
  procedures: `
    CREATE TABLE IF NOT EXISTS Procedures (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      PK VARCHAR(255) NOT NULL,
      SK VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  prices: `
    CREATE TABLE IF NOT EXISTS Prices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      procedure_id UUID NOT NULL,
      type VARCHAR(255) NOT NULL,
      amount DECIMAL NOT NULL,
      FOREIGN KEY (procedure_id) REFERENCES Procedures(id) ON DELETE CASCADE
    );
  `,
  quotes: `
    CREATE TABLE IF NOT EXISTS Quotes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL,
      discount DECIMAL NOT NULL,
      procedure_id UUID NOT NULL,
      procedure_price_id UUID NOT NULL,
      amount DECIMAL NOT NULL,
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (client_id) REFERENCES Clients(id),
      FOREIGN KEY (procedure_id) REFERENCES Procedures(id),
      FOREIGN KEY (procedure_price_id) REFERENCES Prices(id)
    );
  `,
};

export const setupDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log("🔍 Verificando y creando tablas si no existen...");
    for (const [tableName, query] of Object.entries(TABLES)) {
      await client.query(query);
      console.log(`✅ Tabla ${tableName} lista.`);
    }
  } catch (error) {
    console.error("⚠️ Error en la configuración de la base de datos:", error);
  } finally {
    client.release();
  }
};
