import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../Header/Header';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import Tabs from '../Tabs/Tabs';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import CandidateCard from '../CandidateCard/CandidateCard';
import CreateJobModal from '../CreateJobModal/CreateJobModal';
import '../Main-page/Recrutment.css';
import './NewlyApplied.css';
import { getApplications, getJobPostings, getApplicationsPipelineStats } from '../../../../services/atsService';
import apiClient from '../../../../apiConfig';

const CandidateSkeleton = () => (
    <div className="candidate-card" style={{ minHeight: 200, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-sm" />
        </div>
    </div>
);

export default function NewlyApplied() {
    const [activeTab, setActiveTab]         = useState('newly-applied');
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

    // ── Fetch pending & reviewed applications ─────────────────────
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const baseParams = { per_page: 20 };
            if (selectedDept) {
                baseParams.job_posting_id = selectedDept;
            }
            const [pendingRes, reviewedRes] = await Promise.all([
                getApplications({ ...baseParams, status: 'pending' }),
                getApplications({ ...baseParams, status: 'reviewed' }),
            ]);

            const pendingList = pendingRes.data?.data?.applications ?? [];
            const reviewedList = reviewedRes.data?.data?.applications ?? [];

            // Combine both lists
            setApplications([...pendingList, ...reviewedList]);

            if (pendingRes.data?.data?.pagination) {
                setPagination(pendingRes.data.data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch pending and reviewed applications:', err);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDept]);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    // Remove card from this tab when moved to reviewed or shortlist stage
    const handleTransitionDone = (updatedApp) => {
        if (updatedApp.status !== 'pending' && updatedApp.status !== 'reviewed') {
            setApplications(prev => prev.filter(a => a.id !== updatedApp.id));
        } else {
            setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
        }
        fetchCounts();
    };

    return (
        <>
            <div className="recruitment-page">
                <div className="recruitment-container">
                    <div className="recruitment-header-flex">
                        <Header onCreateJob={() => { setEditingJob(null); setIsModalOpen(true); }} />
                        <ThemeToggle />
                    </div>
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                    <FilterDropdown
                        value={selectedDept}
                        onChange={(val) => {
                            setSelectedDept(val);
                            sessionStorage.setItem('selected_job_posting_id', val);
                        }}
                        options={departmentOptions}
                    />

                    <div className="candidates-grid">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => <CandidateSkeleton key={i} />)
                            : applications.length === 0
                                ? (
                                    <div className="jops-empty-state" style={{ gridColumn: '1/-1' }}>
                                        <span className="material-symbols-outlined">inbox</span>
                                        <p>No new applications yet.</p>
                                    </div>
                                )
                                : applications.map(app => (
                                    <CandidateCard
                                        key={app.id}
                                        candidate={app}
                                        onTransitionDone={handleTransitionDone}
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
