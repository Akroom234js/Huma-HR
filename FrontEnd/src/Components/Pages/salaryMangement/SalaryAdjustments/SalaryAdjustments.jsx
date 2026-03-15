import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SalaryAdjustments.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const initialData = [
    {
        id: 1,
        name: "John Doe",
        role: "Engineering Lead",
        initials: "JD",
        initialsBg: "rgba(59, 130, 246, 0.15)",
        initialsColor: "#3b82f6",
        oldSalary: "$85,000",
        newSalary: "$92,500",
        type: "Promotion",
        typeClass: "tag-promotion",
        date: "Sep 15, 2023",
        by: "Sarah Smith",
        change: "+8.8%",
        reason: "Promoted to Engineering Lead after excellent performance in Q2. Demonstrated strong leadership skills and successfully delivered the core project phase."
    },
    {
        id: 2,
        name: "Alice Cooper",
        role: "Product Designer",
        initials: "AC",
        initialsBg: "rgba(168, 85, 247, 0.15)",
        initialsColor: "#a855f7",
        oldSalary: "$62,000",
        newSalary: "$65,100",
        type: "Merit",
        typeClass: "tag-merit",
        date: "Sep 12, 2023",
        by: "Mike Johnson",
        change: "+5.0%",
        reason: "Annual merit increase based on exceeding KPI targets and contributing heavily to the new design system."
    },
    {
        id: 3,
        name: "Robert Wilson",
        role: "Marketing Specialist",
        initials: "RW",
        initialsBg: "rgba(249, 115, 22, 0.15)",
        initialsColor: "#f97316",
        oldSalary: "$45,000",
        newSalary: "$46,350",
        type: "Cost of Living",
        typeClass: "tag-col",
        date: "Sep 01, 2023",
        by: "System Auto",
        change: "+3.0%",
        reason: "Company-wide 3% cost of living adjustment applied automatically by system policy for all eligible employees."
    }
];

const SalaryAdjustments = () => {
    const { t } = useTranslation('SalaryManagement/SalaryAdjustments');
    
    // States for filtering
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("All");

    // States for Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");

    // Filter Logic
    const filteredData = initialData.filter(row => {
        const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              row.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "All" || row.type === filterType;
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
            <header className="sm-header adjustments-header">
                <div>
                    <h1 className="sm-title">{t('Title', 'Salary Adjustments History')}</h1>
                </div>
                <div className="sm-theme-toggle-wrapper" style={{position: 'static'}}>
                    <ThemeToggle />
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
                    <h2 className="stat-card-value">124</h2>
                    <div className="stat-card-subtext">
                        <i className="bi bi-arrow-up-right"></i> +12% vs last year
                    </div>
                </div>

                <div className="adjustments-stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon icon-purple">
                            <i className="bi bi-percent"></i>
                        </div>
                        {t('AvgAdjustment', 'Avg. Adjustment %')}
                    </div>
                    <h2 className="stat-card-value">5.8%</h2>
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
                        <option value="Merit">{t('Merit', 'Merit')}</option>
                        <option value="Cost of Living">{t('CostOfLiving', 'Cost of Living')}</option>
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
                            {filteredData.length > 0 ? filteredData.map(row => (
                                <tr key={row.id}>
                                    <td>
                                        <div className="adj-user-cell">
                                            <div className="adj-user-avatar" style={{backgroundColor: row.initialsBg, color: row.initialsColor}}>
                                                {row.initials}
                                            </div>
                                            <div className="adj-user-details">
                                                <span className="adj-user-name">{row.name}</span>
                                                <span className="adj-user-role">{row.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="adj-old-salary">{row.oldSalary}</td>
                                    <td className="adj-new-salary">{row.newSalary}</td>
                                    <td>
                                        <span className={`adj-type-badge ${row.typeClass}`}>
                                            {t(row.type, row.type)}
                                        </span>
                                    </td>
                                    <td>{row.date}</td>
                                    <td>{row.by}</td>
                                    <td className="adj-change-positive">{row.change}</td>
                                    <td>
                                        <button className="btn-view-reason" onClick={() => openModal(row.reason)}>
                                            {t('View', 'عرض')} {/* View text instead of Icon */}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
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
