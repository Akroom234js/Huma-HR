import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Requests.css';
import MainContent from './Layout/MainContent/MainContent';
import PageHeader from './Layout/PageHeader/PageHeader';
import StatsContainer from './Statistics/StatsContainer/StatsContainer';
import StatCard from './Statistics/StatCard/StatCard';
import TabSwitcher from './Navigation/TabSwitcher/TabSwitcher';
import CategoryFilter from './Navigation/CategoryFilter/CategoryFilter';
import RequestList from './Requests/RequestList/RequestList';
import Pagination from './UI/Pagination/Pagination';

// Enhanced Mock data for all 10 request types
const requestsData = [
    {
        id: 1,
        employee: { name: 'Sarah Miller', role: 'Senior Product Designer', avatar: null },
        type: 'vacation',
        requestType: { icon: 'event', label: 'Annual Leave' },
        status: 'Pending',
        data: {
            leaveType: 'Annual',
            range: 'OCT 12 - OCT 16',
            totalDays: 4,
            remainingBalance: 12
        }
    },
    {
        id: 2,
        employee: { name: 'Marcus Chen', role: 'Backend Engineer', avatar: null },
        type: 'advance',
        requestType: { icon: 'payments', label: 'Advance Request' },
        status: 'Approved',
        data: {
            amount: '$2,500.00',
            installments: 5,
            reason: 'Home renovation deposit'
        }
    },
    {
        id: 3,
        employee: { name: 'Elena Rodriguez', role: 'HR Specialist', avatar: null },
        type: 'equipment',
        requestType: { icon: 'inventory_2', label: 'Equipment Request' },
        status: 'Rejected',
        data: {
            deviceType: 'Laptop',
            specs: 'MacBook Pro 16" M3 Max',
            reason: 'Performance issues with current device'
        }
    },
    {
        id: 4,
        employee: { name: 'David Kim', role: 'Data Analyst', avatar: null },
        type: 'vacation',
        requestType: { icon: 'medical_services', label: 'Sick Leave' },
        status: 'Pending',
        data: {
            leaveType: 'Sick',
            range: 'OCT 05 - OCT 07',
            totalDays: 2,
            remainingBalance: 4
        }
    },
    {
        id: 5,
        employee: { name: 'Aisha Hassan', role: 'UX Researcher', avatar: null },
        type: 'compensation',
        requestType: { icon: 'receipt_long', label: 'Compensation' },
        status: 'Pending',
        data: {
            amount: '$450.00',
            date: '2024-03-20',
            category: 'Travel'
        }
    },
    {
        id: 6,
        employee: { name: 'Tom Wilson', role: 'Sales Lead', avatar: null },
        type: 'data-update',
        requestType: { icon: 'edit_note', label: 'Data Update' },
        status: 'Approved',
        data: {
            field: 'Address',
            before: '123 Oak St, NY',
            after: '456 Pine St, NJ'
        }
    },
    {
        id: 7,
        employee: { name: 'Julia Roberts', role: 'Security Engineer', avatar: null },
        type: 'resignation',
        requestType: { icon: 'exit_to_app', label: 'Resignation' },
        status: 'Pending',
        data: {
            lastWorkingDay: '2024-05-15',
            keywords: 'Career growth, personal projects'
        }
    },
    {
        id: 8,
        employee: { name: 'Kevin Hart', role: 'Fullstack Dev', avatar: null },
        type: 'transfer',
        requestType: { icon: 'sync_alt', label: 'Transfer' },
        status: 'Pending',
        data: {
            currentDept: 'Engineering',
            newDept: 'Product',
            newTitle: 'Product Engineer'
        }
    },
    {
        id: 9,
        employee: { name: 'Emma Stone', role: 'Junior Marketing', avatar: null },
        type: 'promotion',
        requestType: { icon: 'trending_up', label: 'Promotion' },
        status: 'Pending',
        data: {
            currentTitle: 'Junior Marketing Associate',
            proposedTitle: 'Marketing Specialist',
            salaryIncrease: '15%'
        }
    },
    {
        id: 10,
        employee: { name: 'Ryan Gosling', role: 'Lead Designer', avatar: null },
        type: 'experience-certificate',
        requestType: { icon: 'card_membership', label: 'Exp. Certificate' },
        status: 'Approved',
        data: {
            purpose: 'Bank Loan Application'
        }
    }
];

const Requests = () => {
    const { category = 'all' } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');

    const handleCategoryChange = (newCategory) => {
        navigate(`/request/${newCategory === 'all' ? '' : newCategory}`);
    };

    const filteredRequests = useMemo(() => {
        return requestsData.filter(req => {
            const matchesStatus = activeTab === 'all' || req.status.toLowerCase() === activeTab;
            const matchesCategory = category === 'all' || req.type === category;
            return matchesStatus && matchesCategory;
        });
    }, [activeTab, category]);

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
                    activeCategory={category} 
                    onCategoryChange={handleCategoryChange} 
                />

                <RequestList requests={filteredRequests} />

                <Pagination totalRequests={requestsData.length} currentCount={filteredRequests.length} />
            </MainContent>
        </div>
    );
};

export default Requests;
