import React from "react";
import "./PerformanceReport.css";
import ThemeToggle from "../../../../ThemeToggle/ThemeToggle";
import DecisionBadge from "../../../../Shared/Performance/DecisionBadge/DecisionBadge";
import CompetencyGapTag from "../../../../Shared/Performance/CompetencyGapTag/CompetencyGapTag";
import FinalScoreBreakdown from "../../../../Shared/Performance/FinalScoreBreakdown/FinalScoreBreakdown";
import ScoreWeightBar from "../../../../Shared/Performance/ScoreWeightBar/ScoreWeightBar";
import AIRecommendationCard from "../../../../Shared/Performance/AIRecommendationCard/AIRecommendationCard";

const PerformanceReport = () => {
  const scoreData = {
    finalScore: 75.6,
    components: {
      task: 84.5,
      manager: 89,
      peer: 78,
      attendance: 90,
      overtime: 60,
    },
  };
const aiRecommendations = [
  {
    courseName: "Collaboration & Agile Comm",
    reason:
      "Reason: Recommended to address the communication and peer assessment index gap of 78 points. Covers proactive standup updates..",
    matchingScore: 96,
    sequence: 1,
  },
  {
    courseName: "Advanced Redis & SQL Eager Loading",
    reason:
      "Reason: Targets your database optimization focus, helping you increase your task scores on core infrastructure tickets..",
    matchingScore: 94,
    sequence: 2,
  },
 
];

  const peerComments = [
    `"John is an exceptionally strong technical team member. He is always willing to dive deep into complex database bugs and provide solutions. Sometimes he communicates a bit late on integration progress, but his output quality is excellent."`,
    `"Great engineer, very collaborative during sprint planning. He helped me resolve a logic lock in our queuing worker. Documentation is always highly detailed and structured."`,
  ];

  return (
    <div className="performance-report-container">
    
      <section className="top-header">
        <div className="page-title">
          <h1>My Performance & AI Development Report</h1>
          <p>
            Consolidated scorecard details, anonymous peer comments, and AI
            learning pathway recommendations.
          </p>
        </div>
      </section>

      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="report-grid-layout">
    
        <div className="left-report-column">
        
          <div className="main-card">
            <div className="card-header-title">
              <span>Consolidated Cycle Score Card</span>
            </div>

            <div className="consolidated-flex-content">
              
             <div 
  className="score-radial-progress" 
  style={{ "--score": scoreData.finalScore }} 
>
  <div className="radial-inner">
    <span className="big-score-number">{scoreData.finalScore}</span>
    <span className="score-max-text">out of 100</span>
  </div>
</div>

              <div className="decision-info-block">
                <h3 className="decision-mini-title">
                  Current Cycle Decision Result
                </h3>

                <p className="decision-paragraph-desc">
                  Your overall weighted performance score meets the requirements
                  for outstanding performance and recognition.
                </p>

                <DecisionBadge decision="promotion_bonus" />
              </div>
            </div>

            <div className="weighting-rules-footer">
              <p>
                Weighting Rules: Task Grade (40%) + Supervisor Grade (25%) +
                Peer Grade (15%) + Attendance (10%) + Overtime Contribution
                (10%).
              </p>
            </div>
          </div>

          
          <div className="main-card">
    <div className="card-header-title">
        <span>Score Components Breakdown</span>
    </div>

<div className="components-bars-wrapper">

  <ScoreWeightBar
    label="Task Score (40% Weight)"
    score={84.5}
    weight={100}
    color="#3b82f6"
  />

  <ScoreWeightBar
    label="Manager Evaluation Score (25% Weight)"
    score={89}
    weight={100}
    color="#8b5cf6"
  />

  <ScoreWeightBar
    label="Peer Evaluation Score (15% Weight)"
    score={78}
    weight={100}
    color="#10b981"
  />

  <ScoreWeightBar
    label="Attendance & Punctuality (10% Weight)"
    score={90}
    weight={100}
    color="#f59e0b"
  />

  <ScoreWeightBar
    label="Overtime Commitment (10% Weight)"
    score={60}
    weight={100}
    color="#ef4444"
  />

</div></div>
      
          <div className="main-card">
            <div className="card-header-title">
              <span>Aggregated Peer Comments</span>

              <span className="meta-encryption-tag">
                <i className="fa-solid fa-shield-halved"></i>
                Fully Anonymized
              </span>
            </div>

            <p className="section-intro">
            Feedback submitted anonymously by your colleagues in the IT Department regarding collaborative efforts during this performance window:
            </p>

            <div className="comments-quotes-list">
              {peerComments.map((comment, index) => (
                <div key={index} className="peer-comment-quote-box">
                  <p>{comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-report-column">

          <div className="main-card">
            <div className="card-header-title">
              <span>Identified Competency Gaps</span>
            </div>

            <p className="section-intro">
              The performance analytics engine identified the following focus
              areas based on evaluation indicators.
            </p>

            <div className="gaps-tags-container">
              <CompetencyGapTag
                gapType="communication"
                gapName="Teamwork & Communication (Score: 78)"
              />

              <CompetencyGapTag
                gapType="technical"
                gapName="Technical Execution (Score: 84.5)"
              />
            </div>
          </div>

          <div className="main-card">
            <div className="card-header-title">
              <span className="purple-text">
                AI Training Recommendations
              </span>

              <span className="meta-engine-tag">
                <i className="fa-solid fa-brain"></i>
                GPT-4 Powered
              </span>
            </div>

            <p className="section-intro">
              Personalized learning recommendations generated based on your
              performance indicators and competency gaps.
            </p>

            <div className="ai-cards-container">
              {aiRecommendations.map((item, index) => (
                <AIRecommendationCard
                  key={index}
                  recommendation={{
                    courseName: item.courseName,
                    reason: item.reason,
                    matchingScore: item.matchingScore,
                    sequence: item.sequence,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;