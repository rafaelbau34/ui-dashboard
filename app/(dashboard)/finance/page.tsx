import { getFinanceData } from "@/lib/db/queries";
import { FinanceChart } from "@/components/dashboard/finance-chart";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const financeData = await getFinanceData();

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
      <FinanceChart data={financeData} />
    </main>
  );
}
