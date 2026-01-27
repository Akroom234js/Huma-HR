import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../Header/Header';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import Tabs from '../Tabs/Tabs';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import CandidateCard from '../CandidateCard/CandidateCard';
import CreateJobModal from '../CreateJobModal/CreateJobModal';
import '../Main-page/Recrutment.css';
import './ToMakeOffer.css';

export default function ToMakeOffer() {
    const [activeTab, setActiveTab] = useState('make-offer');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    const { t } = useTranslation("Recrutment/ToMakeOffer");

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

    const handleAddJob = (jobData) => {
        // This page primarily lists candidates, but the Header button should still work
        console.log('New job created:', jobData);
        setIsModalOpen(false);
        setEditingJob(null);
    };

    const candidates = [
        {
            id: 1,
            name: 'Sarah Johnson',
            department: 'Engineering',
            position: 'Senior Frontend Developer',
            score: 95,
            skills: ['React', 'TypeScript', 'Node.js'],
            att: ['pdf', 'png']
        },
        {
            id: 2,
            name: 'Michael Chen',
            department: 'Design',
            position: 'Senior UX Designer',
            score: 92,
            skills: ['Figma', 'UI/UX', 'Prototyping'],
            att: ['pdf', 'png']
        },
        {
            id: 3,
            name: 'Emily Rodriguez',
            department: 'Product',
            position: 'Senior Product Manager',
            score: 88,
            skills: ['Agile', 'Scrum', 'Analytics'],
            att: ['pdf', 'word']
        },
        {
            id: 4,
            name: 'David Kim',
            department: 'Engineering',
            position: 'DevOps Engineer',
            score: 90,
            skills: ['AWS', 'Docker', 'Kubernetes'],
            att: ['pdf', 'zip']
        },
        {
            id: 5,
            name: 'Jessica Brown',
            department: 'Marketing',
            position: 'Marketing Manager',
            score: 87,
            skills: ['SEO', 'Content Strategy', 'Analytics'],
            att: ['pdf', 'png']
        },
        {
            id: 6,
            name: 'Thomas Anderson',
            department: 'Design',
            position: 'Product Designer',
            score: 93,
            skills: ['Sketch', 'Design Systems', 'Research'],
            att: ['pdf', 'png']
        }
    ];

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
                        value={selectedDepartment}
                        onChange={setSelectedDepartment}
                        options={departmentOptions}
                    />

                    <div className="candidates-grid">
                        {candidates.map((candidate) => (
                            <CandidateCard key={candidate.id} candidate={candidate} />
                        ))}
                    </div>

                    <div className="view-more">
                        <button className="view-more-btn">
                            {t('applicants')}
                            <span className="material-symbols-outlined">expand_more</span>
                        </button>
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
