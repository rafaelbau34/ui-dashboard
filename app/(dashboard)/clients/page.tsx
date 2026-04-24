import { ClientsTable } from "@/components/dashboard/clients-table";
import { getClients } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
      <ClientsTable clients={clients} />
    </main>
  );
}
