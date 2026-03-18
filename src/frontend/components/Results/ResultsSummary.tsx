import React from "react";
import "./ResultsSummary.css";

type Penalty = { reason: string; points: number; };

type Props = {
  averageScore: number;
  maxScorePerDish: number;
  maxScoreTotal: number;
  finalScore: number;
  penalties: Penalty[];
};

const ResultsSummary: React.FC<Props> = ({
  averageScore,
  maxScorePerDish,
  maxScoreTotal,
  finalScore,
  penalties
}) => {
  return (
    <div className="results-summary-card">
      <div className="summary-left">
        <div className="summary-row">
          <div>
            <span className="label">Средний балл</span>
            <span className="value">{averageScore}</span>
          </div>
          <div>
            <span className="label">Макс. за блюдо</span>
            <span className="value">{maxScorePerDish}</span>
          </div>
          <div>
            <span className="label">Макс. общий</span>
            <span className="value">{maxScoreTotal}</span>
          </div>
        </div>
        {penalties.length > 0 && (
          <div className="penalties-block">
            <h4>Штрафы</h4>
            {penalties.map((p, i) => (
              <div className="penalty-row" key={i}>
                <span>{p.reason}</span>
                <span>{p.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="summary-right">
        <span className="final-label">Итог</span>
        <span className="final-score">{finalScore}</span>
      </div>
    </div>
  );
};

export default ResultsSummary;