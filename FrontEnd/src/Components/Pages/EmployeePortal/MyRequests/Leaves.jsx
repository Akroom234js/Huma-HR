import React, { useState, useMemo, useEffect } from 'react';
import './Leaves.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import Requestaleave from './Requestaleave';
import apiClient from '../../../../apiConfig';

const Leaves = () => {
    const { t, i18n } = useTranslation("EmployeePortal/EmployeePortalLeaves");
    const isAr = i18n.language === "ar";

    const [leaveType, setLeaveType] = useState("");
    const [status, setStatus] = useState("");
    
    const [leavesList, setLeavesList] = useState([]);
    const [balances, setBalances] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data from backend on mount
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [balancesRes, requestsRes, typesRes] = await Promise.all([
                apiClient.get('/my-leave-balances'),
                apiClient.get('/my-requests'),
                apiClient.get('/leave-types')
            ]);
            setBalances(balancesRes.data.data || []);
            setLeavesList(requestsRes.data.data || []);
            setLeaveTypes(typesRes.data.data || []);
        } catch (error) {
            console.error('Error fetching requests data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // States for Modals
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");

    // Dynamic stats based on leave balances from backend (Cleanly localized per language)
    const statCards = useMemo(() => {
        if (!balances || balances.length === 0) {
            return [
                { label: isAr ? "رصيد إجازة سنوية" : "Annual Leave Balance", value: "0", icon: "flight_takeoff" },
                { label: isAr ? "رصيد إجازة مرضية" : "Sick Leave Balance", value: "0", icon: "medication" }
            ];
        }

        return balances.map(b => {
            const nameEn = b.leave_type?.name_en || 'Leave';
            const nameAr = b.leave_type?.name_ar || 'إجازة';
            const name = isAr ? nameAr : nameEn;
            const label = isAr ? `رصيد ${name}` : `${name} Balance`;

            let icon = 'event_available';
            const lowerEn = nameEn.toLowerCase();
            if (lowerEn.includes('sick')) {
                icon = 'medication';
            } else if (lowerEn.includes('annual') || lowerEn.includes('vacation')) {
                icon = 'flight_takeoff';
            } else if (lowerEn.includes('emergency')) {
                icon = 'emergency';
            } else if (lowerEn.includes('personal')) {
                icon = 'person';
            }

            return {
                label: label,
                value: String(b.remaining ?? 0),
                icon: icon
            };
        });
    }, [balances, isAr]);

    // Filter logic with mapping database fields for all kinds of requests
    const filteredLeaves = useMemo(() => {
        return leavesList
            .filter(item => {
                const matchType = !leaveType || (item.type && item.type.toLowerCase() === leaveType.toLowerCase());
                const matchStatus = !status || (item.status && item.status.toLowerCase() === status.toLowerCase());
                return matchType && matchStatus;
            })
            .map(item => {
                let typeLabel = item.type;
                let description = '-';
                let durationText = '-';

                const details = item.details ?? {};
                
                switch (item.type?.toLowerCase()) {
                    case 'vacation':
                    case 'leave':
                    case 'sick':
                    case 'annual':
                    case 'emergency':
                    case 'personal': {
                        const start = details.start_date || item.dates || '-';
                        const dur = details.duration || item.duration || 1;
                        let end = details.end_date || item.datee;
                        if (!end && start && start !== '-') {
                            try {
                                const startDateObj = new Date(start);
                                startDateObj.setDate(startDateObj.getDate() + Number(dur) - 1);
                                end = startDateObj.toISOString().split('T')[0];
                            } catch (e) {
                                end = '-';
                            }
                        }
                        typeLabel = isAr ? (details.leave_type_name_ar || details.leave_type_name || t("types.vacation")) : (details.leave_type_name || t("types.vacation"));
                        description = isAr ? `من: ${start} إلى: ${end}` : `From: ${start} To: ${end}`;
                        durationText = `${dur} ${t("Days")}`;
                        break;
                    }
                        
                    case 'advance':
                        typeLabel = t("types.advance");
                        description = isAr
                            ? `المبلغ: $${details.amount || '-'} | الأقساط: ${details.installments || '-'} أشهر`
                            : `Amount: $${details.amount || '-'} | Installments: ${details.installments || '-'} Months`;
                        durationText = '-';
                        break;
                        
                    case 'equipment':
                        typeLabel = t("types.equipment");
                        description = isAr
                            ? `الجهاز: ${details.deviceType || '-'} | المواصفات: ${details.specs || '-'}`
                            : `Device: ${details.deviceType || '-'} | Specs: ${details.specs || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'compensation':
                        typeLabel = t("types.compensation");
                        description = isAr
                            ? `المبلغ: $${details.amount || '-'} | البند: ${details.category || '-'}`
                            : `Amount: $${details.amount || '-'} | Category: ${details.category || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'data-update':
                        typeLabel = t("types.dataUpdate");
                        description = isAr
                            ? `البيان: ${details.field || '-'} | القيمة المقترحة: ${details.after || '-'}`
                            : `Field: ${details.field || '-'} | Proposed: ${details.after || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'resignation':
                        typeLabel = t("types.resignation");
                        description = isAr
                            ? `آخر يوم عمل: ${details.lastWorkingDay || '-'}`
                            : `Last Day: ${details.lastWorkingDay || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'transfer':
                        typeLabel = t("types.transfer");
                        description = isAr
                            ? `القسم الحالي: ${details.currentDept || '-'} ← الجديد: ${details.newDept || '-'}`
                            : `Current: ${details.currentDept || '-'} → New: ${details.newDept || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'promotion':
                        typeLabel = t("types.promotion");
                        description = isAr
                            ? `المسمى الحالي: ${details.currentTitle || '-'} ← المقترح: ${details.proposedTitle || '-'}`
                            : `Current: ${details.currentTitle || '-'} → Proposed: ${details.proposedTitle || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'experience-certificate':
                        typeLabel = t("types.expCertificate");
                        description = isAr
                            ? `الغرض: ${details.purpose || '-'}`
                            : `Purpose: ${details.purpose || '-'}`;
                        durationText = '-';
                        break;
                        
                    default:
                        typeLabel = item.type || t("types.vacation");
                        description = item.reason || '-';
                        durationText = '-';
                        break;
                }

                return {
                    id: item.id,
                    type: typeLabel,
                    description: description,
                    duration: durationText,
                    status: item.status || 'pending',
                    reson: item.reason || '-'
                };
            });
    }, [leavesList, leaveType, status, isAr, t]);

    // Handlers for Request a leave modal
    const handleOpenRequestModal = () => {
        setIsRequestModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseRequestModal = () => {
        setIsRequestModalOpen(false);
        document.body.style.overflow = 'auto';
    };

    const handleAddLeaveRequest = () => {
        fetchData();
        handleCloseRequestModal();
    };

    // Reason details modal logic
    const openModal = (reason) => {
        setSelectedReason(reason);
        setModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedReason("");
        document.body.style.overflow = 'auto';
    };

    return (
        <div className={`portal-page-container-leaves fade-in-section ${isAr ? "rtl" : "ltr"}`}>
            {/* Modal for Submitting New Request */}
            <Requestaleave 
                isOpen={isRequestModalOpen} 
                onClose={handleCloseRequestModal} 
                onSubmit={handleAddLeaveRequest}
                leaveTypes={leaveTypes}
            />

            {/* Page Header */}
            <div className="leaves-portal-header-wrapper">
                <div className="leaves-portal-title-area">
                    <span className="premium-subtitle">{t("subtitle")}</span>
                    <h1>{t("title")}</h1>
                </div>
                <div className="leaves-header-actions-wrapper">
                    <button className="premium-btn-primary" onClick={handleOpenRequestModal} type="button">
                        <span className="material-symbols-outlined">add</span>
                        <span className="btn-glow-text">{t("SubmitRequest")}</span>
                    </button>
                    <div className="leaves-theme-toggle">
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="premium-stats-grid">
                {statCards.map((s, i) => (
                    <div className="premium-stat-card" key={i}>
                        <div className="stat-card-header">
                            <span className="premium-stat-label">{s.label}</span>
                            <div className="stat-icon-wrapper">
                                <span className="material-symbols-outlined">{s.icon}</span>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <span className="premium-stat-value">{s.value}</span>
                            <span className="premium-stat-unit">{t("Days")}</span>
                        </div>
                        <div className="stat-card-glow"></div>
                    </div>
                ))}
            </div>

            {/* Filter Row Section */}
            <div className="premium-card-section">
                <div className="filter-section-header">
                    <div className="section-title-with-icon">
                        <span className="material-symbols-outlined">history</span>
                        <h3>{t("log")}</h3>
                    </div>
                    <div className="filters-controls-row">
                        <FilterDropdown
                            value={leaveType}
                            onChange={setLeaveType}
                            options={[
                                { value: "", label: t('types.all') }, 
                                { value: "vacation", label: t('types.vacation') },
                                { value: "advance", label: t('types.advance') },
                                { value: "equipment", label: t('types.equipment') },
                                { value: "compensation", label: t('types.compensation') },
                                { value: "data-update", label: t('types.dataUpdate') },
                                { value: "resignation", label: t('types.resignation') },
                                { value: "transfer", label: t('types.transfer') },
                                { value: "promotion", label: t('types.promotion') },
                                { value: "experience-certificate", label: t('types.expCertificate') }
                            ]}
                        />
                        <FilterDropdown
                            value={status}
                            onChange={setStatus}
                            options={[
                                { value: "", label: t('filters.status') }, 
                                { value: "approved", label: t('status.approved') }, 
                                { value: "pending", label: t('status.pending') }, 
                                { value: "rejected", label: t('status.rejected') }
                            ]}
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="premium-table-container">
                    <table className="premium-data-table">
                        <thead>
                            <tr>
                                <th>{t("TypeLeave")}</th>
                                <th>{t('Description')}</th>
                                <th>{t('duration')}</th>
                                <th>{t('statusleave')}</th>
                                <th>{t('Details')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="premium-empty-cell">
                                        <div className="empty-state-content">
                                            <span className="material-symbols-outlined premium-spinner">sync</span>
                                            <p>{t("loading")}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLeaves.length > 0 ? (
                                filteredLeaves.map(row => (
                                    <tr key={row.id} className="premium-table-row">
                                        <td className="type-column-bold">
                                            <div className="type-badge-inline">
                                                <span className="material-symbols-outlined icon-xs">
                                                    {String(row.type).toLowerCase().includes('sick') || String(row.type).includes('مرض') ? 'medical_services' : 
                                                     (String(row.type).toLowerCase().includes('annual') || String(row.type).includes('سنو') ? 'beach_access' : 'assignment')}
                                                </span>
                                                {row.type}
                                            </div>
                                        </td>
                                        <td>{row.description}</td>
                                        <td><strong>{row.duration}</strong></td>
                                        <td>
                                            <span className={`premium-status-badge ${row.status.toLowerCase()}`}>
                                                {t(`status.${row.status.toLowerCase()}`, row.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {row.status.toLowerCase() === "rejected" ? (
                                                <button 
                                                    className="premium-btn-view" 
                                                    onClick={() => openModal(row.reson)}
                                                    type="button"
                                                >
                                                    <span className="material-symbols-outlined icon-view">visibility</span>
                                                    {t('View')}
                                                </button>
                                            ) : (
                                                <span className="empty-dash">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="premium-empty-cell">
                                        <div className="empty-state-content">
                                            <span className="material-symbols-outlined empty-icon">search_off</span>
                                            <p>{t('NoData')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Policy Overview Section */}
            <div className="premium-card-section policy-section">
                <div className="policy-header">
                    <span className="material-symbols-outlined">policy</span>
                    <h3 className="PolicyOverview">{t("PolicyOverview")}</h3>
                </div>
                <div className="policy-body">
                    <div className="policy-group">
                        <h4>{t("Types")}</h4>
                        <ul className="premium-policy-list">
                            <li>
                                <div className="policy-type-meta">
                                    <span className="premium-policy-badge bg-amber">{t("Sick")}</span>
                                </div>
                                <p className="policy-type-description">{t("Sick1")}</p>
                            </li>
                            <li>
                                <div className="policy-type-meta">
                                    <span className="premium-policy-badge bg-blue">{t("Annual")}</span>
                                </div>
                                <p className="policy-type-description">{t("Annual1")}</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Reason Modal Overlay */}
            {modalOpen && (
                <div className="premium-modal-overlay" onClick={closeModal}>
                    <div className="premium-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="premium-modal-header">
                            <div className="modal-title-with-icon">
                                <span className="material-symbols-outlined text-red">info</span>
                                <h3>{t('MoreDetails')}</h3>
                            </div>
                            <button className="premium-close-icon" onClick={closeModal} aria-label="Close">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="premium-modal-body">
                            <div className="reason-container">
                                <strong>{t("reviewerReason")}</strong>
                                <p className="premium-reason-text">{selectedReason}</p>
                            </div>
                        </div>
                        <div className="premium-modal-footer">
                            <button className="premium-btn-secondary" onClick={closeModal}>
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;
