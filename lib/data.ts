export interface User {
  id: string;
  telegram_id: string;
  full_name: string;
  roles: ('coach' | 'client')[];
  activeRole: 'coach' | 'client';
}

export interface Client {
  id: string;
  telegram_id: string;
  full_name: string;
}

export interface Workout {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  time_start: string; // HH:MM
  duration_minutes: number;
  rounds?: number;
  exerciseIds: string[];
}

export interface Progress {
  workoutId: string;
  exerciseId: string;
  round: number;
  weight?: number;
  reps?: number;
}

export const users: Record<string, User> = {};
export const tokens: Record<string, string> = {};
export const telegramUserMap: Record<string, string> = {};
export const clients: Record<string, Client> = {};
export const workouts: Record<string, Workout> = {};
export const progress: Progress[] = [];
export const activeRoles: Record<string, 'coach' | 'client'> = {};
