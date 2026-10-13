"use client";

import { useMutation } from "@tanstack/react-query";

import { buscarCep } from "@/services/cepService";

export function useBuscarCep() {
  return useMutation({ mutationFn: buscarCep });
}
