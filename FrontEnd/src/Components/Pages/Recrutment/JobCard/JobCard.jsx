import React from 'react';
import './JobCard.css';
import { useTranslation } from 'react-i18next';

/**
 * JobCard — HR internal view of a job posting
 * Props:
 *  job       — the job posting object from API
 *  onEdit    — callback to open edit modal
 *  onDelete  — callback to delete job
 *  onPublish — callback to publish draft job
 *  onClose   — callback to close open job
 */
const JobCard = ({ job, onEdit, onDelete, onPublish, onClose }) => {
    const { t } = useTranslation('Recrutment/OpeningJobs');

    const formatSalary = () => {
        if (!job.salary_min && !job.salary_max) return null;
        const currency = job.salary_currency || 'USD';
        if (job.salary_min && job.salary_max) {
            return `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`;
        }
        return `$${((job.salary_min || job.salary_max) / 1000).toFixed(0)}k ${currency}`;
    };

    const salary = formatSalary();
    const statusClass = `job-status-pill status-${job.status || 'draft'}`;

    return (
        <div className="job-card">
            <div className="job-card-header">
                <div className="job-card-title-row">
                    <h3>{job.title}</h3>
                    <span className={statusClass}>{job.status || 'draft'}</span>
                </div>
                <div className="card-actions">
                    {/* Publish — only for draft jobs */}
                    {(!job.status || job.status === 'draft') && onPublish && (
                        <button
                            className="icon-btn icon-btn--green"
                            onClick={() => onPublish(job.id)}
                            title="Publish Job"
                        >
                            <span className="material-symbols-outlined">publish</span>
                        </button>
                    )}
                    {/* Close — only for open jobs */}
                    {job.status === 'open' && onClose && (
                        <button
                            className="icon-btn icon-btn--orange"
                            onClick={() => onClose(job.id)}
                            title="Close Job"
                        >
                            <span className="material-symbols-outlined">lock</span>
                        </button>
                    )}
                    <button className="icon-btn" onClick={onEdit} title={t('JobCard.Edit')}>
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="icon-btn icon-btn--red" onClick={onDelete} title={t('JobCard.Delete')}>
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>

            <p className="job-desc">
                {job.description?.length > 120
                    ? job.description.slice(0, 120) + '…'
                    : job.description}
            </p>

            <div className="job-details">
                {job.department?.name && (
                    <div className="detail-item">
                        <span className="material-symbols-outlined">apartment</span>
                        <span>{job.department.name}</span>
                    </div>
                )}
                {salary && (
                    <div className="detail-item">
                        <span className="material-symbols-outlined">payments</span>
                        <span>{salary}</span>
                    </div>
                )}
                {job.employment_type && (
                    <div className="detail-item">
                        <span className="material-symbols-outlined">schedule</span>
                        <span>{job.employment_type}</span>
                    </div>
                )}
                {job.location && (
                    <div className="detail-item">
                        <span className="material-symbols-outlined">location_on</span>
                        <span>{job.location}</span>
                    </div>
                )}
            </div>

            <div className="job-footer">
                <span>
                    {job.applications_count ?? 0} {t('JobCard.Applicants')}
                </span>
                {job.application_deadline && (
                    <span className="job-deadline">
                        <span className="material-symbols-outlined">event</span>
                        Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>
    );
};

export default JobCard;