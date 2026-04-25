"use client";

import { useMemo, useState, useTransition } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectForm } from "./forms/project-form";
import { deleteProject } from "@/lib/actions/project.actions";
import { MoreHorizontal, Edit, Trash, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  addTask,
  deleteTask,
  toggleTaskStatus,
  updateTask,
} from "@/lib/actions/task.actions";
import { Check, Pencil, Trash2 } from "lucide-react";
import {
  Search,
  Filter,
  Folder,
  LayoutGrid,
  Database,
  Megaphone,
  Wallet,
  Circle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export type ProjectStatus = "in_progress" | "completed" | "on_hold";

export interface Project {
  id: string;
  name: string;
  color: string;
  status: ProjectStatus;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  dueDate: string;
  dueDateAt?: string | Date | null;
  clientName?: string | null;
  clientId?: number | null;
  totalBudget?: number | null;
  category?: string | null;
}
export interface ClientOption {
  id: number;
  name: string;
}

export interface TaskRow {
  id: number;
  name: string;
  dueDate: string;
  isCompleted: boolean;
  projectId: number | null;
}
import { useDashboardStore } from "@/store/dashboard-store";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === "in_progress") {
    return (
      <div className="flex items-center gap-1.5">
        <Circle className="size-3.5 fill-cyan-500 text-cyan-500" />
        <span className="text-sm text-cyan-600 dark:text-cyan-400">
          In Progress
        </span>
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="size-3.5 text-emerald-500" />
        <span className="text-sm text-emerald-600 dark:text-emerald-400">
          Completed
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <Clock className="size-3.5 text-amber-500" />
      <span className="text-sm text-amber-600 dark:text-amber-400">
        On Hold
      </span>
    </div>
  );
}

const projectIconMap: Record<string, { icon: LucideIcon; iconColor: string }> =
  {
    blue: { icon: Folder, iconColor: "text-blue-500" },
    violet: { icon: LayoutGrid, iconColor: "text-violet-500" },
    cyan: { icon: Database, iconColor: "text-cyan-500" },
    pink: { icon: Megaphone, iconColor: "text-pink-500" },
    amber: { icon: Wallet, iconColor: "text-amber-500" },
  };

export function ProjectsTable({
  projects,
  clients,
}: {
  projects: Project[];
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [isRefreshing, startRefreshing] = useTransition();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<TaskRow[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(
    new Date(),
  );
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskName, setEditingTaskName] = useState("");

  const {
    projectsSearchQuery,
    setProjectsSearchQuery,
    projectStatusFilter,
    setProjectStatusFilter,
  } = useDashboardStore();

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Project Name",
        cell: ({ row }) => {
          const p = row.original;
          const { icon: Icon, iconColor } =
            projectIconMap[p.color] ?? projectIconMap.blue;
          return (
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Icon className={cn("size-4 shrink-0", iconColor)} />
              {p.name}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-[100px]">
            <Progress value={row.original.progress} className="h-2 flex-1" />
            <span className="text-sm tabular-nums w-8">
              {row.original.progress}%
            </span>
          </div>
        ),
      },
      {
        id: "tasks",
        header: "Total Tasks",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <span className="text-sm text-muted-foreground">
              {p.completedTasks}/{p.totalTasks}
            </span>
          );
        },
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {(row.original.dueDate ?? "").split("T")[0]}
          </span>
        ),
      },
      {
        accessorKey: "clientName",
        header: "Client",
        cell: ({ row }) => {
          return (
            <span className="text-sm text-muted-foreground">
              {row.original.clientName ?? "Unknown"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingProject(p);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={async () => {
                    if (
                      confirm("Are you sure you want to delete this project?")
                    ) {
                      await deleteProject(parseInt(p.id.replace("p", "")));
                      startRefreshing(() => router.refresh());
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    let result = projects;
    if (projectsSearchQuery.trim()) {
      const q = projectsSearchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.clientName ?? "").toLowerCase().includes(q),
      );
    }
    if (projectStatusFilter !== "all") {
      result = result.filter((p) => p.status === projectStatusFilter);
    }
    return result;
  }, [projects, projectsSearchQuery, projectStatusFilter]);

  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const hasActiveFilters = projectStatusFilter !== "all";
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const totalRows = filteredData.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b">
        <h3 className="font-medium text-base">List Projects</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setEditingProject(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search here..."
              value={projectsSearchQuery}
              onChange={(e) => setProjectsSearchQuery(e.target.value)}
              className="pl-8 h-9 w-full sm:w-[200px] text-sm bg-muted/50"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Filter className="size-4" />
                Filter
                {hasActiveFilters && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuCheckboxItem
                checked={projectStatusFilter === "all"}
                onCheckedChange={() => setProjectStatusFilter("all")}
              >
                All statuses
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={projectStatusFilter === "in_progress"}
                onCheckedChange={() => setProjectStatusFilter("in_progress")}
              >
                In Progress
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={projectStatusFilter === "completed"}
                onCheckedChange={() => setProjectStatusFilter("completed")}
              >
                Completed
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={projectStatusFilter === "on_hold"}
                onCheckedChange={() => setProjectStatusFilter("on_hold")}
              >
                On Hold
              </DropdownMenuCheckboxItem>
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setProjectStatusFilter("all")}
                  >
                    Clear filter
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={async (e) => {
                    // Don't hijack clicks on checkboxes / action menu.
                    const target = e.target as HTMLElement;
                    if (target.closest("button, a, [role='menuitem'], input"))
                      return;

                    const p = row.original;
                    setActiveProject(p);
                    setIsSheetOpen(true);

                    // Lazy-fetch tasks via a lightweight endpoint implemented through Next route (below).
                    const projectId = parseInt(p.id.replace("p", ""));
                    const res = await fetch(
                      `/api/projects/${projectId}/tasks`,
                      { cache: "no-store" },
                    );
                    if (res.ok) {
                      const json = (await res.json()) as { tasks: TaskRow[] };
                      setProjectTasks(json.tasks);
                    } else {
                      setProjectTasks([]);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {totalRows === 0
              ? "0 projects"
              : `Showing ${from} to ${to} of ${totalRows} projects`}
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-2 text-sm tabular-nums">
            {pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "New Project"}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            clients={clients}
            project={
              editingProject
                ? {
                    id: parseInt(editingProject.id.replace("p", "")),
                    name: editingProject.name,
                    color: editingProject.color as any,
                    status: editingProject.status,
                    progress: editingProject.progress,
                    totalTasks: editingProject.totalTasks,
                    completedTasks: editingProject.completedTasks,
                    dueDate: editingProject.dueDateAt
                      ? new Date(editingProject.dueDateAt as any)
                      : new Date(editingProject.dueDate),
                    ownerId: 1, // Simplified
                    clientId: editingProject.clientId ?? 1, // Simplified
                    totalBudget: Number(editingProject.totalBudget ?? 0),
                    category: editingProject.category ?? "Development",
                  }
                : undefined
            }
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {activeProject ? `Project: ${activeProject.name}` : "Project"}
            </SheetTitle>
          </SheetHeader>

          {activeProject && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add task..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (async () => {
                        const projectId = parseInt(
                          activeProject.id.replace("p", ""),
                        );
                        const dueDate = activeProject.dueDate;
                        await addTask({
                          name: newTaskName,
                          projectId,
                          dueDate,
                        });
                        setNewTaskName("");
                        const res = await fetch(
                          `/api/projects/${projectId}/tasks`,
                          { cache: "no-store" },
                        );
                        if (res.ok) setProjectTasks((await res.json()).tasks);
                      })();
                    }
                  }}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[130px] justify-start text-left font-normal shrink-0",
                        !newTaskDueDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTaskDueDate ? (
                        format(newTaskDueDate, "dd/MM/yy")
                      ) : (
                        <span>Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={newTaskDueDate}
                      onSelect={(d) => d && setNewTaskDueDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={async () => {
                    if (!newTaskName.trim() || !newTaskDueDate) return;
                    const projectId = parseInt(
                      activeProject.id.replace("p", ""),
                    );
                    await addTask({
                      name: newTaskName,
                      projectId,
                      dueDate: newTaskDueDate.toISOString(), // Use the specific task date
                    });
                    setNewTaskName("");
                    const res = await fetch(
                      `/api/projects/${projectId}/tasks`,
                      { cache: "no-store" },
                    );
                    if (res.ok) setProjectTasks((await res.json()).tasks);
                    startRefreshing(() => router.refresh());
                  }}
                >
                  Add
                </Button>
              </div>

              <div className="divide-y rounded-lg border">
                {projectTasks.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No tasks yet.
                  </div>
                ) : (
                  projectTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 p-3">
                      <Checkbox
                        checked={t.isCompleted}
                        onCheckedChange={async (checked) => {
                          await toggleTaskStatus(t.id, !!checked);
                          setProjectTasks((prev) =>
                            prev.map((x) =>
                              x.id === t.id
                                ? { ...x, isCompleted: !!checked }
                                : x,
                            ),
                          );
                          startRefreshing(() => router.refresh());
                        }}
                      />

                      {editingTaskId === t.id ? (
                        <Input
                          value={editingTaskName}
                          onChange={(e) => setEditingTaskName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              (async () => {
                                await updateTask(t.id, {
                                  name: editingTaskName,
                                });
                                setProjectTasks((prev) =>
                                  prev.map((x) =>
                                    x.id === t.id
                                      ? { ...x, name: editingTaskName }
                                      : x,
                                  ),
                                );
                                setEditingTaskId(null);
                                setEditingTaskName("");
                              })();
                            }
                          }}
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              t.isCompleted && "line-through opacity-60",
                            )}
                          >
                            {t.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {t.dueDate
                              ? format(new Date(t.dueDate), "MMM d, yyyy")
                              : "No date"}
                          </span>
                        </div>
                      )}

                      <div className="ml-auto flex items-center gap-1">
                        {editingTaskId === t.id ? (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={async () => {
                              await updateTask(t.id, { name: editingTaskName });
                              setProjectTasks((prev) =>
                                prev.map((x) =>
                                  x.id === t.id
                                    ? { ...x, name: editingTaskName }
                                    : x,
                                ),
                              );
                              setEditingTaskId(null);
                              setEditingTaskName("");
                              startRefreshing(() => router.refresh());
                            }}
                            aria-label="Save task"
                          >
                            <Check />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setEditingTaskId(t.id);
                              setEditingTaskName(t.name);
                            }}
                            aria-label="Edit task"
                          >
                            <Pencil />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-red-600 hover:text-red-600"
                          onClick={async () => {
                            if (!confirm("Delete this task?")) return;
                            await deleteTask(t.id);
                            setProjectTasks((prev) =>
                              prev.filter((x) => x.id !== t.id),
                            );
                            startRefreshing(() => router.refresh());
                          }}
                          aria-label="Delete task"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
