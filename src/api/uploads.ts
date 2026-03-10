// frontend/src/api/uploads.ts

import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api';

export type UploadType = 'TECH_CARD' | 'DISH_PHOTO' | 'DOCUMENT';

export interface UploadRecord {
  id: number;
  originalName: string;
  type: UploadType;
  dishNumber: number | null;
  url: string;
  size: number;
  createdAt?: string;
}

export interface MyUploads {
  dishes: {
    dishNumber: number;
    techCard: UploadRecord | null;
    photo: UploadRecord | null;
  }[];
  documents: UploadRecord[];
}

// Загрузить файл
export const uploadFile = async (
  file: File,
  type: UploadType,
  dishNumber?: number
): Promise<UploadRecord> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  if (dishNumber !== undefined) {
    formData.append('dishNumber', String(dishNumber));
  }

  const res = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка загрузки');
  return json.upload;
};

// Получить мои файлы
export const getMyUploads = async (): Promise<MyUploads> => {
  const res = await fetch(`${API_URL}/uploads/my`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка получения файлов');
  return json;
};

// Удалить файл
export const deleteUpload = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/uploads/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка удаления');
};

// Читаемый размер файла
export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};