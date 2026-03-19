import React from "react";
import ResultsSummary from "../../components/Results/ResultsSummary";
import JudgeTable from "../../components/Results/JudgeTable";
import "./ResultsPage.css";
import Header from "../../components/Header/Header";

const ResultsPage: React.FC = () => {
  const summaryData = {
    averageScore: 89.89,
    maxScorePerDish: 100,
    maxScoreTotal: 300,
    finalScore: 284,
    penalties: [{ reason: "Опоздание", points: -3 }, { reason: "Несвоевременная подача", points: -2  }]
  };

  const judgeTables = [
    {
      judgeScores: [
        { criterion: "Mise en place", scorePerJudge: [5, 4, 5], total: 14 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 }
      ],
      totalScore: 43,
      maxScore: 50,
    },
    {
      judgeScores: [
        { criterion: "Mise en place", scorePerJudge: [5, 4, 5], total: 14 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 }
      ],
      totalScore: 43,
      maxScore: 50,
    },
    {
      judgeScores: [
        { criterion: "Mise en place", scorePerJudge: [5, 4, 5], total: 14 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 },
        { criterion: "Hygiene & Food waste", scorePerJudge: [9, 10, 10], total: 29 }
      ],
      totalScore: 43,
      maxScore: 50,
    }
    
  ];

  return (
    <div className="results-page">
      <div className="results-page-content">
        <Header activePage="results" />

        <ResultsSummary {...summaryData} />

        {judgeTables.map((table, i) => (
          <JudgeTable
            key={i}
            judgeScores={table.judgeScores}
            totalScore={table.totalScore}
            maxScore={table.maxScore}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;