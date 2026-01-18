import '../ScheduleInterview/ScheduleInterview'
import '../Main-page/Recrutment'
import Header from '../Header/Header';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import Tabs from '../Tabs/Tabs';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
// import CandidateCard from '../CandidateCard/CandidateCard';
import CandidateCardToScheduleInterview from '../CandidateCardScheduleInterview/CandidateCardToScheduleInterview';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScheduleInterview from '../ScheduleInterview/ScheduleInterview';
export default function ToScheduleInterview(){
     const [activeTab, setActiveTab] = useState('schedule-interview');
        const [selectedDepartment1, setSelectedDepartment1] = useState('');
        const [visisibilty,setVisisibilty]=useState('shinhidden')
        const {t}=useTranslation("Recrutment/ToScheduleInterview")
        const tabs = [
            { id: 'interview-happening', label: t('Tabs.Interview-Happening'), count: 3 },
            { id: 'schedule-interview', label: t('Tabs.To-Schedule-Interview'), count: 8 },
            { id: 'make-offer', label: t('Tabs.To-Make-Offer'), count: 6 },
        ];
    
        const departmentOptions = [
            { value: '', label: t('departmentOptions.all')},
            { value: 'engineering', label: 'Engineering' },
            { value: 'design', label: 'Design' },
            { value: 'product', label: 'Product Management' },
            { value: 'marketing', label: 'Marketing' },
        ];
    
        const candidates = [
            {
                id: 1,
                name: 'James Smith1',
                department: 'Engineering',
                position: 'Senior Frontend Developer',
                score: 92,
                skills: ['React', 'TypeScript']
            },
            {
                id: 2,
                name: 'Anna Lee1',
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
            }
        ];
    return(<>
    <div className='shinvisibility'>
            <ScheduleInterview/>
        </div>
     <div className="recruitment-page ">
        
                <div className="recruitment-container">
                    <div className="recruitment-header-flex">
                        <Header />
                        <ThemeToggle />
                    </div>
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    
                    <FilterDropdown
                        value={selectedDepartment1}
                        onChange={setSelectedDepartment1}
                        options={departmentOptions}
                    />
    
                    <div className="candidates-grid">
                        {candidates.map((candidate) => (
                            <CandidateCardToScheduleInterview key={candidate.id} candidate={candidate}/>
                            // <CandidateCard key={candidate.id} candidate={candidate}/>
                        ))}
                    </div>
    
                    <div className="view-more">
                        <button className="view-more-btn">
                           { t('applicants')}
                            <span className="material-symbols-outlined">expand_more</span>
                        </button>
                    </div>
                </div>
            </div>
    </>)
}