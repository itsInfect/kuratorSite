// frontend/src/frontend/pages/DocumentsPage/DocumentsPage.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { getMyUploads, uploadFile, deleteUpload, formatSize, type UploadRecord } from '../../../api/uploads';

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const data = await getMyUploads();
      setDocuments(data.documents);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadFile(file, 'DOCUMENT');
      await fetchDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить документ?')) return;
    try {
      await deleteUpload(id);
      await fetchDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif' }}>
      <Header activePage="uploads" />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          background: '#fff', borderRadius: 16,
          padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {/* Заголовок */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#aaa', fontWeight: 500 }}>Материалы</p>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>Загрузки</h1>
            </div>
            <button
              onClick={() => navigate('/uploads')}
              style={{
                background: '#fff', border: '1px solid #e0e0e0', color: '#333',
                borderRadius: 8, padding: '7px 18px', cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
              }}
            >
              Назад
            </button>
          </div>

          {error && (
            <div style={{
              color: '#c53030', background: '#fff5f5', border: '1px solid #feb2b2',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* Блок документов */}
          <div style={{
            border: '1px solid #f0f0f0', borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
                Документы команды
              </h2>
            </div>

            {loading && (
              <div style={{ padding: '24px 20px', color: '#aaa', fontSize: 14 }}>Загрузка...</div>
            )}

            {!loading && documents.length === 0 && (
              <div style={{ padding: '24px 20px', color: '#aaa', fontSize: 14 }}>
                Документы ещё не загружены
              </div>
            )}

            {documents.map((doc, idx) => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px',
                borderTop: idx > 0 ? '1px solid #f5f5f5' : 'none',
              }}>
                {/* Иконка */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#f5f5f5', border: '1px solid #e8e8e8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 18 }}>📄</span>
                </div>

                {/* Инфо */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: '#1a1a1a',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {doc.originalName}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                    {formatSize(doc.size)} · {formatDate((doc as UploadRecord & { createdAt?: string }).createdAt ?? '')}
                  </div>
                  <span style={{
                    display: 'inline-block', marginTop: 4,
                    fontSize: 11, fontWeight: 500,
                    background: '#fffaf0', color: '#dd6b20',
                    border: '1px solid #fbd38d',
                    borderRadius: 20, padding: '2px 10px',
                  }}>
                    На проверке
                  </span>
                </div>

                {/* Кнопки */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <a
                    href={`http://localhost:3000${doc.url}`}
                    download={doc.originalName}
                    style={{
                      padding: '7px 16px', background: '#fff',
                      border: '1px solid #e0e0e0', color: '#333',
                      borderRadius: 8, fontSize: 13, fontWeight: 500,
                      textDecoration: 'none', cursor: 'pointer',
                    }}
                  >
                    Скачать
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      padding: '7px 14px', background: '#fff',
                      border: '1px solid #e0e0e0', color: '#e53e3e',
                      borderRadius: 8, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    🗑 Удалить
                  </button>
                </div>
              </div>
            ))}

            {/* Кнопка загрузки */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,image/jpeg,image/png"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  width: '100%', padding: '12px',
                  background: uploading ? '#555' : '#1a1a1a',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}></span>
                {uploading ? 'Загрузка...' : 'Загрузить документ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;