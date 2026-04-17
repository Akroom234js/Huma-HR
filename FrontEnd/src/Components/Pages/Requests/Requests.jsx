import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import apiClient from '../../../apiConfig';

const TYPE_CONFIG = {
    'vacation': { icon: 'event', label: 'Annual Leave' },
    'advance': { icon: 'payments', label: 'Advance Request' },
    'equipment': { icon: 'inventory_2', label: 'Equipment Request' },
    'compensation': { icon: 'receipt_long', label: 'Compensation' },
    'data-update': { icon: 'edit_note', label: 'Data Update' },
    'resignation': { icon: 'exit_to_app', label: 'Resignation' },
    'transfer': { icon: 'sync_alt', label: 'Transfer' },
    'promotion': { icon: 'trending_up', label: 'Promotion' },
    'experience-certificate': { icon: 'card_membership', label: 'Exp. Certificate' }
};

const Requests = () => {
    const { category = 'all' } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, current: 0 });

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                type: category,
                status: activeTab,
                per_page: 10
            };
            const res = await apiClient.get('/requests', { params });
            const rawRequests = res.data?.data?.requests || [];
            
            // Map backend data to frontend structure
            const mapped = rawRequests.map(req => ({
                id: req.id,
                employee: { 
                    name: req.employee_profile?.full_name || '—', 
                    role: req.employee_profile?.job_title || '—', 
                    avatar: req.employee_profile?.profile_pic_url 
                },
                type: req.type,
                requestType: TYPE_CONFIG[req.type] || { icon: 'help', label: req.type },
                status: req.status.charAt(0).toUpperCase() + req.status.slice(1),
                data: req.details || {}
            }));

            setRequests(mapped);
            setStats(res.data?.data?.stats || { pending: 0, approved: 0, rejected: 0 });
            setPagination({
                total: res.data?.data?.pagination?.total || 0,
                current: mapped.length
            });
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setIsLoading(false);
        }
    }, [category, activeTab]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleCategoryChange = (newCategory) => {
        navigate(`/request/${newCategory === 'all' ? '' : newCategory}`);
    };

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
                        value={stats.pending} 
                        trend={stats.pending > 0 ? `Needs attention` : "Clear"} 
                    />
                    <StatCard 
                        icon="verified" 
                        label="Total Approved" 
                        value={stats.approved} 
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

                {isLoading ? (
                    <div className="req-loading">Loading requests...</div>
                ) : (
                    <RequestList requests={requests} />
                )}

                <Pagination totalRequests={pagination.total} currentCount={pagination.current} />
            </MainContent>
        </div>
    );
};

export default Requests;
