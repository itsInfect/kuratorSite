// frontend/src/frontend/pages/JudgePage/JudgePage.tsx

import React, { useEffect, useRef, useState } from 'react';
import { getUser, logout } from '../../../api/auth';
import { getTeamsForJudge, getMyScores, submitScore, type TeamForJudge } from '../../../api/scores';

// ─── Критерии оценки ─────────────────────────────────────────────
const CRITERIA = [
  { key: 'criterion1', name: 'Mise en place',         max: 20 },
  { key: 'criterion2', name: 'Hygiene & Food waste',  max: 20 },
  { key: 'criterion3', name: 'Критерий 3',            max: 20 },
  { key: 'criterion4', name: 'Критерий 4',            max: 20 },
  { key: 'criterion5', name: 'Критерий 5',            max: 20 },
];

type ScoreForm = {
  criterion1: number;
  criterion2: number;
  criterion3: number;
  criterion4: number;
  criterion5: number;
  comment: string;
  photo: File | null;
};

const emptyForm = (): ScoreForm => ({
  criterion1: 0, criterion2: 0, criterion3: 0,
  criterion4: 0, criterion5: 0,
  comment: '', photo: null,
});

const JudgePage: React.FC = () => {
  const [teams, setTeams] = useState<TeamForJudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamForJudge | null>(null);
  const [form, setForm] = useState<ScoreForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const user = getUser();

  const reload = async () => {
    try {
      const [teamsData, myScores] = await Promise.all([
        getTeamsForJudge(),
        getMyScores(),
      ]);
      setTeams(teamsData);

      // Если уже выбрана команда — подгрузить её оценки в форму
      if (selectedTeam) {
        const existing = myScores.find((s: { team: { id: number } }) => s.team.id === selectedTeam.id);
        if (existing) {
          setForm({
            criterion1: existing.criterion1,
            criterion2: existing.criterion2,
            criterion3: existing.criterion3,
            criterion4: existing.criterion4,
            criterion5: existing.criterion5,
            comment: existing.comment ?? '',
            photo: null,
          });
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleSelectTeam = async (team: TeamForJudge) => {
    setSelectedTeam(team);
    setForm(emptyForm());
    setSavedMsg(null);
    setError(null);

    // Подгрузить существующую оценку если есть
    try {
      const myScores = await getMyScores();
      const existing = myScores.find((s: { team: { id: number } }) => s.team.id === team.id);
      if (existing) {
        setForm({
          criterion1: existing.criterion1,
          criterion2: existing.criterion2,
          criterion3: existing.criterion3,
          criterion4: existing.criterion4,
          criterion5: existing.criterion5,
          comment: existing.comment ?? '',
          photo: null,
        });
      }
    } catch {}
  };

  const handleSubmit = async () => {
    if (!selectedTeam) return;
    setSaving(true);
    setError(null);
    try {
      await submitScore({
        teamId: selectedTeam.id,
        ...form,
        photo: form.photo ?? undefined,
      });
      setSavedMsg('Оценка сохранена!');
      await reload();
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const totalScore = CRITERIA.reduce((sum, c) => sum + (form[c.key as keyof ScoreForm] as number), 0);
  const maxTotal = CRITERIA.reduce((sum, c) => sum + c.max, 0);
  const scoredCount = teams.filter(t => t.isScored).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif' }}>

      {/* ── Хедер ────────────────────────────────────────── */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e8e8e8',
        padding: '0 32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', height: 64,
      }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#1a1a1a' }}>
          Кабинет судьи
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#1a1a1a', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600,
          }}>
            {user?.fullName?.split(' ').slice(0, 2).map((w: string) => w[0]).join('') ?? ''}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
              {user?.fullName?.split(' ').map((w: string, i: number) => i === 0 ? w : w[0] + '.').join(' ')}
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Судья</div>
          </div>
          <button onClick={logout} style={{
            background: '#1a1a1a', border: 'none', color: '#fff',
            borderRadius: 8, padding: '8px 20px', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, marginLeft: 8,
          }}>
            Выйти
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '32px 24px', gap: 24 }}>

        {/* ── Левая панель — список команд ─────────────── */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
              Команды
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#aaa' }}>
              Оценено: {scoredCount} / {teams.length}
            </p>

            {/* Прогресс */}
            <div style={{
              height: 6, background: '#f0f0f0', borderRadius: 4,
              marginBottom: 20, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 4, background: '#38a169',
                width: teams.length > 0 ? `${(scoredCount / teams.length) * 100}%` : '0%',
                transition: 'width 0.3s',
              }} />
            </div>

            {loading && <p style={{ color: '#aaa', fontSize: 13 }}>Загрузка...</p>}
            {!loading && teams.length === 0 && (
              <p style={{ color: '#aaa', fontSize: 13 }}>Команды не созданы</p>
            )}

            {teams.map(team => (
              <div
                key={team.id}
                onClick={() => handleSelectTeam(team)}
                style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 8,
                  cursor: 'pointer', transition: 'background 0.15s',
                  background: selectedTeam?.id === team.id ? '#f0f0f0' : '#fafafa',
                  border: selectedTeam?.id === team.id ? '1px solid #1a1a1a' : '1px solid #ebebeb',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>
                  {team.name}
                </span>
                {team.isScored && (
                  <span style={{
                    fontSize: 11, background: '#f0fff4', color: '#38a169',
                    border: '1px solid #c6f6d5', borderRadius: 20, padding: '2px 8px',
                  }}>
                    ✓ оценено
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Правая панель — форма оценки ─────────────── */}
        <div style={{ flex: 1 }}>
          {!selectedTeam ? (
            <div style={{
              background: '#fff', borderRadius: 14, padding: 60,
              textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
              <h2 style={{ color: '#1a1a1a', margin: '0 0 8px' }}>Выберите команду</h2>
              <p style={{ color: '#aaa', fontSize: 14 }}>Нажмите на команду слева чтобы выставить оценку</p>
            </div>
          ) : (
            <div style={{
              background: '#fff', borderRadius: 14, padding: 28,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ marginBottom: 24 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#aaa' }}>Оценка команды</p>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
                  {selectedTeam.name}
                </h2>
                {selectedTeam.isScored && (
                  <span style={{
                    display: 'inline-block', marginTop: 6, fontSize: 12,
                    background: '#f0fff4', color: '#38a169',
                    border: '1px solid #c6f6d5', borderRadius: 20, padding: '3px 12px',
                  }}>
                    ✓ Оценка уже выставлена — можно редактировать
                  </span>
                )}
              </div>

              {error && (
                <div style={{
                  color: '#c53030', background: '#fff5f5', border: '1px solid #feb2b2',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13,
                }}>
                  {error}
                </div>
              )}

              {/* Критерии */}
              {CRITERIA.map(c => {
                const val = form[c.key as keyof ScoreForm] as number;
                const pct = (val / c.max) * 100;
                return (
                  <div key={c.key} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{c.name}</span>
                      <span style={{ fontSize: 13, color: '#888' }}>
                        <strong style={{ color: '#1a1a1a' }}>{val}</strong> / {c.max}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0} max={c.max} step={0.5}
                      value={val}
                      onChange={e => setForm(prev => ({ ...prev, [c.key]: parseFloat(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#1a1a1a', marginBottom: 4 }}
                    />
                    <div style={{ height: 4, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        background: pct >= 80 ? '#38a169' : pct >= 50 ? '#3182ce' : '#e53e3e',
                        width: `${pct}%`, transition: 'width 0.2s',
                      }} />
                    </div>
                  </div>
                );
              })}

              {/* Итоговый балл */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 20px', background: '#f7fafc', borderRadius: 10, marginBottom: 24,
              }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Итого</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
                  {totalScore} <span style={{ fontSize: 14, color: '#aaa', fontWeight: 400 }}>/ {maxTotal}</span>
                </span>
              </div>

              {/* Комментарий */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', display: 'block', marginBottom: 6 }}>
                  Комментарий
                </label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Опишите замечания или нарушения..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid #e0e0e0', fontSize: 14, resize: 'vertical',
                    fontFamily: 'sans-serif', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Фото нарушения */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', display: 'block', marginBottom: 6 }}>
                  Фото нарушения
                </label>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => setForm(prev => ({ ...prev, photo: e.target.files?.[0] ?? null }))}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => photoRef.current?.click()}
                    style={{
                      padding: '8px 16px', background: '#fff',
                      border: '1px solid #e0e0e0', color: '#333',
                      borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    }}
                  >
                    📷 Прикрепить фото
                  </button>
                  {form.photo && (
                    <span style={{ fontSize: 13, color: '#38a169' }}>
                      ✓ {form.photo.name}
                    </span>
                  )}
                </div>
              </div>

              {savedMsg && (
                <div style={{
                  color: '#38a169', background: '#f0fff4', border: '1px solid #c6f6d5',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13,
                }}>
                  ✓ {savedMsg}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  width: '100%', padding: '13px',
                  background: saving ? '#555' : '#1a1a1a',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {saving ? 'Сохранение...' : selectedTeam.isScored ? 'Обновить оценку' : 'Сохранить оценку'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JudgePage;