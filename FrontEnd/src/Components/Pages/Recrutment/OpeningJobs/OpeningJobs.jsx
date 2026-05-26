import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../Header/Header';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import Tabs from '../Tabs/Tabs';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import JobCard from '../JobCard/JobCard';
import CreateJobModal from '../CreateJobModal/CreateJobModal';
import '../Main-page/Recrutment.css';
import './OpeningJobs.css';
import {
  getJobPostings,
  deleteJobPosting,
  publishJobPosting,
  closeJobPosting,
  getApplicationsPipelineStats,
} from '../../../../services/atsService';
import apiClient from '../../../../apiConfig';

export default function OpeningJobs() {
  const [activeTab, setActiveTab]   = useState('opening-jobs');
  const [selectedDept, setSelectedDept] = useState('');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingJob, setEditingJob]     = useState(null);
  const [jobs, setJobs]                 = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [counts, setCounts]             = useState({ pending: 0, shortlisted: 0, interviewing: 0, offered: 0, hired: 0 });

  const { t } = useTranslation('Recrutment/OpeningJobs');

  // ── Fetch pipeline counts for tab badges ──────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const res = await getApplicationsPipelineStats();
      const stats = res.data?.data ?? {};
      setCounts({
        pending:      (stats.pending ?? 0) + (stats.reviewed ?? 0),
        shortlisted:  stats.shortlisted ?? 0,
        interviewing: stats.interviewing ?? 0,
        offered:      stats.offered ?? 0,
        hired:        stats.hired ?? 0,
      });
    } catch { /* silent */ }
  }, []);

  // ── Fetch all jobs (HR sees all statuses) ─────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept) params.department_id = selectedDept;
      const res  = await getJobPostings(params);
      const data = res.data?.data ?? res.data ?? [];
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDept]);

  // ── Fetch departments for filter ──────────────────────────
  useEffect(() => {
    apiClient.get('/departments').then(res => {
      const data = res.data?.data ?? res.data ?? [];
      setDepartments(Array.isArray(data) ? data : []);
    }).catch(() => {});
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // ── Tab counts ────────────────────────────────────────────
  const tabs = [
    { id: 'newly-applied',       label: t('Tabs.Newly-Applied') || 'Newly Applied',       count: counts.pending,      path: '/recruitment/newly-applied' },
    { id: 'schedule-interview',  label: t('Tabs.To-Schedule-Interview'), count: counts.shortlisted, path: '/recruitment/schedule-interview' },
    { id: 'interview-happening', label: t('Tabs.Interview-Happening'), count: counts.interviewing, path: '/recruitment/interview-happening' },
    { id: 'make-offer',          label: t('Tabs.To-Make-Offer'),  count: counts.offered, path: '/recruitment/make-offer' },
    { id: 'hired',               label: 'Hired Candidates',       count: counts.hired,   path: '/recruitment/hired' },
    { id: 'opening-jobs',        label: t('Tabs.Opening'),         count: jobs.length,    path: '/recruitment/opening-jobs' },
  ];

  const departmentOptions = [
    { value: '', label: t('departmentOptions.all') },
    ...departments.map(d => ({ value: String(d.id), label: d.name })),
  ];

  // ── Handlers ──────────────────────────────────────────────
  const handleSave = (savedJob) => {
    setJobs(prev => {
      const exists = prev.find(j => j.id === savedJob.id);
      return exists
        ? prev.map(j => j.id === savedJob.id ? savedJob : j)
        : [savedJob, ...prev];
    });
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('Messages.Delete-Confirm'))) return;
    try {
      await deleteJobPosting(id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch { alert('Failed to delete job.'); }
  };

  const handlePublish = async (id) => {
    try {
      const res = await publishJobPosting(id);
      const updated = res.data?.data ?? res.data;
      setJobs(prev => prev.map(j => j.id === id ? updated : j));
    } catch { alert('Failed to publish job.'); }
  };

  const handleCloseJob = async (id) => {
    try {
      const res = await closeJobPosting(id);
      const updated = res.data?.data ?? res.data;
      setJobs(prev => prev.map(j => j.id === id ? updated : j));
    } catch { alert('Failed to close job.'); }
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

          <div className="opening-jobs-controls">
            <FilterDropdown
              value={selectedDept}
              onChange={setSelectedDept}
              options={departmentOptions}
            />
          </div>

          {loading ? (
            <div className="jobs-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="job-card cart1--skeleton">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.length === 0 ? (
                <div className="jops-empty-state">
                  <span className="material-symbols-outlined">work_off</span>
                  <p>No job postings yet. Click <strong>+ Post a Job</strong> to create one.</p>
                </div>
              ) : (
                jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onEdit={() => { setEditingJob(job); setIsModalOpen(true); }}
                    onDelete={() => handleDelete(job.id)}
                    onPublish={handlePublish}
                    onClose={handleCloseJob}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CreateJobModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingJob(null); }}
          onSave={handleSave}
          editingJob={editingJob}
          departmentOptions={departmentOptions.filter(o => o.value !== '')}
        />
      )}
    </>
  );
}
