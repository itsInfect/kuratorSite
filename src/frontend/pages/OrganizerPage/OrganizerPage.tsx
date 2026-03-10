// frontend/src/frontend/pages/OrganizerPage/OrganizerPage.tsx

import React, { useEffect, useState } from 'react';
import { logout, getUser } from '../../../api/auth';
import {
  getAllTeams, getFreeUsers, createTeam,
  addMember, removeMember, deleteTeam,
  type Team, type ParticipantUser, statusLabel,
} from '../../../api/teams';

const OrganizerPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [freeUsers, setFreeUsers] = useState<ParticipantUser[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Record<number, string>>({});
  const [selectedRole, setSelectedRole] = useState<Record<number, string>>({});

  const user = getUser();

  const reload = async () => {
    try {
      const [t, u] = await Promise.all([getAllTeams(), getFreeUsers()]);
      setTeams(t);
      setFreeUsers(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Ошибка'); }
  };

  const handleAddMember = async (teamId: number) => {
    const userId = parseInt(selectedUser[teamId]);
    if (!userId) return;
    try {
      await addMember(teamId, userId, selectedRole[teamId] || 'Участник');
      setSelectedUser(prev => ({ ...prev, [teamId]: '' }));
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Ошибка'); }
  };

  const handleRemoveMember = async (teamId: number, userId: number) => {
    if (!confirm('Убрать участника из команды?')) return;
    try {
      await removeMember(teamId, userId);
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Ошибка'); }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!confirm('Удалить команду? Все участники будут откреплены.')) return;
    try {
      await deleteTeam(teamId);
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Ошибка'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif' }}>

      {/* ── Хедер ───────────────────────────────────────── */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        padding: '0 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 64,
      }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
          Кабинет организатора
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Аватар с инициалами */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#1a1a1a', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, flexShrink: 0, 
          }}>
            {user?.fullName?.split(' ').map((w: string) => w[0]).slice(0, 2).join('') ?? ''}
          </div>
          {/* Короткое имя: Фамилия И.О. */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
              {user?.fullName?.split(' ').map((w: string, i: number) =>
                i === 0 ? w : w[0] + '.'
              ).join(' ') ?? ''}
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Организатор</div>
          </div>
          <button
            onClick={logout}
            style={{
              background: '#1a1a1a', border: 'none', color: '#fff',
              borderRadius: 8, padding: '8px 20px', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, marginLeft: 4,
            }}
          >
            Выйти
          </button>
        </div>
      </header>

      {/* ── Контент ─────────────────────────────────────── */}
      <div style={{ padding: '32px', maxWidth: 920, margin: '0 auto' }}>

        {/* Заголовок */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1a1a1a' }}>
            Управление командами
          </h1>
          <p style={{ margin: '6px 0 0', color: '#888', fontSize: 14 }}>
            Команд: {teams.length} · Участников без команды: {freeUsers.length}
          </p>
        </div>

        {error && (
          <div style={{
            color: '#c53030', background: '#fff5f5', border: '1px solid #feb2b2',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            {error}
            <button onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#c53030' }}>✕</button>
          </div>
        )}

        {/* ── Создать команду ── */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: 24,
          marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
            Создать новую команду
          </h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateTeam()}
              placeholder="Название команды"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 14,
                border: '1px solid #e0e0e0', outline: 'none', color: '#1a1a1a',
                background: '#fafafa',
              }}
            />
            <button
              onClick={handleCreateTeam}
              disabled={!newTeamName.trim()}
              style={{
                padding: '10px 24px', background: newTeamName.trim() ? '#1a1a1a' : '#ccc',
                color: '#fff', border: 'none', borderRadius: 8,
                cursor: newTeamName.trim() ? 'pointer' : 'default',
                fontSize: 14, fontWeight: 500, transition: 'background 0.2s',
              }}
            >
              Создать
            </button>
          </div>
        </div>

        {/* ── Участники без команды ── */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: 24,
          marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
            Участники без команды
            <span style={{
              marginLeft: 8, fontSize: 12, fontWeight: 500,
              background: '#f0f0f0', color: '#555',
              borderRadius: 20, padding: '2px 10px',
            }}>
              {freeUsers.length}
            </span>
          </h2>
          {freeUsers.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 14, margin: 0 }}>Все участники распределены по командам</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {freeUsers.map(u => (
                <div key={u.id} style={{
                  background: '#fafafa', border: '1px solid #ebebeb',
                  borderRadius: 10, padding: '8px 14px', fontSize: 13,
                }}>
                  <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{u.fullName}</div>
                  <div style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                    {u.organization || u.city || u.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Список команд ── */}
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: '24px 0 14px' }}>
          Команды
          <span style={{
            marginLeft: 8, fontSize: 12, fontWeight: 500,
            background: '#f0f0f0', color: '#555',
            borderRadius: 20, padding: '2px 10px',
          }}>
            {teams.length}
          </span>
        </h2>

        {loading && <p style={{ color: '#aaa', fontSize: 14 }}>Загрузка...</p>}
        {!loading && teams.length === 0 && (
          <p style={{ color: '#aaa', fontSize: 14 }}>Команды ещё не созданы</p>
        )}

        {teams.map(team => (
          <div key={team.id} style={{
            background: '#fff', borderRadius: 14, padding: 24,
            marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {/* Заголовок команды */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{
                  fontSize: 13, color: '#888', fontWeight: 400,
                  display: 'block', marginBottom: 2,
                }}>Команда</span>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>
                  {team.name}
                </h3>
              </div>
              <button
                onClick={() => handleDeleteTeam(team.id)}
                style={{
                  background: '#fff', border: '1px solid #e0e0e0', color: '#999',
                  borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
                }}
              >
                Удалить
              </button>
            </div>

            {/* Участники */}
            {team.members.length === 0 ? (
              <p style={{ color: '#bbb', fontSize: 13, marginBottom: 16 }}>Нет участников</p>
            ) : (
              <div style={{
                border: '1px solid #f0f0f0', borderRadius: 10,
                overflow: 'hidden', marginBottom: 16,
              }}>
                {team.members.map((m, idx) => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderTop: idx > 0 ? '1px solid #f5f5f5' : 'none',
                    background: '#fff',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Аватар */}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: '#f0f0f0', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600, color: '#555', flexShrink: 0,
                      }}>
                        {m.user.fullName.split(' ').slice(0, 2).map((w: string) => w[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
                          {m.user.fullName}
                        </div>
                        <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>{m.role}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 12, padding: '3px 10px', borderRadius: 20,
                        background: m.user.status === 'CONFIRMED' ? '#f0fff4' : '#fffaf0',
                        color: m.user.status === 'CONFIRMED' ? '#38a169' : '#dd6b20',
                        border: `1px solid ${m.user.status === 'CONFIRMED' ? '#c6f6d5' : '#fbd38d'}`,
                        fontWeight: 500,
                      }}>
                        {statusLabel[m.user.status]}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(team.id, m.userId)}
                        style={{
                          background: 'none', border: 'none',
                          color: '#ccc', cursor: 'pointer', fontSize: 18,
                          lineHeight: 1, padding: 0,
                        }}
                        title="Убрать из команды"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Добавить участника */}
            {freeUsers.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select
                  value={selectedUser[team.id] || ''}
                  onChange={e => setSelectedUser(prev => ({ ...prev, [team.id]: e.target.value }))}
                  style={{
                    flex: 2, padding: '9px 12px', borderRadius: 8, fontSize: 13,
                    border: '1px solid #e0e0e0', color: '#333', background: '#fafafa',
                    outline: 'none',
                  }}
                >
                  <option value="">— Выбрать участника —</option>
                  {freeUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}{u.organization ? ` (${u.organization})` : ''}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedRole[team.id] || 'Участник'}
                  onChange={e => setSelectedRole(prev => ({ ...prev, [team.id]: e.target.value }))}
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: 8, fontSize: 13,
                    border: '1px solid #e0e0e0', color: '#333', background: '#fafafa',
                    outline: 'none',
                  }}
                >
                  <option value="Участник">Участник</option>
                  <option value="Капитан">Капитан</option>
                  <option value="Тренер">Тренер</option>
                </select>
                <button
                  onClick={() => handleAddMember(team.id)}
                  disabled={!selectedUser[team.id]}
                  style={{
                    padding: '9px 18px', fontSize: 13, fontWeight: 500,
                    background: selectedUser[team.id] ? '#1a1a1a' : '#e0e0e0',
                    color: selectedUser[team.id] ? '#fff' : '#aaa',
                    border: 'none', borderRadius: 8,
                    cursor: selectedUser[team.id] ? 'pointer' : 'default',
                  }}
                >
                  + Добавить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizerPage;