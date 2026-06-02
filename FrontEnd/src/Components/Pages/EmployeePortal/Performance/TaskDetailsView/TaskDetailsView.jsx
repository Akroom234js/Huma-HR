import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskDetailsView.css';

import DeadlineAlert from '../../../../Shared/Performance/DeadlineAlert/DeadlineAlert';
import ManagerNoteBox from '../../../../Shared/Performance/ManagerNoteBox/ManagerNoteBox';
import TaskScoreBreakdown from '../../../../Shared/Performance/TaskScoreBreakdown/TaskScoreBreakdown';
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';

const TaskDetailsView = () => {
    const navigate = useNavigate();
    const { taskId } = useParams();

    const [submissionText, setSubmissionText] = useState(
        "Here is the revised documentation. I have added a new section detailing Webhook Payloads for Stripe and Slack, including JSON mock files and header validations. Link: https://wiki.huma-hr.local/docs/auth-integration-v2"
    );

    const [selectedFile, setSelectedFile] = useState(null);
    const sampleBreakdown = {
        completionScore: 95,
        qualityScore: 88,
        daysLate: 0,
        penaltyPoints: 0,
        finalScore: 92.2
    };
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting:", { submissionText, selectedFile });
    };

    return (
        <div className="task-details-container">
            <div className="details-header-section">
                <div className="title-block">
                    <h1>Task Deliverable Details</h1>
                    <p className="subtitle">
                        Review requirements, inspect supervisor revision comments, and upload deliverables
                    </p>
                </div>

                <div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>

                <button className="btn-back" onClick={() => navigate('/portal/tasks')}>
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Tasks
                </button>
            </div>
            <DeadlineAlert dueDate="2026-05-28" />
            <div className="details-main-card">

                <div className="card-header-flex">
                    <h2 className="main-task-title">Draft Integration Documentation</h2>

                    <span className="status-revision-badge">
                        STATUS: NEEDS REVISION
                    </span>
                </div>

                <div className="task-specifications-block">
                    <h3>Task Specifications</h3>
                    <p>
                        Write developer documentation for the authentication middleware integrations.
                        Ensure sequence flows and payload formats for incoming events are included.
                    </p>
                </div>

                <ManagerNoteBox
                    notes="The sequence flow charts look good, but webhook schemas for Stripe and Slack are missing. Please revise and resubmit."
                    isRevision={true}
                />
                <form onSubmit={handleSubmit} className="submission-form">

                    <div className="form-group">
                        <label className="required-label">
                            Submission Text & Links *
                        </label>

                        <textarea
                            className="form-textarea"
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            rows={5}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Attach Artifact Files (PDF, ZIP, Image - Max 10MB)</label>

                        <div className="file-upload-wrapper">
                            <label className="file-upload-btn">
                                Choose File
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            <span className="file-name-text">
                                {selectedFile ? selectedFile.name : 'No file chosen'}
                            </span>
                        </div>
                    </div>
                    <div className="form-actions-buttons">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit-deliverable">
                            <i className="fa-solid fa-paper-plane"></i>
                            Resubmit Deliverables
                        </button>
                    </div>

                </form>
            </div>
            <div className="grades-breakdown-section">
                <h3 className="section-title-secondary">
                    Completed Task Grades Breakdown (Sample)
                </h3>

                <TaskScoreBreakdown breakdown={sampleBreakdown} />
            </div>

        </div>
    );
};

export default TaskDetailsView;