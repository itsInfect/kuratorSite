import React from "react";
import "./JudgeTable.css";

type JudgeScore = { criterion: string; scorePerJudge: number[]; total: number; max?: number };

type Props = { judgeScores: JudgeScore[]; totalScore: number; maxScore: number; };

const JudgeTable: React.FC<Props> = ({ judgeScores, totalScore, maxScore }) => {
  return (
    <div className="judge-table-card">
      <table className="judge-table">
        <thead>
          <tr>
            <th>Критерий</th>
            <th>Судья 1</th>
            <th>Судья 2</th>
            <th>Судья 3</th>
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
                      style={{ width: `${(s / (row.max ?? 10)) * 100}%` }}
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
            <td colSpan={3}></td>
            <td>{totalScore} / {maxScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
  );
};

export default JudgeTable;