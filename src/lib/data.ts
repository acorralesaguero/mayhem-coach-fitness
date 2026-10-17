import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { dateKey } from "./progress";
export function profileOptions(id: string) {
  return queryOptions({
    queryKey: ["profile", id],
    staleTime: 60000,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
}
export function weekOptions(id: string) {
  return queryOptions({
    queryKey: ["week", id],
    staleTime: 60000,
    queryFn: async () => {
      const { data, error } = await supabase.from("week_plan").select("*").eq("user_id", id);
      if (error) throw error;
      return data;
    },
  });
}
export function workoutOptions(id: string) {
  return queryOptions({
    queryKey: ["workouts", id],
    staleTime: 60000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", id)
        .gte("workout_date", dateKey(new Date(Date.now() - 56 * 86400000)))
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
export function checkinOptions(id: string) {
  return queryOptions({
    queryKey: ["checkins", id],
    staleTime: 60000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}
export function useProfile() {
  const { user } = useAuth();
  return useQuery({ ...profileOptions(user?.id ?? ""), enabled: !!user });
}
export function useWeekPlan() {
  const { user } = useAuth();
  return useQuery({ ...weekOptions(user?.id ?? ""), enabled: !!user });
}
export function useWorkouts() {
  const { user } = useAuth();
  return useQuery({ ...workoutOptions(user?.id ?? ""), enabled: !!user });
}
export function useCheckins() {
  const { user } = useAuth();
  return useQuery({ ...checkinOptions(user?.id ?? ""), enabled: !!user });
}
export function useTodayWorkout() {
  const q = useWorkouts();
  return { ...q, data: q.data?.find((w) => w.workout_date === dateKey(new Date())) ?? null };
}
export function useRefresh() {
  const client = useQueryClient();
  return async () => {
    await client.invalidateQueries();
  };
}
