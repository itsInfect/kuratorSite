// backend/src/routes/auth.ts

import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// ─── POST /api/auth/register ──────────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, phone, city, organization } = req.body;

    // Валидация обязательных полей
    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Email, пароль и ФИО обязательны' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
      return;
    }

    // Проверяем, что email не занят
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Пользователь с таким email уже существует' });
      return;
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone || null,
        city: city || null,
        organization: organization || null,
        role: 'PARTICIPANT',
        status: 'PENDING',
      },
    });

    // Выдаём токен
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' as const }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email и пароль обязательны' });
      return;
    }

    // Ищем пользователя
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }

    // Проверяем пароль
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }

    // Выдаём токен
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' as const }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────
// Возвращает данные текущего пользователя по токену
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        city: true,
        organization: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;

// ─── PATCH /api/auth/password ─────────────────────────────────────
// Смена пароля
router.patch('/password', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Укажите текущий и новый пароль' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Новый пароль должен быть не менее 6 символов' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Текущий пароль неверен' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { passwordHash },
    });

    res.json({ message: 'Пароль успешно изменён' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Ошибка при смене пароля' });
  }
});