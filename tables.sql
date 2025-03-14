-- Tabla para Clientes
CREATE TABLE Clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Tabla para Procedimientos
CREATE TABLE Procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    PK VARCHAR(255) NOT NULL,
    SK VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Precios
CREATE TABLE Prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_id UUID NOT NULL,
    type VARCHAR(255) NOT NULL,
    amount DECIMAL NOT NULL,
    FOREIGN KEY (procedure_id) REFERENCES Procedures(id) ON DELETE CASCADE
);

-- Tabla para Cotizaciones
CREATE TABLE Quotes (
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