// frontend/src/frontend/pages/Uploads/Uploads.tsx — ЗАМЕНИТЕ текущий файл

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import {
  getMyUploads,
  uploadFile,
  deleteUpload,
  formatSize,
  type MyUploads,
  type UploadType,
   type UploadRecord,
} from '../../../api/uploads';
import './Uploads.css';

const DISH_NAMES = ['Блюдо 1', 'Блюдо 2', 'Блюдо 3'];

const Uploads: React.FC = () => {
  const [data, setData] = useState<MyUploads | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null); // ключ загружаемого слота
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const pendingUpload = useRef<{ type: UploadType; dishNumber?: number } | null>(null);

  const fetchUploads = async () => {
    try {
      const result = await getMyUploads();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUploads(); }, []);

  // Открыть диалог выбора файла
  const triggerUpload = (type: UploadType, dishNumber?: number) => {
    pendingUpload.current = { type, dishNumber };
    if (fileInputRef.current) {
      // Фильтр по типу
      fileInputRef.current.accept =
        type === 'DISH_PHOTO' ? 'image/jpeg,image/png' : '.pdf,.doc,.docx';
      fileInputRef.current.click();
    }
  };

  // Обработка выбранного файла
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUpload.current) return;

    const { type, dishNumber } = pendingUpload.current;
    const key = `${type}-${dishNumber ?? 'doc'}`;
    setUploading(key);
    setError(null);

    try {
      await uploadFile(file, type, dishNumber);
      await fetchUploads(); // обновляем список
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setUploading(null);
      e.target.value = ''; // сброс input
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить файл?')) return;
    try {
      await deleteUpload(id);
      await fetchUploads();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  // Подсчёт готовности блюда
  const getDishProgress = (dishIndex: number): { loaded: number; total: number } => {
    if (!data) return { loaded: 0, total: 2 };
    const dish = data.dishes[dishIndex];
    const loaded = (dish.techCard ? 1 : 0) + (dish.photo ? 1 : 0);
    return { loaded, total: 2 };
  };

  if (loading) return (
    <div className="uploads">
      <Header activePage="uploads" />
      <div className="uploads-container" style={{ textAlign: 'center', paddingTop: 60 }}>
        Загрузка...
      </div>
    </div>
  );

  return (
    <div className="uploads">
      <Header activePage="uploads" />

      {/* Скрытый input для файлов */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="uploads-container">
        <h1 className="page-title2">Загрузки</h1>

        {error && (
          <div style={{
            color: '#e53e3e', background: '#fff5f5', border: '1px solid #fed7d7',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div className="content-wrapper">
          {/* ── Блюда ─────────────────────────────────────────── */}
          <div className="dishes-wrapper">
            <h2 className="dishes-main-title">Блюда</h2>
            <div className="dishes-columns">
              {DISH_NAMES.map((name, idx) => {
                const dish = data?.dishes[idx];
                const { loaded, total } = getDishProgress(idx);
                const pct = Math.round((loaded / total) * 100);
                const dishNum = idx + 1;

                return (
                  <div className="dish-column" key={idx}>
                    <div className="dish-header">
                      <h3 className="dish-title">{name}</h3>
                      <span className="dish-counter">{loaded}/{total}</span>
                    </div>

                    <div className="readiness-block">
                      <span className="readiness-label">Готовность {pct}%</span>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="materials-list">
                      {/* Технологическая карта */}
                      <div className="material-item">
                        <div>
                          <span className="material-name">Техкарта</span>
                          <span className="material-format"> PDF/DOC</span>
                        </div>
                        {dish?.techCard ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <a
                              href={`http://localhost:3000${dish.techCard.url}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: 12, color: '#3182ce', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={dish.techCard.originalName}
                            >
                              {dish.techCard.originalName}
                            </a>
                            <span style={{ fontSize: 11, color: '#888' }}>{formatSize(dish.techCard.size)}</span>
                            <button
                              onClick={() => handleDelete(dish.techCard!.id)}
                              style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 16 }}
                              title="Удалить"
                            >✕</button>
                          </div>
                        ) : (
                          <button
                            className="card-btn"
                            style={{ marginTop: 6, fontSize: 12, padding: '4px 10px' }}
                            onClick={() => triggerUpload('TECH_CARD', dishNum)}
                            disabled={uploading === `TECH_CARD-${dishNum}`}
                          >
                            {uploading === `TECH_CARD-${dishNum}` ? 'Загрузка...' : '+ Загрузить'}
                          </button>
                        )}
                      </div>

                      {/* Фото блюда */}
                      <div className="material-item" style={{ marginTop: 10 }}>
                        <div>
                          <span className="material-name">Фото</span>
                          <span className="material-format"> JPG/PNG</span>
                        </div>
                        {dish?.photo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <a
                              href={`http://localhost:3000${dish.photo.url}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: 12, color: '#3182ce', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={dish.photo.originalName}
                            >
                              {dish.photo.originalName}
                            </a>
                            <span style={{ fontSize: 11, color: '#888' }}>{formatSize(dish.photo.size)}</span>
                            <button
                              onClick={() => handleDelete(dish.photo!.id)}
                              style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 16 }}
                              title="Удалить"
                            >✕</button>
                          </div>
                        ) : (
                          <button
                            className="card-btn"
                            style={{ marginTop: 6, fontSize: 12, padding: '4px 10px' }}
                            onClick={() => triggerUpload('DISH_PHOTO', dishNum)}
                            disabled={uploading === `DISH_PHOTO-${dishNum}`}
                          >
                            {uploading === `DISH_PHOTO-${dishNum}` ? 'Загрузка...' : '+ Загрузить'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Документы ─────────────────────────────────────── */}
          <div className="documents-block">
            <h2 className="documents-block-title">Документы</h2>
            <div className="documents-card">
              <h3 className="documents-card-title">Командные документы</h3>
              <div className="documents-number">{data?.documents.length ?? 0}</div>
              <p className="documents-description">Паспорта, согласия, допуски, справки</p>

              {/* Список документов */}
              {data && data.documents.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {data.documents.map((doc: UploadRecord) => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <a
                        href={`http://localhost:3000${doc.url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 12, color: '#3182ce', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={doc.originalName}
                      >
                        {doc.originalName}
                      </a>
                      <span style={{ fontSize: 11, color: '#888', flexShrink: 0 }}>{formatSize(doc.size)}</span>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
                        title="Удалить"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="documents-btn"
                onClick={() => navigate('/uploads/documents')}
              >
                Открыть документы
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploads;