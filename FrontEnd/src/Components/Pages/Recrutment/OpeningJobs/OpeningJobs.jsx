import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../Header/Header';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import Tabs from '../Tabs/Tabs';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import JobCard from '../JobCard/JobCard';
import CreateJobModal from '../CreateJobModal/CreateJobModal';
import './OpeningJobs.css';

export default function OpeningJobs() {
    const [activeTab, setActiveTab] = useState('opening-jobs');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { t } = useTranslation("Recrutment/OpeningJobs");

    const tabs = [
        { id: 'interview-happening', label: t('Tabs.Interview-Happening'), count: 3, path: '/recruitment/interview-happening' },
        { id: 'schedule-interview', label: t('Tabs.To-Schedule-Interview'), count: 8, path: '/recruitment/schedule-interview' },
        { id: 'make-offer', label: t('Tabs.To-Make-Offer'), count: 6, path: '/recruitment/make-offer' },
        { id: 'opening-jobs', label: t('Tabs.Opening'), count: 3, path: '/recruitment/opening-jobs' },
    ];

    const departmentOptions = [
        { value: '', label: t('departmentOptions.all') },
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'product', label: 'Product Management' },
        { value: 'marketing', label: 'Marketing' },
    ];

    const jobs = [
        {
            id: 1,
            title: 'Senior Frontend Developer',
            description: 'We are looking for an experienced frontend developer to join our engineering team.',
            department: 'Engineering',
            salary: '$120k - $150k',
            applicants: 24
        },
        {
            id: 2,
            title: 'Product Designer',
            description: 'Join our design team to create beautiful and intuitive user experiences.',
            department: 'Design',
            salary: '$100k - $130k',
            applicants: 18
        },
        {
            id: 3,
            title: 'Product Manager',
            description: 'Lead product development and drive strategic initiatives.',
            department: 'Product',
            salary: '$130k - $160k',
            applicants: 15
        }
    ];

    const handleEdit = (jobId) => {
        console.log('Edit job:', jobId);
        // TODO: Implement edit functionality
    };

    const handleDelete = (jobId) => {
        console.log('Delete job:', jobId);
        // TODO: Implement delete functionality
    };

    return (
        <>
            <div className="recruitment-page">
                <div className="recruitment-container">
                    <div className="recruitment-header-flex">
                        <Header />
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
                            onClick={() => setIsModalOpen(true)}
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
                                onEdit={() => handleEdit(job.id)}
                                onDelete={() => handleDelete(job.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <CreateJobModal onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
}
