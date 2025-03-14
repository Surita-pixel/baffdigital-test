# Baff Digital Dashboard

Este proyecto es un dashboard desarrollado como parte de una prueba técnica. Implementa la gestión de **procedimientos, cotizaciones y clientes**, permitiendo la administración eficiente de datos y la generación de reportes en PDF.

## 🚀 Tecnologías Utilizadas
- **Next.js** - Framework de React para aplicaciones web modernas.
- **PostgreSQL** - Base de datos relacional utilizada para el almacenamiento de datos.
- **Zustand** - Librería para la gestión del estado global.
- **Supabase** - Backend utilizado para la gestión de la base de datos y autenticación.

## 📌 Características Principales
- **Gestión de Procedimientos:**  
  - Registro y administración de procedimientos con detalles y precios.
- **Gestión de Clientes:**  
  - Creación de clientes con nombre y apellido.
- **Generación de Cotizaciones:**  
  - Creación de cotizaciones asociadas a clientes y procedimientos.
  - Consulta de cotizaciones desde el estado global o la API.
- **Generación de PDF:**  
  - Opción para exportar en PDF la información de los procedimientos.

## 🛠 Instalación y Configuración
### 1️⃣ Clonar el Repositorio
```bash
git clone https://github.com/Surita-pixel/baffdigital-test
cd baffdigital-test
```

### 2️⃣ Configurar Variables de Entorno
El proyecto utiliza **PostgreSQL** como base de datos, por lo que necesitas configurar las variables de entorno.

- Crea un archivo **`.env`** en la raíz del proyecto y agrega lo siguiente:

```env
DB_USER=postgres
DB_PASSWORD=tucontraseña
DB_HOST=localhost
DB_NAME=baffdigital
DB_PORT=5432
```

### 3️⃣ Instalar Dependencias
Ejecuta el siguiente comando para instalar las dependencias del proyecto:
```bash
npm install
```

### 4️⃣ Ejecutar el Proyecto en Desarrollo
Para iniciar el servidor de desarrollo de Next.js, usa:
```bash
npm run dev
```
Luego, abre tu navegador y visita:
👉 `http://localhost:3000`