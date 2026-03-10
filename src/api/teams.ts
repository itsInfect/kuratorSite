// frontend/src/api/teams.ts

import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api';

export interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    status: string;
  };
}

export interface Team {
  id: number;
  name: string;
  members: TeamMember[];
}

export interface ParticipantUser {
  id: number;
  fullName: string;
  email: string;
  city?: string;
  organization?: string;
  status: string;
}

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// Все команды (организатор)
export const getAllTeams = async (): Promise<Team[]> => {
  const res = await fetch(`${API_URL}/teams`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка получения команд');
  return json;
};

// Моя команда (участник)
export const getMyTeam = async (): Promise<Team | null> => {
  const res = await fetch(`${API_URL}/teams/my`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка получения команды');
  return json.team;
};

// Участники без команды
export const getFreeUsers = async (): Promise<ParticipantUser[]> => {
  const res = await fetch(`${API_URL}/teams/users`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка получения участников');
  return json;
};

// Создать команду
export const createTeam = async (name: string): Promise<Team> => {
  const res = await fetch(`${API_URL}/teams`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка создания команды');
  return json;
};

// Добавить участника в команду
export const addMember = async (teamId: number, userId: number, role = 'Участник'): Promise<TeamMember> => {
  const res = await fetch(`${API_URL}/teams/${teamId}/members`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId, role }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка добавления участника');
  return json;
};

// Убрать участника из команды
export const removeMember = async (teamId: number, userId: number): Promise<void> => {
  const res = await fetch(`${API_URL}/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка удаления участника');
};

// Удалить команду
export const deleteTeam = async (teamId: number): Promise<void> => {
  const res = await fetch(`${API_URL}/teams/${teamId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка удаления команды');
};

export const statusLabel: Record<string, string> = {
  PENDING: 'На проверке',
  CONFIRMED: 'Подтверждён',
  REJECTED: 'Отклонён',
};