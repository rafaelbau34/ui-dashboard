"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FinanceRecord {
  id: number;
  amount: string;
  type: string;
  category: string;
  date: Date;
}

export function FinanceChart({ data }: { data: FinanceRecord[] }) {
  const chartData = useMemo(() => {
    // Group by category for simplicity, or by date
    // Let's group by Category for the bar chart
    const grouped: Record<string, { category: string; income: number; expense: number }> = {};
    
    data.forEach(record => {
      const cat = record.category;
      if (!grouped[cat]) {
        grouped[cat] = { category: cat, income: 0, expense: 0 };
      }
      if (record.type === "income") {
        grouped[cat].income += parseFloat(record.amount);
      } else {
        grouped[cat].expense += parseFloat(record.amount);
      }
    });

    return Object.values(grouped);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs Expense by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="category" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
