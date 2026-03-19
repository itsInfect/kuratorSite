// frontend/src/api/scores.ts

import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api';

export interface TeamForJudge {
  id: number;
  name: string;
  isScored: boolean;
}

export interface ScoreData {
  teamId: number;
  criterion1: number;
  criterion2: number;
  criterion3: number;
  criterion4: number;
  criterion5: number;
  comment?: string;
  photo?: File;
}

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Получить список команд с пометкой оценена/нет
export const getTeamsForJudge = async (): Promise<TeamForJudge[]> => {
  const res = await fetch(`${API_URL}/scores/teams`, {
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка получения команд');
  return json;
};

// Получить свои оценки
export const getMyScores = async () => {
  const res = await fetch(`${API_URL}/scores/my`, {
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка получения оценок');
  return json;
};

// Отправить оценку (с опциональным фото)
export const submitScore = async (data: ScoreData): Promise<void> => {
  const formData = new FormData();
  formData.append('teamId', String(data.teamId));
  formData.append('criterion1', String(data.criterion1));
  formData.append('criterion2', String(data.criterion2));
  formData.append('criterion3', String(data.criterion3));
  formData.append('criterion4', String(data.criterion4));
  formData.append('criterion5', String(data.criterion5));
  if (data.comment) formData.append('comment', data.comment);
  if (data.photo) formData.append('photo', data.photo);

  const res = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка сохранения оценки');
};