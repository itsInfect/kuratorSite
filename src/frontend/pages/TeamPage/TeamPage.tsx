// frontend/src/frontend/pages/TeamPage/TeamPage.tsx — ЗАМЕНИТЕ текущий файл

import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Team from '../../components/Team/Team';
import { getMyTeam, type Team as TeamType } from '../../../api/teams';
import './TeamPage.css';

const TeamPage: React.FC = () => {
  const [team, setTeam] = useState<TeamType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyTeam()
      .then(setTeam)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
      .finally(() => setLoading(false));
  }, []);

  const members = team?.members.map(m => ({
    id: m.userId,
    name: m.user.fullName,
    role: m.role,
    status: m.user.status === 'CONFIRMED' ? 'Подтверждён' : 'На проверке',
    avatar: m.user.fullName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase(),
  })) ?? [];

  return (
    <div className="team-page">
      <Header activePage="team" />
      <main className="team-content">
        {loading && <p style={{ padding: 40 }}>Загрузка...</p>}
        {error && <p style={{ padding: 40, color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <Team
            teamName={team?.name ?? 'Команда не назначена'}
            members={members}
          />
        )}
      </main>
    </div>
  );
};

export default TeamPage;