import React from 'react';
import './AIRecommendationCard.css';

const AIRecommendationCard = ({
    // programName = '',
    // reason = '',
    // suitability = 100,
    // learningSequence = [],
    // lang
     recommendation,
    programName = '',
    reason = '',
    suitability = 100,
    learningSequence = [],
    lang
}) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const title =
        recommendation?.courseName || programName;

    const description =
        recommendation?.reason || reason;

    const fit =
        recommendation?.matchingScore || suitability;

    return (
        <div className="performance-ai-rec-card">
            <div className="ai-rec-badge">
                <i className="fa-solid fa-wand-magic-sparkles badge-icon"></i>
                <span>{isAr ? 'مدعوم بالذكاء الاصطناعي 🤖' : 'AI POWERED 🤖'}</span>
            </div>

            <div className="ai-rec-header">
                <h4 className="ai-rec-title">
                    <i className="fa-solid fa-graduation-cap header-icon"></i>
                    {/* <span>{programName}</span> */}
                    <span>{title}</span>
                </h4>
                <div className="ai-suitability-badge">
                    <span className="suitability-label">{isAr ? 'الملائمة:' : 'Fit:'}</span>
                    <span className="suitability-val">
                      {/* {suitability}% */}
                      {fit}%
                      </span>
                </div>
            </div>

            <p className="ai-rec-reason">
              {/* {reason} */}
               {description}
              </p>

            {learningSequence && learningSequence.length > 0 && (
                <div className="learning-sequence-section">
                    <h5 className="sequence-title">{isAr ? 'تسلسل التعلم المقترح:' : 'Suggested Learning Sequence:'}</h5>
                    <ul className="sequence-list">
                        {learningSequence.map((step, idx) => (
                            <li key={idx} className="sequence-step">
                                <span className="step-num">{idx + 1}</span>
                                <span className="step-text">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AIRecommendationCard;
