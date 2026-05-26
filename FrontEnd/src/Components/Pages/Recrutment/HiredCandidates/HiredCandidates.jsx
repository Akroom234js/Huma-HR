import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../Header/Header';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import Tabs from '../Tabs/Tabs';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import CreateJobModal from '../CreateJobModal/CreateJobModal';
import '../Main-page/Recrutment.css';
import './HiredCandidates.css';
import { getApplications, getJobPostings, getApplicationsPipelineStats } from '../../../../services/atsService';
import apiClient from '../../../../apiConfig';

// Custom lightweight text-based card for Hired candidates
const HiredCandidateCard = ({ candidate }) => {
    const navigate = useNavigate();
    const { t } = useTranslation('Recrutment/ToMakeOffer');

    const handleCreateProfile = () => {
        navigate('/employees/all', { state: { prefillCandidate: candidate } });
    };

    const hireDate = candidate.reviewed_at 
        ? new Date(candidate.reviewed_at).toLocaleDateString() 
        : new Date(candidate.updated_at).toLocaleDateString();

    return (
        <div className="hired-candidate-card">
            <div className="hired-card-header">
                <div className="hired-badge">
                    <span className="material-symbols-outlined">verified</span>
                    Officially Hired
                </div>
                <span className="hire-date">Date: {hireDate}</span>
            </div>
            
            <div className="hired-card-body">
                <h3 className="hired-name">{candidate.full_name}</h3>
                
                <div className="hired-info-row">
                    <span className="material-symbols-outlined icon">mail</span>
                    <span>{candidate.email}</span>
                </div>
                
                {candidate.phone && (
                    <div className="hired-info-row">
                        <span className="material-symbols-outlined icon">call</span>
                        <span>{candidate.phone}</span>
                    </div>
                )}
                
                <div className="hired-job-section">
                    <span className="job-label">Position Hired For:</span>
                    <h4 className="job-title-highlight">{candidate.job_posting?.title || 'Unknown Position'}</h4>
                    {candidate.job_posting?.department?.name && (
                        <p className="dept-label">{candidate.job_posting.department.name}</p>
                    )}
                </div>
            </div>

            <div className="hired-card-actions">
                <button className="btn-convert-employee" onClick={handleCreateProfile}>
                    <span className="material-symbols-outlined">person_add</span>
                    Create Employee Profile
                </button>
            </div>
        </div>
    );
};

const CandidateSkeleton = () => (
    <div className="hired-candidate-card skeleton" style={{ minHeight: 220, pointerEvents: 'none', opacity: 0.6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px' }}>
            <div className="skeleton-line skeleton-title" style={{ width: '40%', height: '24px' }} />
            <div className="skeleton-line" style={{ width: '80%', height: '20px' }} />
            <div className="skeleton-line" style={{ width: '60%', height: '16px' }} />
            <div className="skeleton-line skeleton-sm" style={{ width: '90%', height: '40px', marginTop: '20px' }} />
        </div>
    </div>
);

export default function HiredCandidates() {
    const [activeTab, setActiveTab]         = useState('hired');
    const [selectedDept, setSelectedDept]   = useState(() => sessionStorage.getItem('selected_job_posting_id') || '');
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [editingJob, setEditingJob]       = useState(null);
    const [applications, setApplications]   = useState([]);
    const [loading, setLoading]             = useState(true);
    const [pagination, setPagination]       = useState({ total: 0, current_page: 1, last_page: 1 });
    const [jobs, setJobs]                   = useState([]);
    const [jobsCount, setJobsCount]         = useState(0);
    const [counts, setCounts]               = useState({ pending: 0, shortlisted: 0, interviewing: 0, offered: 0, hired: 0 });

    const { t } = useTranslation('Recrutment/ToMakeOffer');

    const tabs = [
        { id: 'newly-applied',       label: t('Tabs.Newly-Applied') || 'Newly Applied',       count: counts.pending,      path: '/recruitment/newly-applied' },
        { id: 'schedule-interview',  label: t('Tabs.To-Schedule-Interview'),   count: counts.shortlisted,  path: '/recruitment/schedule-interview' },
        { id: 'interview-happening', label: t('Tabs.Interview-Happening'),    count: counts.interviewing, path: '/recruitment/interview-happening' },
        { id: 'make-offer',          label: t('Tabs.To-Make-Offer'),           count: counts.offered,      path: '/recruitment/make-offer' },
        { id: 'hired',               label: 'Hired Candidates',                count: counts.hired,        path: '/recruitment/hired' },
        { id: 'opening-jobs',        label: t('Tabs.Opening'),                 count: jobsCount,           path: '/recruitment/opening-jobs' },
    ];

    const departmentOptions = [
        { value: '', label: t('departmentOptions.all') },
        ...jobs.map(j => ({ value: String(j.id), label: j.title })),
    ];

    // ── Fetch all job postings for dropdown ────────────────
    useEffect(() => {
        getJobPostings().then(res => {
            const data = res.data?.data ?? res.data ?? [];
            const list = Array.isArray(data) ? data : [];
            setJobs(list);
            setJobsCount(list.length);
        }).catch(err => console.error('Failed to fetch jobs:', err));
    }, []);

    // ── Fetch pipeline counts for tab badges ──────────────────
    const fetchCounts = useCallback(async () => {
        try {
            const res = await getApplicationsPipelineStats(selectedDept || null);
            const stats = res.data?.data ?? {};
            setCounts({
                pending:      (stats.pending ?? 0) + (stats.reviewed ?? 0),
                shortlisted:  stats.shortlisted ?? 0,
                interviewing: stats.interviewing ?? 0,
                offered:      stats.offered ?? 0,
                hired:        stats.hired ?? 0,
            });
        } catch { /* silent */ }
    }, [selectedDept]);

    useEffect(() => { fetchCounts(); }, [fetchCounts]);

    // ── Fetch hired applications ─────────────────────────
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const params = { status: 'hired', per_page: 20 };
            if (selectedDept) {
                params.job_posting_id = selectedDept;
            }
            const res  = await getApplications(params);
            const body = res.data?.data ?? {};
            const list = body.applications ?? [];
            setApplications(Array.isArray(list) ? list : []);
            if (body.pagination) setPagination(body.pagination);
        } catch (err) {
            console.error('Failed to fetch hired applications:', err);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDept]);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    return (
        <>
            <div className="recruitment-page">
                <div className="recruitment-container">
                    <div className="recruitment-header-flex">
                        <Header onCreateJob={() => { setEditingJob(null); setIsModalOpen(true); }} />
                        <ThemeToggle />
                    </div>
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="opening-jobs-controls">
                        <FilterDropdown
                            value={selectedDept}
                            onChange={(val) => {
                                setSelectedDept(val);
                                sessionStorage.setItem('selected_job_posting_id', val);
                            }}
                            options={departmentOptions}
                        />
                    </div>

                    <div className="hired-candidates-grid">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => <CandidateSkeleton key={i} />)
                            : applications.length === 0
                                ? (
                                    <div className="jops-empty-state" style={{ gridColumn: '1/-1' }}>
                                        <span className="material-symbols-outlined">how_to_reg</span>
                                        <p>No hired candidates matching the criteria.</p>
                                    </div>
                                )
                                : applications.map(app => (
                                    <HiredCandidateCard
                                        key={app.id}
                                        candidate={app}
                                    />
                                ))
                        }
                    </div>

                    {!loading && applications.length > 0 && (
                        <div className="view-more">
                            <button className="view-more-btn">
                                {t('applicants')}
                                <span className="material-symbols-outlined">expand_more</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <CreateJobModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingJob(null); }}
                    onSave={() => setIsModalOpen(false)}
                    editingJob={editingJob}
                    departmentOptions={[]}
                />
            )}
        </>
    );
}
