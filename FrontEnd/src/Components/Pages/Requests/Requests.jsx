import React, { useState } from 'react';
import './Requests.css';
import MainContent from './Layout/MainContent/MainContent';
import PageHeader from './Layout/PageHeader/PageHeader';
import StatsContainer from './Statistics/StatsContainer/StatsContainer';
import StatCard from './Statistics/StatCard/StatCard';
import TabSwitcher from './Navigation/TabSwitcher/TabSwitcher';
import CategoryFilter from './Navigation/CategoryFilter/CategoryFilter';
import RequestList from './Requests/RequestList/RequestList';
import Pagination from './UI/Pagination/Pagination';

// Placeholder data based on the image provided
const requestsData = [
    {
        employee: { name: 'Sarah Miller', role: 'Senior Product Designer', avatar: null },
        requestType: { icon: 'event', label: 'Annual Leave' },
        date: 'OCT 12 - OCT 16',
        details: '4 DAYS',
        status: 'Pending'
    },
    {
        employee: { name: 'Marcus Chen', role: 'Backend Engineer', avatar: null },
        requestType: { icon: 'payments', label: 'Advance Request' },
        date: 'AMOUNT: $2,500.00',
        details: null,
        status: 'Approved'
    },
    {
        employee: { name: 'Elena Rodriguez', role: 'HR Specialist', avatar: null },
        requestType: { icon: 'inventory_2', label: 'Equipment Request' },
        date: 'MACBOOK PRO 16" M3 MAX',
        details: null,
        status: 'Rejected'
    },
    {
        employee: { name: 'David Kim', role: 'Data Analyst', avatar: null },
        requestType: { icon: 'medical_services', label: 'Sick Leave' },
        date: 'OCT 05 - OCT 07',
        details: '2 DAYS',
        status: 'Pending'
    }
];

const Requests = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [activeCategory, setActiveCategory] = useState('all');

    // Filter logic placeholder
    const filteredRequests = requestsData.filter(req => {
        if (activeTab !== 'all' && req.status.toLowerCase() !== activeTab) return false;
        // Category filtering logic can be added here
        return true;
    });

    return (
        <div className="req-page">
            <MainContent>
                <PageHeader 
                    title="Requests" 
                    subtitle="Manage and approve organization-wide requests" 
                />

                <StatsContainer>
                    <StatCard 
                        icon="assignment_late" 
                        label="Total Pending" 
                        value="12" 
                        trend="+3 this week" 
                    />
                    <StatCard 
                        icon="verified" 
                        label="Total Approved" 
                        value="156" 
                    />
                </StatsContainer>

                <TabSwitcher 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                />

                <CategoryFilter 
                    activeCategory={activeCategory} 
                    onCategoryChange={setActiveCategory} 
                />

                <RequestList requests={filteredRequests} />

                <Pagination totalRequests={28} currentCount={filteredRequests.length} />
            </MainContent>
        </div>
    );
};

export default Requests;
