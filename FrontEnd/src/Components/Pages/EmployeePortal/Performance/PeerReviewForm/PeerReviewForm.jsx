import React, { useState } from 'react';
import './PeerReviewForm.css';
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';

const PeerReviewForm = () => {
    const [selectedColleague, setSelectedColleague] = useState('');
    const [teamworkScore, setTeamworkScore] = useState(8.0);
    const [commScore, setCommScore] = useState(7.5);
    const [comment, setComment] = useState('');

    const colleaguesList = [
        { id: 1, name: 'Ahmed Al-Ali' },
        { id: 2, name: 'Sara Hassan' },
        { id: 3, name: 'Khaled Mansour' }
    ];

    const handleClear = () => {
        setSelectedColleague('');
        setTeamworkScore(5.0);
        setCommScore(5.0);
        setComment('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting Data:", {
            selectedColleague,
            teamworkScore,
            commScore,
            comment
        });
    };

    return (
        <div className="peer-review-portal-container">
            <section className="peer-header-section">
                <h1>Peer Review & Feedback</h1><div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                  </div>
                <p className="subtitle">
                    Submit anonymous feedback regarding your colleagues' collaborative efforts
                </p>
            </section>

            <div className="privacy-guarantee-banner">
                <div className="privacy-icon-wrapper">
                    <i className="fa-solid fa-user-shield"></i>
                </div>
                <div className="privacy-text-content">
                    <strong>STRICT PRIVACY GUARANTEE:</strong> Peer submissions are 100% anonymized.
                    Your comments are automatically encrypted using **AES-256-CBC** on submission, and your user ID is hashed using a cycle-specific security salt. No supervisors or HR representatives can trace these scores back to you.
                </div>
            </div>

            <div className="peer-card-body">

                <div className="peer-card-header-flex">
                    <h2 className="card-inner-title">Peer Assessment Form</h2>
                    <span className="salt-status-badge">
                        <i className="fa-solid fa-key"></i> Secure Salt Active
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="peer-actual-form">

                    <div className="peer-form-group">
                        <label>Colleague to Evaluate *</label>
                        <select
                            className="peer-select-input"
                            value={selectedColleague}
                            onChange={(e) => setSelectedColleague(e.target.value)}
                            required
                        >
                            <option value="" disabled hidden>
                                Select Colleague...
                            </option>
                            {colleaguesList.map(col => (
                                <option key={col.id} value={col.id}>
                                    {col.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="peer-form-group slider-box-wrap">
                        <div className="slider-label-header">
                            <span className="slider-title">
                                Teamwork & Collaboration (0 - 10)
                            </span>
                            <span className="slider-counter-badge">
                                {teamworkScore.toFixed(1)}
                            </span>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            className="peer-range-slider"
                            value={teamworkScore}
                            onChange={(e) =>
                                setTeamworkScore(parseFloat(e.target.value))
                            }
                        />

                        <p className="slider-bottom-desc">
                            Evaluates readiness to help, collaboration, and team engagement.
                        </p>
                    </div>

                    <div className="peer-form-group slider-box-wrap">
                        <div className="slider-label-header">
                            <span className="slider-title">
                                Communication & Cooperation (0 - 10)
                            </span>
                            <span className="slider-counter-badge">
                                {commScore.toFixed(1)}
                            </span>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            className="peer-range-slider"
                            value={commScore}
                            onChange={(e) =>
                                setCommScore(parseFloat(e.target.value))
                            }
                        />

                        <p className="slider-bottom-desc">
                            Evaluates communication clarity, transparency, and collaboration.
                        </p>
                    </div>

                    <div className="peer-form-group">
                        <label>Constructive Feedback (Optional)</label>
                        <textarea
                            className="peer-textarea-field"
                            rows={4}
                            placeholder="Write anonymous feedback..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <div className="anonymous-validation-footer-box">
                        <div className="validation-meta-text">
                            <h4>Anonymous Validation</h4>
                            <p>Hash-based verification active to prevent duplicate submissions.</p>
                        </div>

                        <span className="hash-secured-badge">
                            <i className="fa-solid fa-shield-halved"></i> HASH SECURED
                        </span>
                    </div>

                    
                    <div className="peer-form-actions">
                        <button
                            type="button"
                            className="btn-peer-clear"
                            onClick={handleClear}
                        >
                            Clear
                        </button>

                        <button type="submit" className="btn-peer-submit">
                            <i className="fa-solid fa-lock"></i> Submit Feedback
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PeerReviewForm;

// with shared perrReviewForm
// import React, { useState } from 'react';
// import PeerReviewForm from '../../../../Shared/Performance/PeerReviewForm/PeerReviewForm';

// const PeerReviewPage = () => {
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const employees = [
//         { id: 1, name: 'Ahmed Al-Ali', department: 'IT' },
//         { id: 2, name: 'Sara Hassan', department: 'HR' },
//         { id: 3, name: 'Khaled Mansour', department: 'Frontend' }
//     ];

//     const handleSubmit = async (data) => {
//         try {
//             setIsSubmitting(true);

//             console.log('Sending to backend:', data);

//             await new Promise(res => setTimeout(res, 1000));

//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="peer-review-page">
//             <PeerReviewForm
//                 employees={employees}
//                 onSubmit={handleSubmit}
//                 isSubmitting={isSubmitting}
//                 lang={sessionStorage.getItem('lang')}
//             />
//         </div>
//     );
// };

// export default PeerReviewPage;