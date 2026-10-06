"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getDashboardDocuments,
  getDashboardIndicators,
  getDashboardTasks,
} from "@/services/dashboardService";
import type { DocumentFilters, TaskFilters } from "@/types/dashboard";

export function useDashboardIndicators() {
  return useQuery({
    queryKey: ["dashboard", "indicators"],
    queryFn: getDashboardIndicators,
    staleTime: 30_000,
  });
}

export function useDashboardDocuments(filters: DocumentFilters) {
  return useQuery({
    queryKey: ["dashboard", "documents", filters],
    queryFn: () => getDashboardDocuments(filters),
    staleTime: 30_000,
  });
}

export function useDashboardTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ["dashboard", "tasks", filters],
    queryFn: () => getDashboardTasks(filters),
    staleTime: 30_000,
  });
}
