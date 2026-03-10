// backend/src/routes/teams.ts

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// ─── GET /api/teams ───────────────────────────────────────────────
// Все команды (для организатора)
router.get('/', authMiddleware, requireRole('ORGANIZER'), async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: { user: { select: { id: true, fullName: true, email: true, status: true } } }
        }
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении команд' });
  }
});

// ─── GET /api/teams/my ────────────────────────────────────────────
// Команда текущего участника
router.get('/my', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const membership = await prisma.teamMember.findFirst({
      where: { userId: req.user!.userId },
      include: {
        team: {
          include: {
            members: {
              include: { user: { select: { id: true, fullName: true, email: true, status: true } } }
            }
          }
        }
      }
    });

    if (!membership) {
      res.json({ team: null });
      return;
    }

    res.json({ team: membership.team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении команды' });
  }
});

// ─── GET /api/teams/users ─────────────────────────────────────────
// Все участники без команды (для формирования командам)
router.get('/users', authMiddleware, requireRole('ORGANIZER'), async (req: Request, res: Response): Promise<void> => {
  try {
    // Находим userId всех кто уже в команде
    const memberships = await prisma.teamMember.findMany({ select: { userId: true } });
    const takenIds = memberships.map((m: { userId: number }) => m.userId);

    const users = await prisma.user.findMany({
      where: {
        role: 'PARTICIPANT',
        id: { notIn: takenIds.length > 0 ? takenIds : [-1] },
      },
      select: { id: true, fullName: true, email: true, city: true, organization: true, status: true },
      orderBy: { fullName: 'asc' },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении участников' });
  }
});

// ─── POST /api/teams ──────────────────────────────────────────────
// Создать команду
router.post('/', authMiddleware, requireRole('ORGANIZER'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Название команды обязательно' });
      return;
    }

    const team = await prisma.team.create({ data: { name: name.trim() } });
    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при создании команды' });
  }
});

// ─── POST /api/teams/:id/members ──────────────────────────────────
// Добавить участника в команду
router.post('/:id/members', authMiddleware, requireRole('ORGANIZER'), async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = parseInt(String(req.params.id));
    const { userId, role } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'userId обязателен' });
      return;
    }

    // Проверяем что команда существует
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      res.status(404).json({ error: 'Команда не найдена' });
      return;
    }

    // Проверяем что участник не в другой команде
    const existing = await prisma.teamMember.findFirst({ where: { userId } });
    if (existing) {
      res.status(409).json({ error: 'Участник уже состоит в команде' });
      return;
    }

    const member = await prisma.teamMember.create({
      data: { teamId, userId, role: role || 'Участник' },
      include: { user: { select: { id: true, fullName: true, email: true, status: true } } }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при добавлении участника' });
  }
});

// ─── DELETE /api/teams/:id/members/:userId ────────────────────────
// Убрать участника из команды
router.delete('/:id/members/:userId', authMiddleware, requireRole('ORGANIZER'), async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = parseInt(String(req.params.id));
    const userId = parseInt(String(req.params.userId));

    await prisma.teamMember.deleteMany({ where: { teamId, userId } });
    res.json({ message: 'Участник удалён из команды' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении участника' });
  }
});

// ─── DELETE /api/teams/:id ────────────────────────────────────────
// Удалить команду
router.delete('/:id', authMiddleware, requireRole('ORGANIZER'), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    await prisma.teamMember.deleteMany({ where: { teamId: id } });
    await prisma.team.delete({ where: { id } });
    res.json({ message: 'Команда удалена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении команды' });
  }
});

export default router;