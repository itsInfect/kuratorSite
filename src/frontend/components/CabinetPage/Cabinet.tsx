// frontend/src/frontend/components/CabinetPage/Cabinet.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyUploads, type MyUploads } from '../../../api/uploads';
import { getMyTeam, type Team } from '../../../api/teams';
import { getResults, type TeamResult } from '../../../api/results';
import "./Cabinet.css";

const DISH_NAMES = ['Блюдо 1', 'Блюдо 2', 'Блюдо 3'];

const Cabinet: React.FC = () => {
  const [uploads, setUploads] = useState<MyUploads | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [myResult, setMyResult] = useState<TeamResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyUploads().then(setUploads).catch(console.error);
    getMyTeam().then(t => {
      setTeam(t);
      if (t) {
        getResults().then(results => {
          const found = results.find(r => r.teamId === t.id);
          setMyResult(found ?? null);
        }).catch(console.error);
      }
    }).catch(console.error);
  }, []);

  const getDishProgress = (idx: number) => {
    if (!uploads) return { loaded: 0, total: 2, pct: 0 };
    const dish = uploads.dishes[idx];
    const loaded = (dish.techCard ? 1 : 0) + (dish.photo ? 1 : 0);
    return { loaded, total: 2, pct: loaded * 50 };
  };

  const trainer = team?.members.find(m => m.role === 'Тренер');
  const hasResults = myResult && myResult.judgeCount > 0;

  return (
    <div className="cabinet">
      <main className="cabinet-content">
        <div className="cards-row">

          {/* ── Статус регистрации ── */}
          <div className="info-card">
            <p className="card-title">Статус регистрации</p>
            <div className="card-body">
              <div className="card-row">
                <span className="card-row-label">Аккаунт</span>
                <span className="badge badge-dark">Подтверждён</span>
              </div>
              <div className="card-row">
                <span className="card-row-label">Документы</span>
                <span className="badge badge-light">На проверке</span>
              </div>
              <p className="card-note">Материалы загружаются отдельно</p>
            </div>
            <button className="card-btn-dark" onClick={() => navigate('/uploads')}>
              <span></span> Перейти к загрузкам
            </button>
          </div>

          {/* ── Команда ── */}
          <div className="info-card">
            <p className="card-title">Команда</p>
            <div className="card-body">
              {team ? (
                <>
                  <p className="card-team-name">{team.name}</p>
                  <p className="card-team-sub">{team.name}</p>
                  <div className="card-divider" />
                  <div className="card-row">
                    <span className="card-row-label">Статус</span>
                    <span className="card-row-value">Сформирована организатором</span>
                  </div>
                  {trainer && (
                    <div className="card-row">
                      <span className="card-row-label">Тренер</span>
                      <span className="card-row-value">{trainer.user.fullName}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="card-note">Команда ещё не назначена</p>
              )}
            </div>
            <button className="card-btn-dark" onClick={() => navigate('/team')}>
              <span></span> Открыть команду
            </button>
          </div>

          {/* ── Результаты ── */}
          <div className="info-card">
            <p className="card-title">Результаты</p>
            <div className="card-body">
              <div className="card-row">
                <span className="card-row-label">Ср. по судьям</span>
                {hasResults
                  ? <span className="badge badge-light">{myResult!.avgScore}/100</span>
                  : <span className="card-row-value">—</span>
                }
              </div>
              {hasResults && (
                <p className="card-big-score">{myResult!.avgScore}</p>
              )}
              <p className="card-row-label" style={{ marginTop: 4 }}>
                Итог (с учётом штрафов)
              </p>
              {myResult?.place && (
                <div className="card-row" style={{ marginTop: 12 }}>
                  <span className="card-row-label">🏆 Место: {myResult.place}</span>
                </div>
              )}
              {!hasResults && (
                <p className="card-note" style={{ marginTop: 8 }}>Оценки ещё не выставлены</p>
              )}
            </div>
            <button className="card-btn-dark" onClick={() => navigate('/results')}>
              <span></span> Смотреть разбалловку
            </button>
          </div>

        </div>

        {/* ── Чек-лист материалов ── */}
        <section className="checklist-section">
          <h2 className="section-title">Чек-лист материалов</h2>
          <div className="checklist-vertical">
            {DISH_NAMES.map((name, idx) => {
              const { loaded, total, pct } = getDishProgress(idx);
              const dish = uploads?.dishes[idx];
              return (
                <div className="dish-block" key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>{name}</h4>
                    <span style={{ fontSize: 12, color: pct === 100 ? '#38a169' : '#888' }}>
                      {loaded}/{total}
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#eee', borderRadius: 4, margin: '6px 0 10px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: pct === 100 ? '#38a169' : '#1a1a1a',
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