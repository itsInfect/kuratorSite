// frontend/src/frontend/pages/ResultsPage/ResultsPage.tsx

import React, { useEffect, useState } from 'react';
import ResultsSummary from '../../components/Results/ResultsSummary';
import JudgeTable from '../../components/Results/JudgeTable';
import Header from '../../components/Header/Header';
import { getResults, type TeamResult } from '../../../api/results';
import { getMyTeam } from '../../../api/teams';
import './ResultsPage.css';

// Названия критериев — поменяйте когда уточните у организатора
const CRITERIA_NAMES = [
  'Mise en place',
  'Hygiene & Food waste',
  'Критерий 3',
  'Критерий 4',
  'Критерий 5',
];

const ResultsPage: React.FC = () => {
  const [myTeamResult, setMyTeamResult] = useState<TeamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [results, myTeam] = await Promise.all([
          getResults(),
          getMyTeam(),
        ]);

        if (myTeam) {
          const found = results.find(r => r.teamId === myTeam.id);
          setMyTeamResult(found ?? null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="results-page">
      <Header activePage="results" />
      <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Загрузка...</div>
    </div>
  );

  if (error) return (
    <div className="results-page">
      <Header activePage="results" />
      <div style={{ padding: 40, color: '#e53e3e' }}>{error}</div>
    </div>
  );

  if (!myTeamResult || myTeamResult.judgeCount === 0) return (
    <div className="results-page">
      <div className="results-page-content">
        <Header activePage="results" />
        <div style={{
          margin: '40px auto', maxWidth: 600, textAlign: 'center',
          background: '#fff', borderRadius: 16, padding: 40,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h2 style={{ color: '#1a1a1a', margin: '0 0 8px' }}>Результаты ещё не готовы</h2>
          <p style={{ color: '#aaa', fontSize: 14 }}>
            Судьи ещё не выставили оценки вашей команде
          </p>
        </div>
      </div>
    </div>
  );

  // Считаем суммарный балл по всем судьям
  const totalPenalties = 0; // штрафы пока 0, добавите позже
  const finalScore = myTeamResult.avgScore - totalPenalties;

  // Для ResultsSummary
  const summaryData = {
    averageScore: myTeamResult.avgScore,
    maxScorePerDish: 100,
    maxScoreTotal: 100,
    finalScore: Math.round(finalScore * 100) / 100,
    penalties: [] as { reason: string; points: number }[],
  };

  // Для JudgeTable — преобразуем данные из API в формат компонента
  const judgeTableData = CRITERIA_NAMES.map((criterion, idx) => {
    const key = `criterion${idx + 1}` as keyof typeof myTeamResult.scores[0]['criteria'];
    const scorePerJudge = myTeamResult.scores.map(s => s.criteria[key]);
    const total = scorePerJudge.reduce((a, b) => a + b, 0);
    return { criterion, scorePerJudge, total };
  });

  const totalScore = myTeamResult.scores.reduce((sum, s) => sum + s.total, 0);
  const judgeNames = myTeamResult.scores.map(s => s.judgeName);

  return (
    <div className="results-page">
      <div className="results-page-content">
        <Header activePage="results" />
        <ResultsSummary {...summaryData} />
        <JudgeTable
          judgeScores={judgeTableData}
          totalScore={Math.round(totalScore * 100) / 100}
          maxScore={100 * myTeamResult.judgeCount}
          judgeNames={judgeNames}
        />
      </div>
    </div>
  );
};

export default ResultsPage;