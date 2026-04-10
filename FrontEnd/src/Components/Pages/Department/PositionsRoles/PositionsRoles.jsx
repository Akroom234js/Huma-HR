import React, { useState, useEffect, useCallback } from 'react';
import '../PositionsRoles/PositionsRoles.css';
import AddDepartment from '../AddDepartment/AddDepartment';
import AddRole from '../AddRole/AddRole'
import FilterDropdown from "../../../FilterDropdown/FilterDropdown";
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import apiClient from '../../../../apiConfig';

const PositionsRoles = () => {
    const { t } = useTranslation('Department/PositionRoles')
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
    const [positions, setPositions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([{ value: '', label: t('all') }]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPositions = useCallback(async () => {
        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (selectedDepartment) params.department_id = selectedDepartment;

            const res = await apiClient.get('/positions', { params });
            setPositions(res.data?.data?.positions || []);
        } catch (error) {
            console.error("Failed to fetch positions", error);
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

    const addDeparment = () => {
        setIsAddDepartmentOpen(true);
        document.body.style.overflow = 'hidden';
    }
    
    const closeAddDepartment = () => {
        setIsAddDepartmentOpen(false);
        document.body.style.overflow = 'auto';
    }

    const addRole = () => {
        setIsAddRoleOpen(true);
        document.body.style.overflow = 'hidden';
    }

    const closeAddRole = () => {
        setIsAddRoleOpen(false);
        document.body.style.overflow = 'auto';
    }

    const handleDeletePosition = async (id) => {
        if (window.confirm("Are you sure you want to delete this position?")) {
            try {
                await apiClient.delete(`/positions/${id}`);
                fetchPositions();
            } catch (error) {
                alert(error.response?.data?.message || "Failed to delete position");
            }
        }
    }

    const table = positions.map((pos) => (
        <div className='row-table-co' key={pos.id}>
            <p className='row-table1'>{pos.title}</p>
            <p>{pos.department?.name || 'N/A'}</p>
            <p>{pos.openings || 0}</p>
            <p className='row-table3'>{pos.description}</p>
            <div className='button-actions'>
                <button><i className='bi bi-pen'></i></button>
                <button onClick={() => handleDeletePosition(pos.id)}><i className='bi bi-trash'></i></button>
                <button><i className='bi bi-eye-fill'></i></button>
            </div>
        </div>
    ));

    const tablemobile = positions.slice(0, 3).map((pos) => (
        <div className='row-table-co-mobile' key={pos.id}>
            <div>
                <p>{t('position')} : </p>
                <p className='row-table1'> {pos.title}</p>
            </div>
            <div>  
                <p>{t('name')} : </p>
                <p>{pos.department?.name || 'N/A'}</p>
            </div>
            <div>
                <p>{t('opening')} : </p>
                <p> {pos.openings || 0}</p>
            </div>
            <div>
                <p>{t('Role')} : </p>
                <p className='row-table3'> {pos.description}</p>
            </div>
            <div className='button-actions'>
                <button><i className='bi bi-pen'></i></button>
                <button onClick={() => handleDeletePosition(pos.id)}><i className='bi bi-trash'></i></button>
                <button><i className='bi bi-eye-fill'></i></button>
            </div>
        </div>
    ));

    return (
        <div className="page-container">
            {isAddDepartmentOpen && (
                <div className='adddepartment'>
                    <AddDepartment 
                        onClose={closeAddDepartment} 
                        onSuccess={() => { fetchDepartments(); fetchPositions(); }} 
                    />
                </div>
            )}
            {isAddRoleOpen && (
                <div className='add-role'>
                    <AddRole 
                        onClose={closeAddRole} 
                        onSuccess={fetchPositions} 
                    />
                </div>
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
                <button onClick={addDeparment}><i className='bi bi-plus'></i> {t('adddep')}</button>
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
                            placeholder="All Departments"
                        />
                    </div>
                    <div className='addroleco'>
                        <button className='addrole' onClick={addRole}><i className='bi bi-plus'></i> {t('addrole')}</button>
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
                        {table}
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
