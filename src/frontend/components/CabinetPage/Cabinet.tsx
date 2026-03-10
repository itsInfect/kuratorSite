// frontend/src/frontend/components/CabinetPage/Cabinet.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyUploads, type MyUploads } from '../../../api/uploads';
import { getMyTeam, type Team } from '../../../api/teams';
import "./Cabinet.css";

const DISH_NAMES = ['Блюдо 1', 'Блюдо 2', 'Блюдо 3'];

const Cabinet: React.FC = () => {
  const [uploads, setUploads] = useState<MyUploads | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyUploads().then(setUploads).catch(console.error);
    getMyTeam().then(setTeam).catch(console.error);
  }, []);

  const getDishProgress = (idx: number) => {
    if (!uploads) return { loaded: 0, total: 2, pct: 0 };
    const dish = uploads.dishes[idx];
    const loaded = (dish.techCard ? 1 : 0) + (dish.photo ? 1 : 0);
    return { loaded, total: 2, pct: loaded * 50 };
  };

  // Тренер команды если есть
  const trainer = team?.members.find(m => m.role === 'Тренер');

  return (
    <div className="cabinet">
      <main className="cabinet-content">
        <div className="cards-row">

          {/* Карточка статуса регистрации */}
          <div className="info-card">
            <h3 className="card-title">Статус регистрации</h3>
            <div className="status-list">
              <div className="status-item">
                <span className="status-label">Аккаунт</span>
                <span className="status-value confirmed">подтвержден</span>
              </div>
              <div className="status-item">
                <span className="status-label">Документы</span>
                <span className="status-value pending">на проверке</span>
              </div>
              <div className="status-item">
                <span className="status-label">Материалы</span>
                <span className="status-value">загружаются отдельно</span>
              </div>
            </div>
            <button className="card-btn" onClick={() => navigate('/uploads')}>
              Перейти к загрузкам
            </button>
          </div>

          {/* Карточка команды */}
          <div className="info-card">
            <h3 className="card-title">Команда</h3>
            {team ? (
              <div className="team-info">
                <h4 className="team-name">{team.name}</h4>
                <div className="team-detail">
                  <span className="detail-label">Участников:</span>
                  <span className="detail-value">{team.members.length}</span>
                </div>
                {trainer && (
                  <div className="team-detail">
                    <span className="detail-label">Тренер:</span>
                    <span className="detail-value">{trainer.user.fullName}</span>
                  </div>
                )}
                <div className="team-detail">
                  <span className="detail-label">Статус:</span>
                  <span className="detail-value">сформирована организатором</span>
                </div>
              </div>
            ) : (
              <div className="team-info">
                <p style={{ color: '#aaa', fontSize: 14, margin: '8px 0' }}>
                  Команда ещё не назначена
                </p>
              </div>
            )}
            <button className="card-btn" onClick={() => navigate('/team')}>
              Открыть команду
            </button>
          </div>

          {/* Карточка результатов */}
          <div className="info-card">
            <h3 className="card-title">Результаты</h3>
            <div className="results-info">
              <div className="result-item">
                <span className="result-label">Ср. по судьям:</span>
                <span className="result-value">—</span>
              </div>
              <div className="result-item">
                <span className="result-label">Итог (с учётом штрафов):</span>
                <span className="result-value">—</span>
              </div>
              <div className="result-item">
                <span className="result-label">Место:</span>
                <span className="result-value place">—</span>
              </div>
            </div>
            <button className="card-btn" onClick={() => navigate('/results')}>
              Смотреть разбалловку
            </button>
          </div>

        </div>

        {/* Чек-лист материалов */}
        <section className="checklist-section">
          <h2 className="section-title">Чек-лист материалов</h2>
          <div className="checklist-vertical">
            {DISH_NAMES.map((name, idx) => {
              const { loaded, total, pct } = getDishProgress(idx);
              const dish = uploads?.dishes[idx];

              return (
                <div className="dish-block" key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>{name}</h4>
                    <span style={{ fontSize: 12, color: pct === 100 ? '#38a169' : '#888' }}>
                      {loaded}/{total}
                    </span>
                  </div>

                  <div style={{
                    height: 4, background: '#eee', borderRadius: 4,
                    margin: '6px 0 10px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: pct === 100 ? '#38a169' : '#3182ce',
                      width: `${pct}%`, transition: 'width 0.3s',
                    }} />
                  </div>

                  <div className="material-line" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Технологическая карта</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: dish?.techCard ? '#38a169' : '#aaa' }}>
                      {dish?.techCard ? '✓ загружено' : 'не загружено'}
                    </span>
                  </div>
                  <div className="format-line">PDF/DOC</div>

                  <div className="material-line" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Фото блюда</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: dish?.photo ? '#38a169' : '#aaa' }}>
                      {dish?.photo ? '✓ загружено' : 'не загружено'}
                    </span>
                  </div>
                  <div className="format-line">JPG/PNG</div>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Cabinet;