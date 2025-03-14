import { Link } from "lucide-react";

export const Header = () => (
  <header className="bg-white shadow-md py-4">
    <div className="container mx-auto flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Baff Digital</h1>
      <nav>
        <Link href="/clients" className="mr-4 hover:text-blue-500">
          Clients
        </Link>
        <Link href="/procedures" className="hover:text-blue-500">
          Procedures
        </Link>
        <Link href="/quotes" className="hover:text-blue-500">
          Quotes
        </Link>
      </nav>
    </div>
  </header>
);