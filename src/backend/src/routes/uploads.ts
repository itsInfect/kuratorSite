// backend/src/routes/uploads.ts

import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

import { authMiddleware } from '../middleware/authMiddleware';

type UploadRow = Awaited<ReturnType<typeof prisma.upload.findFirst>> & {};

const router = Router();
const prisma = new PrismaClient();

// ─── Настройка Multer ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый формат файла. Разрешены: PDF, DOC, DOCX, JPG, PNG'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ─── POST /api/uploads ────────────────────────────────────────────
router.post('/', authMiddleware, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Файл не был загружен' });
      return;
    }

    const { type, dishNumber } = req.body;

    const validTypes = ['TECH_CARD', 'DISH_PHOTO', 'DOCUMENT'];
    if (!validTypes.includes(type)) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: 'Неверный тип файла. Допустимые: TECH_CARD, DISH_PHOTO, DOCUMENT' });
      return;
    }

    if ((type === 'TECH_CARD' || type === 'DISH_PHOTO') && !dishNumber) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: 'Для техкарты и фото блюда укажите номер блюда (dishNumber)' });
      return;
    }

    const uploadRecord = await prisma.upload.create({
      data: {
        userId: req.user!.userId,
        filename: req.file.filename,
        originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
        mimetype: req.file.mimetype,
        size: req.file.size,
        type,
        dishNumber: dishNumber ? parseInt(dishNumber) : null,
      },
    });

    res.status(201).json({
      message: 'Файл успешно загружен',
      upload: {
        id: uploadRecord.id,
        originalName: uploadRecord.originalName,
        type: uploadRecord.type,
        dishNumber: uploadRecord.dishNumber,
        url: `/uploads/${uploadRecord.filename}`,
        size: uploadRecord.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({ error: 'Ошибка при загрузке файла' });
  }
});

// ─── GET /api/uploads/my ─────────────────────────────────────────
router.get('/my', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const uploads: UploadRow[] = await prisma.upload.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });

    const grouped = {
      dishes: [1, 2, 3].map((num: number) => ({
        dishNumber: num,
        techCard: uploads.find((u: UploadRow) => u.type === 'TECH_CARD' && u.dishNumber === num) ?? null,
        photo: uploads.find((u: UploadRow) => u.type === 'DISH_PHOTO' && u.dishNumber === num) ?? null,
      })),
      documents: uploads.filter((u: UploadRow) => u.type === 'DOCUMENT'),
    };

    const withUrls = {
      dishes: grouped.dishes.map((d) => ({
        ...d,
        techCard: d.techCard ? { ...d.techCard, url: `/uploads/${d.techCard.filename}` } : null,
        photo: d.photo ? { ...d.photo, url: `/uploads/${d.photo.filename}` } : null,
      })),
      documents: grouped.documents.map((doc: UploadRow) => ({
        ...doc,
        url: `/uploads/${doc.filename}`,
      })),
    };

    res.json(withUrls);
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({ error: 'Ошибка при получении файлов' });
  }
});

// ─── DELETE /api/uploads/:id ──────────────────────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));

    const upload = await prisma.upload.findUnique({ where: { id } });

    if (!upload) {
      res.status(404).json({ error: 'Файл не найден' });
      return;
    }

    if (upload.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Нет доступа к этому файлу' });
      return;
    }

    const filePath = path.join(__dirname, '../../uploads', upload.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.upload.delete({ where: { id } });

    res.json({ message: 'Файл удалён' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ error: 'Ошибка при удалении файла' });
  }
});

export default router;