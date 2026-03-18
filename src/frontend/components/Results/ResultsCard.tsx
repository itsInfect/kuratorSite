import React from "react";
import "./ResultsCard.css";

type Penalty = {
  reason: string;
  points: number;
};

type Props = {
  averageScore?: number;
  maxScorePerDish?: number;
  maxScoreTotal?: number;
  finalScore?: number;
  penalties?: Penalty[];
};

const ResultsCard: React.FC<Props> = ({
  averageScore,
  maxScorePerDish,
  maxScoreTotal,
  finalScore,
  penalties = [],
}) => {
  return (
    <div className="results-card">

      <h2 className="results-card-title">
        Результаты и разбалловка
      </h2>

      {/* Основные показатели */}
      <div className="results-summary">
        <div className="summary-item">
          <span className="summary-label">Средний балл</span>
          <span className="summary-value">{averageScore ?? "—"}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Макс. за блюдо</span>
          <span className="summary-value">{maxScorePerDish ?? "—"}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Макс. общий</span>
          <span className="summary-value">{maxScoreTotal ?? "—"}</span>
        </div>
      </div>

      {/* Финальный результат */}
      <div className="results-final">
        <span className="final-label">Итоговый результат</span>
        <span className="final-score">{finalScore ?? "—"}</span>
      </div>

      {/* Штрафы */}
      {penalties.length > 0 && (
        <div className="results-penalties">
          <h3 className="penalties-title">Штрафы</h3>
          {penalties.map((p, i) => (
            <div className="penalty-row" key={i}>
              <span className="penalty-reason">{p.reason}</span>
              <span className="penalty-points">{p.points}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ResultsCard;