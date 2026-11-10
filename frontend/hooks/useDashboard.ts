"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getDashboardDocuments,
  getDashboardIndicators,
  getDashboardTasks,
} from "@/services/dashboardService";
import { queryKeys } from "@/lib/queryKeys";
import type { DocumentFilters, TaskFilters } from "@/types/domain";

export function useDashboardIndicators() {
  return useQuery({
    queryKey: queryKeys.dashboard.indicators,
    queryFn: getDashboardIndicators,
    staleTime: 30_000,
  });
}

export function useDashboardDocuments(filters: DocumentFilters) {
  return useQuery({
    queryKey: queryKeys.dashboard.documents(filters),
    queryFn: () => getDashboardDocuments(filters),
    staleTime: 30_000,
  });
}

export function useDashboardTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.dashboard.tasks(filters),
    queryFn: () => getDashboardTasks(filters),
    staleTime: 30_000,
  });
}
