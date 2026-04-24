"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface ReportsChartsProps {
  projects: any[];
}

const COLORS = ["#10b981", "#f59e0b", "#3b82f6"]; // Completed, On Hold, In Progress

export function ReportsCharts({ projects }: ReportsChartsProps) {
  const { statusData, velocityData } = useMemo(() => {
    let completed = 0, onHold = 0, inProgress = 0;
    
    // For velocity, we'll just plot each project's completed vs total
    const velocity = projects.map(p => ({
      name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
      completed: p.completedTasks,
      remaining: p.totalTasks - p.completedTasks
    }));

    projects.forEach((p) => {
      if (p.status === "completed") completed++;
      else if (p.status === "on_hold") onHold++;
      else inProgress++;
    });

    return {
      statusData: [
        { name: "Completed", value: completed },
        { name: "On Hold", value: onHold },
        { name: "In Progress", value: inProgress },
      ],
      velocityData: velocity
    };
  }, [projects]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Projects by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Completion Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip cursor={{ fill: 'var(--muted)' }} />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                <Bar dataKey="remaining" stackId="a" fill="#e2e8f0" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
