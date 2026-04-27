import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SalaryAdjustments.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import apiClient from '../../../../apiConfig';

const SalaryAdjustments = () => {
    const { t } = useTranslation('SalaryManagement/SalaryAdjustments');
    
    // States for data
    const [adjustmentsData, setAdjustmentsData] = useState([]);
    const [stats, setStats] = useState({
        total_adjustments_ytd: 0,
        vs_last_year: '0%',
        avg_adjustment_percent: '0%'
    });
    const [loading, setLoading] = useState(true);

    // States for filtering
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("All");

    useEffect(() => {
        fetchAdjustments();
    }, []);

    const fetchAdjustments = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/salary-adjustments');
            const data = response.data.data;
            setAdjustmentsData(data.adjustments || []);
            setStats(data.stats || {});
        } catch (error) {
            console.error('Error fetching salary adjustments:', error);
        } finally {
            setLoading(false);
        }
    };

    // States for Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");

    // Filter Logic
    const filteredData = adjustmentsData.filter(row => {
        const name = row.employee_profile?.full_name || "";
        const title = row.employee_profile?.job_title || "";
        const typeName = row.adjustment_type?.name || "";

        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              title.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = filterType === "All" || typeName === filterType;
        
        return matchesSearch && matchesType;
    });

    // Opening Modal
    const openModal = (reason) => {
        setSelectedReason(reason);
        setModalOpen(true);
        document.body.style.overflow = 'hidden'; // prevent background scrolling
        
        // Push ThemeToggle behind blur if necessary
        const themeToggle = document.querySelector(".mobile-toggle");
        if(themeToggle) themeToggle.style.zIndex = "-1";
    };

    // Closing Modal
    const closeModal = () => {
        setModalOpen(false);
        setSelectedReason("");
        document.body.style.overflow = 'auto'; // allow background scrolling
        
        // Restore ThemeToggle z-index
        const themeToggle = document.querySelector(".mobile-toggle");
        if(themeToggle) themeToggle.style.zIndex = "10";
    };

    return (
        <div className="sm-page">
            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <header className="sm-header adjustments-header">
                <div>
                    <h1 className="sm-title">{t('Title', 'Salary Adjustments History')}</h1>
                </div>
            </header>


            {/* Top Stat Cards */}
            <div className="adjustments-cards-container">
                <div className="adjustments-stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon icon-blue">
                            <i className="bi bi-clock-history"></i>
                        </div>
                        {t('TotalAdjustments', 'Total Adjustments')} <span className="ytd-badge">YTD</span>
                    </div>
                    <h2 className="stat-card-value">{stats.total_adjustments_ytd}</h2>
                    <div className="stat-card-subtext">
                        <i className="bi bi-arrow-up-right"></i> {stats.vs_last_year} vs last year
                    </div>
                </div>

                <div className="adjustments-stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon icon-purple">
                            <i className="bi bi-percent"></i>
                        </div>
                        {t('AvgAdjustment', 'Avg. Adjustment %')}
                    </div>
                    <h2 className="stat-card-value">{stats.avg_adjustment_percent}</h2>
                    {/* No subtext for average adjustment in design */}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="adjustments-main-content">
                <div className="adjustments-toolbar">
                    <div className="adjustments-search">
                        <i className="bi bi-search"></i>
                        <input 
                            type="text" 
                            placeholder={t('SearchEmployee', 'Search by Employee...')} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="adjustments-filter-select" 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">{t('FilterAll', 'All Types')}</option>
                        <option value="Promotion">{t('Promotion', 'Promotion')}</option>
                        <option value="Merit Increase">{t('Merit', 'Merit Increase')}</option>
                        <option value="Cost of Living">{t('CostOfLiving', 'Cost of Living')}</option>
                        <option value="Annual Review">{t('AnnualReview', 'Annual Review')}</option>
                    </select>
                </div>

                <div className="adjustments-table-container">
                    <table className="adjustments-table">
                        <thead>
                            <tr>
                                <th>{t('Employee', 'EMPLOYEE')}</th>
                                <th>{t('OldSalary', 'OLD SALARY')}</th>
                                <th>{t('NewSalary', 'NEW SALARY')}</th>
                                <th>{t('Type', 'TYPE')}</th>
                                <th>{t('Date', 'DATE')}</th>
                                <th>{t('By', 'BY')}</th>
                                <th>{t('Change', 'CHANGE %')}</th>
                                <th>{t('ReasonCol', 'REASON')}</th> {/* Replaced Actions */}
                            </tr>
                        </thead>
                        <tbody>
                             {loading ? (
                                 <tr>
                                     <td colSpan="8" style={{textAlign: 'center', padding: '30px'}}>{t('Loading', 'Loading...')}</td>
                                 </tr>
                             ) : filteredData.length > 0 ? filteredData.map(row => {
                                 const initials = row.employee_profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
                                 const changePercent = row.current_salary > 0 
                                     ? (((row.new_salary - row.current_salary) / row.current_salary) * 100).toFixed(1)
                                     : 0;
                                 const typeLabel = row.custom_type_name || row.adjustment_type?.name || 'Adjustment';

                                 return (
                                 <tr key={row.id}>
                                     <td>
                                         <div className="adj-user-cell">
                                             <div className="adj-user-avatar" style={{backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6'}}>
                                                 {initials}
                                             </div>
                                             <div className="adj-user-details">
                                                 <span className="adj-user-name">{row.employee_profile?.full_name}</span>
                                                 <span className="adj-user-role">{row.employee_profile?.job_title}</span>
                                             </div>
                                         </div>
                                     </td>
                                     <td className="adj-old-salary">${row.current_salary}</td>
                                     <td className="adj-new-salary">${row.new_salary}</td>
                                     <td>
                                         <span className={`adj-type-badge tag-${(row.adjustment_type?.name || 'other').toLowerCase().replace(/ /g, '-')}`}>
                                             {typeLabel}
                                         </span>
                                     </td>
                                     <td>{new Date(row.effective_date).toLocaleDateString()}</td>
                                     <td>{row.creator?.name || 'System'}</td>
                                     <td className={parseFloat(changePercent) >= 0 ? "adj-change-positive" : "adj-change-negative"}>
                                         {parseFloat(changePercent) >= 0 ? '+' : ''}{changePercent}%
                                     </td>
                                     <td>
                                         <button className="btn-view-reason" onClick={() => openModal(row.adjustment_reason)}>
                                             {t('View', 'عرض')}
                                         </button>
                                     </td>
                                 </tr>
                                 );
                             }) : (
                                <tr>
                                    <td colSpan="8" style={{textAlign: 'center', padding: '30px', color: 'var(--text-muted)'}}>
                                        {t('NoData', 'No matching records found')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reason Modal */}
            {modalOpen && (
                <div className="reason-modal-overlay" onClick={closeModal}>
                    <div className="reason-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="reason-modal-header">
                            <h3>{t('ReasonDetail', 'تفاصيل السبب (Reason)')}</h3>
                            <button onClick={closeModal}><i className="bi bi-x"></i></button>
                        </div>
                        <div className="reason-modal-body">
                            <p className="reason-text">{selectedReason}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryAdjustments;
