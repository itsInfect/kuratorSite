// backend/src/routes/scores.ts

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Multer для фото нарушений
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads/violations');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, _file, cb) => {
    cb(null, `violation-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── POST /api/scores ─────────────────────────────────────────────
// Судья выставляет или обновляет оценку команде
router.post('/', authMiddleware, requireRole('JUDGE'), upload.single('photo'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId, criterion1, criterion2, criterion3, criterion4, criterion5, comment } = req.body;

    if (!teamId) {
      res.status(400).json({ error: 'teamId обязателен' });
      return;
    }

    const team = await prisma.team.findUnique({ where: { id: parseInt(teamId) } });
    if (!team) {
      res.status(404).json({ error: 'Команда не найдена' });
      return;
    }

    const photoProof = req.file ? `/uploads/violations/${req.file.filename}` : undefined;

    // upsert — создаём или обновляем (судья может редактировать свою оценку)
    const score = await prisma.score.upsert({
      where: {
        judgeId_teamId: {
          judgeId: req.user!.userId,
          teamId: parseInt(teamId),
        },
      },
      update: {
        criterion1: parseFloat(criterion1) || 0,
        criterion2: parseFloat(criterion2) || 0,
        criterion3: parseFloat(criterion3) || 0,
        criterion4: parseFloat(criterion4) || 0,
        criterion5: parseFloat(criterion5) || 0,
        comment: comment || null,
        ...(photoProof && { photoProof }),
      },
      create: {
        judgeId: req.user!.userId,
        teamId: parseInt(teamId),
        criterion1: parseFloat(criterion1) || 0,
        criterion2: parseFloat(criterion2) || 0,
        criterion3: parseFloat(criterion3) || 0,
        criterion4: parseFloat(criterion4) || 0,
        criterion5: parseFloat(criterion5) || 0,
        comment: comment || null,
        photoProof: photoProof || null,
      },
    });

    res.json({ message: 'Оценка сохранена', score });
  } catch (error) {
    console.error('Score error:', error);
    res.status(500).json({ error: 'Ошибка при сохранении оценки' });
  }
});

// ─── GET /api/scores/my ───────────────────────────────────────────
// Все оценки текущего судьи
router.get('/my', authMiddleware, requireRole('JUDGE'), async (req: Request, res: Response): Promise<void> => {
  try {
    const scores = await prisma.score.findMany({
      where: { judgeId: req.user!.userId },
      include: { team: { select: { id: true, name: true } } },
    });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении оценок' });
  }
});

// ─── GET /api/scores/teams ────────────────────────────────────────
// Список команд для судьи (с пометкой — оценена или нет)
router.get('/teams', authMiddleware, requireRole('JUDGE'), async (req: Request, res: Response): Promise<void> => {
  try {
    const [teams, myScores] = await Promise.all([
      prisma.team.findMany({ orderBy: { name: 'asc' } }),
      prisma.score.findMany({ where: { judgeId: req.user!.userId }, select: { teamId: true } }),
    ]);

    const scoredTeamIds = new Set(myScores.map((s: { teamId: number }) => s.teamId));

    const result = teams.map(t => ({
      ...t,
      isScored: scoredTeamIds.has(t.id),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении команд' });
  }
});

// ─── GET /api/scores/results ──────────────────────────────────────
// Итоговые результаты — средний балл по всем судьям для каждой команды
router.get('/results', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        scores: {
          include: { judge: { select: { id: true, fullName: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    const results = teams.map(team => {
      const scores = team.scores;
      if (scores.length === 0) {
        return { teamId: team.id, teamName: team.name, avgScore: 0, judgeCount: 0, scores: [] };
      }

      // Сумма всех критериев каждого судьи
      const judgeScores = scores.map(s => ({
        judgeId: s.judgeId,
        judgeName: s.judge.fullName,
        total: s.criterion1 + s.criterion2 + s.criterion3 + s.criterion4 + s.criterion5,
        criteria: {
          criterion1: s.criterion1,
          criterion2: s.criterion2,
          criterion3: s.criterion3,
          criterion4: s.criterion4,
          criterion5: s.criterion5,
        },
        comment: s.comment,
        photoProof: s.photoProof,
      }));

      const avgScore = judgeScores.reduce((sum, s) => sum + s.total, 0) / judgeScores.length;

      return {
        teamId: team.id,
        teamName: team.name,
        avgScore: Math.round(avgScore * 100) / 100,
        judgeCount: judgeScores.length,
        scores: judgeScores,
      };
    });

    // Сортируем по убыванию avgScore и добавляем место
    const sorted = [...results]
      .sort((a, b) => b.avgScore - a.avgScore)
      .map((r, idx) => ({ ...r, place: r.avgScore > 0 ? idx + 1 : null }));

    res.json(sorted);
  } catch (error) {
    console.error('Results error:', error);
    res.status(500).json({ error: 'Ошибка при получении результатов' });
  }
});

export default router;