import React, { useState } from 'react';
import Header from '../Header/Header';
import Tabs from '../Tabs/Tabs';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import CandidateCard from '../CandidateCard/CandidateCard';
import './Recrutment.css';
import JobCard from '../JobCard/JobCard';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import CreateJobModal from '../CreateJobModal/CreateJobModal';

const Recruitment = () => {
    const [activeTab, setActiveTab] = useState('make-offer');
    const [selectedDepartment, setSelectedDepartment] = useState('');
<<<<<<< HEAD
    const ToScheduleInterview=false
    const tabs = [
        { id: 'interview-happening', label: 'Interview Happening', count: 3 },
        { id: 'schedule-interview', label: 'To Schedule Interview', count: 8 },
        { id: 'make-offer', label: 'To Make Offer', count: 6 },
    ];
=======
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    const [jobs, setJobs] = useState([
        { id: 1, title: 'Senior UX Designer', description: 'We are looking for a Senior UX Designer to lead our design team and create intuitive user experiences.', department: 'Design Department', salary: '$85k - $120k', applicants: 42 },
        { id: 2, title: 'Backend Developer', description: 'Join our engineering team to build scalable and high-performance backend systems using modern technologies.', department: 'Engineering', salary: '$90k - $135k', applicants: 18 },
        { id: 3, title: 'Marketing Manager', description: 'Drive our growth strategy and manage our marketing campaigns across various digital channels.', department: 'Marketing', salary: '$70k - $105k', applicants: 29 },
    ]);
>>>>>>> e8889062dafbe438e966073bbb19b185f423f9e4

    const departmentOptions = [
        { value: '', label: 'All Departments' },
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'product', label: 'Product Management' },
        { value: 'marketing', label: 'Marketing' },
    ];

    const candidates = [
        {
            id: 1,
            name: 'James Smith',
            department: 'Engineering',
            position: 'Senior Frontend Developer',
            score: 92,
            skills: ['React', 'TypeScript']
        },
        {
            id: 2,
            name: 'Anna Lee',
            department: 'Design',
            position: 'Product Designer',
            score: 88,
            skills: ['Figma', 'UI/UX']
        },
        {
            id: 3,
            name: 'Robert Fox',
            department: 'Product',
            position: 'Product Manager',
            score: 74,
            skills: ['Agile', 'Scrum']
        },
        {
            id: 4,
            name: 'Maria Klein',
            department: 'Marketing',
            position: 'Marketing Specialist',
            score: 81,
            skills: ['SEO', 'Content']
        },
        {
            id: 5,
            name: 'David Thompson',
            department: 'Engineering',
            position: 'DevOps Engineer',
            score: 45,
            skills: ['AWS', 'Docker']
        },
        {
            id: 6,
            name: 'Lisa Chen',
            department: 'Design',
            position: 'UX Researcher',
            score: 95,
            skills: ['Research', 'Testing']
        },
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

    const updatedTabs = [
        { id: 'interview-happening', label: 'Interview Happening', count: 3 },
        { id: 'schedule-interview', label: 'To Schedule Interview', count: 8 },
        { id: 'make-offer', label: 'To Make Offer', count: 6 },
        { id: 'opening-jobs', label: 'Opening Jobs', count: jobs.length },
    ];
    
    return (
        <div className="recruitment-page">
            <div className="recruitment-container">
                <div className="recruitment-header-flex">
                    <Header onCreateJob={() => { setEditingJob(null); setIsModalOpen(true); }} />
                    <ThemeToggle />
                </div>

                <Tabs tabs={updatedTabs} activeTab={activeTab} onTabChange={setActiveTab} />

                <FilterDropdown
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    options={departmentOptions}
                />

                {/* <div className="candidates-grid">
                    {candidates.map((candidate) => (
                        <CandidateCard key={candidate.id} candidate={candidate}  />
                    ))}
                </div> */}
                <div className="candidates-grid">
                    {/* إذا كان التبويب المختار هو الوظائف، اعرض JobCard */}
                    {activeTab === 'opening-jobs' ? (
                        jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onDelete={() => handleDeleteJob(job.id)}
                                onEdit={() => handleOpenEdit(job)}
                            />
                        ))
                    ) : (
                        /* في أي تبويب آخر (مثل Interview Happening)، اعرض CandidateCard */
                        candidates.map((candidate) => (
                            <CandidateCard key={candidate.id} candidate={candidate} />
                        ))
                    )}
                </div>
                <div className="view-more">
                    <button className="view-more-btn">
                        View more applicants
                        <span className="material-symbols-outlined">expand_more</span>
                    </button>
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
        </div>
    );
};

export default Recruitment;
