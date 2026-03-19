// frontend/src/api/results.ts

import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api';

export interface JudgeScore {
  judgeId: number;
  judgeName: string;
  total: number;
  criteria: {
    criterion1: number;
    criterion2: number;
    criterion3: number;
    criterion4: number;
    criterion5: number;
  };
  comment: string | null;
  photoProof: string | null;
}

export interface TeamResult {
  teamId: number;
  teamName: string;
  avgScore: number;
  judgeCount: number;
  place: number | null;
  scores: JudgeScore[];
}

export const getResults = async (): Promise<TeamResult[]> => {
  const res = await fetch(`${API_URL}/scores/results`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка получения результатов');
  return json;
};