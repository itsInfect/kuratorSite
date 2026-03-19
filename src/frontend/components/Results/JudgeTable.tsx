// frontend/src/frontend/components/Results/JudgeTable.tsx

import React from "react";
import "./JudgeTable.css";

type JudgeScore = {
  criterion: string;
  scorePerJudge: number[];
  total: number;
  max?: number;
};

type Props = {
  judgeScores: JudgeScore[];
  totalScore: number;
  maxScore: number;
  judgeNames?: string[]; // реальные имена судей из API
};

const JudgeTable: React.FC<Props> = ({ judgeScores, totalScore, maxScore, judgeNames }) => {
  // Количество судей берём из первой строки
  const judgeCount = judgeScores[0]?.scorePerJudge.length ?? 3;

  // Заголовки судей — реальные имена или заглушки
  const judgeHeaders = Array.from({ length: judgeCount }, (_, i) =>
    judgeNames?.[i]
      ? judgeNames[i].split(' ').map((w, j) => j === 0 ? w : w[0] + '.').join(' ')
      : `Судья ${i + 1}`
  );

  return (
    <div className="judge-table-card">
      <table className="judge-table">
        <thead>
          <tr>
            <th>Критерий</th>
            {judgeHeaders.map((name, i) => (
              <th key={i}>{name}</th>
            ))}
            <th>Итого</th>
          </tr>
        </thead>
        <tbody>
          {judgeScores.map((row, i) => (
            <tr key={i}>
              <td>{row.criterion}</td>
              {row.scorePerJudge.map((s, j) => (
                <td key={j}>
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{ width: `${(s / (row.max ?? 20)) * 100}%` }}
                    >
                      {s}
                    </div>
                  </div>
                </td>
              ))}
              <td>{row.total}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td>ИТОГО</td>
            <td colSpan={judgeCount}></td>
            <td>{totalScore} / {maxScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default JudgeTable;