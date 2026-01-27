import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../Header/Header';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import Tabs from '../Tabs/Tabs';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import JobCard from '../JobCard/JobCard';
import CreateJobModal from '../CreateJobModal/CreateJobModal';
import '../Main-page/Recrutment.css';
import './OpeningJobs.css';

export default function OpeningJobs() {
    const [activeTab, setActiveTab] = useState('opening-jobs');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    const { t } = useTranslation("Recrutment/OpeningJobs");

    const [jobs, setJobs] = useState([
        {
            id: 1,
            title: 'Senior UX Designer',
            description: 'We are looking for a Senior UX Designer to lead our design team and create intuitive user experiences.',
            department: 'Design Department',
            salary: '$85k - $120k',
            applicants: 42
        },
        {
            id: 2,
            title: 'Backend Developer',
            description: 'Join our engineering team to build scalable and high-performance backend systems using modern technologies.',
            department: 'Engineering',
            salary: '$90k - $135k',
            applicants: 18
        },
        {
            id: 3,
            title: 'Marketing Manager',
            description: 'Drive our growth strategy and manage our marketing campaigns across various digital channels.',
            department: 'Marketing',
            salary: '$70k - $105k',
            applicants: 29
        },
    ]);

    const tabs = [
        { id: 'interview-happening', label: t('Tabs.Interview-Happening'), count: 3, path: '/recruitment/interview-happening' },
        { id: 'schedule-interview', label: t('Tabs.To-Schedule-Interview'), count: 8, path: '/recruitment/schedule-interview' },
        { id: 'make-offer', label: t('Tabs.To-Make-Offer'), count: 6, path: '/recruitment/make-offer' },
        { id: 'opening-jobs', label: t('Tabs.Opening'), count: jobs.length, path: '/recruitment/opening-jobs' },
    ];

    const departmentOptions = [
        { value: '', label: t('departmentOptions.all') },
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'product', label: 'Product Management' },
        { value: 'marketing', label: 'Marketing' },
    ];

    const handleAddJob = (jobData) => {
        if (editingJob) {
            setJobs(jobs.map(j => j.id === editingJob.id ? { ...j, ...jobData } : j));
        } else {
            const newJob = {
                ...jobData,
                id: Date.now(),
                applicants: 0
            };
            setJobs([newJob, ...jobs]);
        }
        setIsModalOpen(false);
        setEditingJob(null);
    };

    const handleDeleteJob = (id) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            setJobs(jobs.filter(job => job.id !== id));
        }
    };

    const handleOpenEdit = (job) => {
        setEditingJob(job);
        setIsModalOpen(true);
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
                            value={selectedDepartment}
                            onChange={setSelectedDepartment}
                            options={departmentOptions}
                        />
                        <button
                            className="create-job-btn"
                            onClick={() => { setEditingJob(null); setIsModalOpen(true); }}
                        >
                            <span className="material-symbols-outlined">add</span>
                            {t('create')}
                        </button>
                    </div>

                    <div className="jobs-grid">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onEdit={() => handleOpenEdit(job)}
                                onDelete={() => handleDeleteJob(job.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <CreateJobModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingJob(null); }}
                    onSave={handleAddJob}
                    editingJob={editingJob}
                    departmentOptions={departmentOptions.filter(opt => opt.value !== '')}
                />
            )}
        </>
    );
}
