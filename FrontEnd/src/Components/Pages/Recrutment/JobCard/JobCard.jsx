import React from 'react';
import './JobCard.css';
import { useTranslation } from 'react-i18next';

const JobCard = ({ job, onEdit, onDelete }) => {
    const { t } = useTranslation('Recrutment/OpeningJobs');

    return (
        <div className="job-card">
            <div className="job-card-header">
                <h3>{job.title}</h3>
                <div className="card-actions">
                    <button className="icon-btn" onClick={onEdit} title={t('JobCard.Edit')}><span className="material-symbols-outlined">edit</span></button>
                    <button className="icon-btn" onClick={onDelete} title={t('JobCard.Delete')}><span className="material-symbols-outlined">delete</span></button>
                </div>
            </div>

            <p className="job-desc">{job.description}</p>

            <div className="job-details">
                <div className="detail-item">
                    <span className="material-symbols-outlined">apartment</span>
                    <span>{job.department}</span>
                </div>
                <div className="detail-item">
                    <span className="material-symbols-outlined">payments</span>
                    <span>{job.salary}</span>
                </div>
            </div>

            <div className="job-footer">
                <span>{job.applicants} {t('JobCard.Applicants')}</span>
            </div>
        </div>
    );
};

export default JobCard;