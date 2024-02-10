"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useInstanceStatus = ({
  id,
  active = false,
}: {
  id: string;
  active: boolean;
}) => {
  return useQuery({
    queryKey: ["instance-status", id],
    queryFn: async () =>
      (await axios.get(`/api/v1/channels/${id}/status`)).data,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 5,
    enabled: active,
    staleTime: 0,
    cacheTime: 0,
    retry: 3,
  });
};
