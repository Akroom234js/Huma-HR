import React from 'react';
import '../PositionsRoles/PositionsRoles.css';
import AddDepartment from '../AddDepartment/AddDepartment';
import AddRole from '../AddRole/AddRole'
import FilterDropdown from '../../Recrutment/FilterDropdown/FilterDropdown';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
const PositionsRoles = () => {
    const { t } = useTranslation('Department/PositionRoles')
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
    const departmentOptions = [
        { value: '', label: t('all') },
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'product', label: 'Product Management' },
        { value: 'marketing', label: 'Marketing' },
    ];

    const addDeparment = () => {
        setIsAddDepartmentOpen(true);
        document.body.style.overflow = 'hidden';
    }
    
    const closeAddDepartment = () => {
        setIsAddDepartmentOpen(false);
        document.body.style.overflow = 'auto';
    }
    const addRole = (e) => {
        const add = document.querySelector('.add-role')
        add.style.display = 'none'
        if (add) {
            console.log('fff')
            document.body.style.overflow = 'hidden'
            add.style.display = 'block'
        }
    }
    const inf = [{ title: "Senior frontend engineer", department: "Engineering", opeenings: "2", role: "Develops and maintains user-facing features..." }, { title: "Product designer", department: "Design", opeenings: "1", role: "Creates user-centered designs by understanding..." }, { title: "Digital marketing specialist", department: "Marketing", opeenings: "0", role: "Manages online marketing campaings across vari..." }, { title: "Hr generalist", department: "Human resources", opeenings: "1", role: "Assists with daily functions of the HR department..." }]
    const table = []
    for (let i = 0; i < 4; i++) {
        <div>
            {
                table.push(
                    <div className='row-table-co'>
                        <p className='row-table1'>{inf[i].title}</p>
                        <p>{inf[i].department}</p>
                        <p>{inf[i].opeenings}</p>
                        <p className='row-table3'>{inf[i].role}</p>
                        <div className='button-actions'>
                            <button><i className='bi bi-pen'></i></button>
                            <button><i className='bi bi-trash'></i></button>
                            <button><i className='bi bi-eye-fill'></i></button>
                        </div>
                    </div>
                )
            }
        </div>
    }
    const tablemobile = []
    for (let i = 0; i < 3; i++) {
        <div>
            {
                tablemobile.push(
                    <div className='row-table-co-mobile'>
                        <div>
                            <p>{t('position')} : </p>
                            <p className='row-table1'> {inf[i].title}</p>
                        </div>
                        <div>  <p>{t('name')} : </p>
                            <p>{inf[i].department}</p></div>
                        <div>
                            <p>{t('opening')} : </p>
                            <p> {inf[i].opeenings}</p>
                        </div>
                        <div>
                            <p>{t('Role')} : </p>
                            <p className='row-table3'> {inf[i].role}</p>
                        </div>
                        <div className='button-actions'>
                            <button><i className='bi bi-pen'></i></button>
                            <button><i className='bi bi-trash'></i></button>
                            <button><i className='bi bi-eye-fill'></i></button>
                        </div>
                    </div>
                )
            }
        </div>
    }
    return (
        <div className="page-container">
            {isAddDepartmentOpen && (
                <div className='adddepartment'>
                    <AddDepartment onClose={closeAddDepartment} />
                </div>
            )}
            <div className='add-role'>
                <AddRole />
            </div>
            <header className="page-header Positions-hed">
                <h2>{t('Positions')}</h2>
                <ThemeToggle />
            </header>
            <div className='adddep'>
                <div>
                    <p className='add'>{t('add')}</p>
                    <p className='create'>{t('create')}</p></div>
                <button onClick={(e) => { addDeparment(e) }}><i className='bi bi-plus'></i> {t('adddep')}</button>
            </div>
            <div className='addrole'>
                <div className='header'>
                    <div className='search-filter'>
                        {/* <i className='bi bi-search icon-search'></i> */}
                        <input type='search' placeholder={t('search')} />
                        <FilterDropdown
                            value={selectedDepartment}
                            onChange={setSelectedDepartment}
                            options={departmentOptions}
                        />
                    </div>
                    <div className='addroleco'>
                        <button className='addrole' onClick={(e) => { addRole(e) }}><i className='bi bi-plus'></i> {t('addrole')}</button>
                    </div>
                </div>
                <div>
                    <table className='table'>
                        <header className='header inf-head'>
                            <th className='h-position'>{t('position')}</th>
                            <th>{t('name')}</th>
                            <th>{t('opening')}</th>
                            <th className='h-role'>{t('Role')}</th>
                            <th>{t('action')}</th>
                        </header>
                        {table}
                    </table>
                    <div>
                        {tablemobile}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PositionsRoles;
