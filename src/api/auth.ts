// frontend/src/api/auth.ts

const API_URL = 'http://localhost:3000/api';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'PARTICIPANT' | 'JUDGE' | 'ORGANIZER';
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

export const saveToken = (token: string) => localStorage.setItem('token', token);
export const getToken = (): string | null => localStorage.getItem('token');
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const saveUser = (user: User) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = (): User | null => {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const register = async (data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  city?: string;
  organization?: string;
}): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка регистрации');
  return json;
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка входа');
  return json;
};

export const getMe = async (): Promise<User> => {
  const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка получения профиля');
  return json.user;
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';
};

// Статус на русском
export const statusLabel: Record<string, string> = {
  PENDING: 'На проверке',
  CONFIRMED: 'Подтверждён',
  REJECTED: 'Отклонён',
};

// Инициалы из ФИО
export const getInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
};

// ─── Смена пароля ─────────────────────────────────────────────────
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const res = await fetch(`${API_URL}/auth/password`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка смены пароля');
};