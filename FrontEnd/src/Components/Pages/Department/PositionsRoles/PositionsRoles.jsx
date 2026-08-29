import React, { useState, useEffect, useCallback } from 'react';
import '../PositionsRoles/PositionsRoles.css';
import AddDepartment from '../AddDepartment/AddDepartment';
import AddRole from '../AddRole/AddRole';
import ViewPositionModal from './ViewPositionModal';
import FilterDropdown from "../../../FilterDropdown/FilterDropdown";
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import apiClient from '../../../../apiConfig';
import { useNotification } from '../../../Notification/NotificationContext';
import DashboardLoader from '../../../Shared/DashboardLoader/DashboardLoader';

const PositionsRoles = () => {
    const { t, i18n } = useTranslation('Department/PositionRoles');
    const isAr = i18n?.language === 'ar';
    const { showSuccess, showError } = useNotification();

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
    const [editingPosition, setEditingPosition] = useState(null);
    const [viewingPositionId, setViewingPositionId] = useState(null);
    const [positions, setPositions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([{ value: '', label: t('all') }]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchPositions = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (selectedDepartment) params.department_id = selectedDepartment;

            const res = await apiClient.get('/positions', { params });
            setPositions(res.data?.data?.positions || []);
        } catch (error) {
            console.error("Failed to fetch positions", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, selectedDepartment]);

    const fetchDepartments = async () => {
        try {
            const res = await apiClient.get('/departments');
            setDepartmentOptions([
                { value: '', label: t('all') },
                ...(res.data?.data?.map(d => ({ value: d.id, label: d.name })) || [])
            ]);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    useEffect(() => {
        fetchPositions();
        fetchDepartments();
    }, [fetchPositions]);

    const addDepartment = () => {
        setIsAddDepartmentOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeAddDepartment = () => {
        setIsAddDepartmentOpen(false);
        document.body.style.overflow = 'auto';
    };

    const handleOpenAddRole = () => {
        setEditingPosition(null);
        setIsAddRoleOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleOpenEditRole = (pos) => {
        setEditingPosition(pos);
        setIsAddRoleOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeAddRole = () => {
        setIsAddRoleOpen(false);
        setEditingPosition(null);
        document.body.style.overflow = 'auto';
    };

    const handleOpenViewRole = (pos) => {
        setViewingPositionId(pos.id);
        document.body.style.overflow = 'hidden';
    };

    const closeViewRole = () => {
        setViewingPositionId(null);
        document.body.style.overflow = 'auto';
    };

    const handleDeletePosition = async (id) => {
        if (window.confirm(t('toast-delete-confirm') || "Are you sure you want to delete this position?")) {
            try {
                await apiClient.delete(`/positions/${id}`);
                fetchPositions();
                showSuccess(t('toast-delete-success') || "Position deleted successfully.");
            } catch (error) {
                showError(error, t('toast-delete-error') || "Failed to delete position");
            }
        }
    };

    const table = positions.length > 0 ? (
        positions.map((pos) => (
            <div className='row-table-co' key={pos.id}>
                <p className='row-table1' title={pos.title}>{pos.title}</p>
                <p>{pos.department?.name || '—'}</p>
                <p>
                    <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--primary-light, rgba(53, 158, 255, 0.1))',
                        color: 'var(--primary-color, #359EFF)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        {pos.assigned_count ?? 0} / {pos.openings || 1}
                    </span>
                </p>
                <p className='row-table3' title={pos.description || ''}>{pos.description || '—'}</p>
                <div className='button-actions'>
                    <button 
                        type="button" 
                        onClick={() => handleOpenEditRole(pos)} 
                        title={t('edit') || "Edit"}
                        aria-label="Edit Position"
                    >
                        <i className='bi bi-pen'></i>
                    </button>
                    <button 
                        type="button" 
                        onClick={() => handleDeletePosition(pos.id)} 
                        title={t('delete') || "Delete"}
                        aria-label="Delete Position"
                    >
                        <i className='bi bi-trash'></i>
                    </button>
                    <button 
                        type="button" 
                        onClick={() => handleOpenViewRole(pos)} 
                        title={t('view') || "View Details"}
                        aria-label="View Position Details"
                    >
                        <i className='bi bi-eye-fill'></i>
                    </button>
                </div>
            </div>
        ))
    ) : (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary, #64748b)' }}>
            {t('no-positions')}
        </div>
    );

    const tablemobile = positions.slice(0, 3).map((pos) => (
        <div className='row-table-co-mobile' key={pos.id}>
            <div>
                <p>{t('position')} : </p>
                <p className='row-table1'> {pos.title}</p>
            </div>
            <div>
                <p>{t('name')} : </p>
                <p>{pos.department?.name || '—'}</p>
            </div>
            <div>
                <p>{t('opening')} : </p>
                <p> {pos.assigned_count ?? 0} / {pos.openings || 1}</p>
            </div>
            <div>
                <p>{t('Role')} : </p>
                <p className='row-table3'> {pos.description || '—'}</p>
            </div>
            <div className='button-actions'>
                <button type="button" onClick={() => handleOpenEditRole(pos)} title="Edit"><i className='bi bi-pen'></i></button>
                <button type="button" onClick={() => handleDeletePosition(pos.id)} title="Delete"><i className='bi bi-trash'></i></button>
                <button type="button" onClick={() => handleOpenViewRole(pos)} title="View"><i className='bi bi-eye-fill'></i></button>
            </div>
        </div>
    ));

    return (
        <div className={`page-container ${isAr ? 'rtl' : 'ltr'}`}>
            {isAddDepartmentOpen && (
                <AddDepartment
                    onClose={closeAddDepartment}
                    onSuccess={() => { fetchDepartments(); fetchPositions(); }}
                />
            )}
            {isAddRoleOpen && (
                <AddRole
                    initialData={editingPosition}
                    onClose={closeAddRole}
                    onSuccess={() => {
                        fetchPositions();
                        closeAddRole();
                    }}
                />
            )}
            {viewingPositionId && (
                <ViewPositionModal
                    positionId={viewingPositionId}
                    onClose={closeViewRole}
                    onEdit={(pos) => {
                        closeViewRole();
                        handleOpenEditRole(pos);
                    }}
                />
            )}
            <header className="page-header Positions-hed">
                <h2>{t('Positions')}</h2>
                <ThemeToggle />
            </header>
            <div className='adddep'>
                <div>
                    <p className='add'>{t('add')}</p>
                    <p className='create'>{t('create')}</p>
                </div>
                <button onClick={addDepartment}><i className='bi bi-plus'></i> {t('adddep')}</button>
            </div>
            <div className='addrole'>
                <div className='header'>
                    <div className='search-filter'>
                        <input
                            type='search'
                            placeholder={t('search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FilterDropdown
                            value={selectedDepartment}
                            onChange={setSelectedDepartment}
                            options={departmentOptions}
                            placeholder={t('all')}
                        />
                    </div>
                    <div className='addroleco'>
                        <button className='addrole' onClick={handleOpenAddRole}><i className='bi bi-plus'></i> {t('addrole')}</button>
                    </div>
                </div>
                <div>
                    <div className='table'>
                        <header className='header inf-head'>
                            <div className='h-position'>{t('position')}</div>
                            <div>{t('name')}</div>
                            <div>{t('opening')}</div>
                            <div className='h-role'>{t('Role')}</div>
                            <div>{t('action')}</div>
                        </header>
                        {isLoading ? (
                            <div style={{ padding: '3rem', textAlign: 'center' }}>
                                <DashboardLoader text={t('loading')} size="md" />
                            </div>
                        ) : table}
                    </div>
                    <div>
                        {tablemobile}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PositionsRoles;
