import { getFinanceData, getProjects } from "@/lib/db/queries";
import { FinanceChart } from "@/components/dashboard/finance-chart";

export const dynamic = "force-dynamic";

function groupByMonth(data: any[]) {
  const months: Record<string, { revenue: number; expenses: number }> = {};

  data.forEach((item) => {
    const date = new Date(item.date);
    const key = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!months[key]) {
      months[key] = { revenue: 0, expenses: 0 };
    }

    if (item.type === "expense") {
      months[key].expenses += Number(item.amount);
    }
  });

  return months;
}

export default async function FinancePage() {
  const financeData = await getFinanceData();
  const projects = await getProjects();

  // 🔥 REVENUE = valor de proyectos
  const revenue =
    projects?.reduce(
      (acc: number, p: any) => acc + Number(p.totalBudget || 0),
      0
    ) ?? 0;

  // 🔥 EXPENSES = tabla finance
  const expenses =
    financeData?.reduce(
      (acc: number, item: any) =>
        acc + (item.type === "expense" ? Number(item.amount) : 0),
      0
    ) ?? 0;

  const profit = revenue - expenses;

  const transactions = financeData?.length ?? 0;

  // 🔥 gastos por categoría
  const expensesByCategory =
    financeData?.reduce((acc: any, item: any) => {
      if (item.type === "expense") {
        acc[item.category] =
          (acc[item.category] || 0) + Number(item.amount);
      }
      return acc;
    }, {}) ?? {};

  // 🔥 growth
  const growth = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>

      {/* 💰 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-zinc-400">Revenue (Projects)</p>
          <h2 className="text-2xl font-bold">${revenue}</h2>
        </div>

        <div className="bg-zinc-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-zinc-400">Expenses</p>
          <h2 className="text-2xl font-bold">${expenses}</h2>
        </div>

        <div className="bg-zinc-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-zinc-400">Profit</p>
          <h2
            className={`text-2xl font-bold ${
              profit >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            ${profit}
          </h2>
        </div>

        <div className="bg-zinc-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-zinc-400">Growth</p>
          <h2 className="text-2xl font-bold text-blue-500">
            {growth}%
          </h2>
        </div>
      </div>

      {/* 📊 Chart (gastos) */}
      <div className="bg-zinc-900 p-5 rounded-2xl shadow">
        <FinanceChart data={financeData} />
      </div>

      {/* 🧾 Gastos por categoría */}
      <div className="bg-zinc-900 p-5 rounded-2xl shadow">
        <h2 className="font-semibold mb-3">Expenses by Category</h2>

        {Object.keys(expensesByCategory).length === 0 ? (
          <p className="text-sm text-zinc-400">
            No expense data available
          </p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(expensesByCategory).map(
              ([category, value]: any) => (
                <li
                  key={category}
                  className="flex justify-between text-sm"
                >
                  <span className="text-zinc-400">{category}</span>
                  <span className="font-medium text-red-400">
                    ${value}
                  </span>
                </li>
              )
            )}
          </ul>
        )}
      </div>

      {/* 🧾 Últimas transacciones */}
      <div className="bg-zinc-900 p-5 rounded-2xl shadow">
        <h2 className="font-semibold mb-3">Recent Expenses</h2>

        <ul className="space-y-2">
          {financeData.slice(0, 5).map((item: any) => (
            <li
              key={item.id}
              className="flex justify-between text-sm border-b border-zinc-800 pb-1"
            >
              <span className="text-zinc-400">
                {item.category}
              </span>
              <span className="text-red-400">
                -${Number(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}