import { create } from 'zustand';

interface DashboardState {
  // Tasks Filtering
  tasksSearchQuery: string;
  setTasksSearchQuery: (query: string) => void;
  tasksProjectFilter: string[];
  toggleTasksProjectFilter: (project: string) => void;
  setTasksProjectFilter: (projects: string[]) => void;

  // Projects Filtering
  projectsSearchQuery: string;
  setProjectsSearchQuery: (query: string) => void;
  projectStatusFilter: string;
  setProjectStatusFilter: (status: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Tasks Filtering
  tasksSearchQuery: '',
  setTasksSearchQuery: (query) => set({ tasksSearchQuery: query }),
  tasksProjectFilter: [],
  toggleTasksProjectFilter: (project) =>
    set((state) => ({
      tasksProjectFilter: state.tasksProjectFilter.includes(project)
        ? state.tasksProjectFilter.filter((p) => p !== project)
        : [...state.tasksProjectFilter, project],
    })),
  setTasksProjectFilter: (projects) => set({ tasksProjectFilter: projects }),

  // Projects Filtering
  projectsSearchQuery: '',
  setProjectsSearchQuery: (query) => set({ projectsSearchQuery: query }),
  projectStatusFilter: 'all', // "all" | "in_progress" | "completed" | "on_hold"
  setProjectStatusFilter: (status) => set({ projectStatusFilter: status }),
}));
