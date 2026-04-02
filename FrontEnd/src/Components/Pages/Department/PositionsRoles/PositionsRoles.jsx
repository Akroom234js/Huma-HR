import React from 'react';
import '../PositionsRoles/PositionsRoles.css';
import AddDepartment from '../AddDepartment/AddDepartment';
import AddRole from '../AddRole/AddRole'
import FilterDropdown from '../../Recrutment/FilterDropdown/FilterDropdown';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
const PositionsRoles = () => {
    const {t}=useTranslation('Department/PositionRoles')
    const [selectedDepartment, setSelectedDepartment] = useState('');
      const departmentOptions = [
        { value: '', label: t('all') },
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'product', label: 'Product Management' },
        { value: 'marketing', label: 'Marketing' },
    ];

    const addDeparment=(e)=>{
        const add=document.querySelector('.adddepartment')
        add.style.display='none'
        if(add){
               console.log('fff')
             document.body.style.overflow='hidden'
             add.style.display='block'
        }
    }
       const addRole=(e)=>{
        const add=document.querySelector('.add-role')
        add.style.display='none'
        if(add){
               console.log('fff')
            document.body.style.overflow='hidden'
             add.style.display='block'
        }
    }  
    const a=['aa','sasdsdsd','sddalkkda','dsdds']
    const table=[]
   for(let i=0;i<9;i++){
    <div>
        {
            table.push(
                <div className='row-table-co'>
                    <p className='row-table1'>dscc,c;sd;</p>
                    <p>dscc,c;sd;</p>
                    <p>1</p>
                    <p className='row-table3'>dsffghgjghkhjjkjkhjhjhjhcc,c;sd;</p>
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
      const tablemobile=[]
   for(let i=0;i<3;i++){
    <div>
        {
            tablemobile.push(
                <div className='row-table-co-mobile'>
                    <div>
                        <p>{t('position')} : </p>
                        <p className='row-table1'> dscc,c;sd;</p>
                        </div>
                  <div>  <p>{t('name')} : </p>
                  <p> dscc,c;sd;</p></div>
                   <div>
                    <p>{t('opening')} : </p>
                     <p> 1</p>
                    </div>
                   <div>
                    <p>{t('Role')} : </p>
                     <p className='row-table3'> dsffghgjghkhjjkjkhjhjhjhcc,c;sd;</p>
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
            <div className='adddepartment'>
                <AddDepartment/>
            </div>
            <div className='add-role'>
                <AddRole/>
            </div>
            <header className="page-header ">
                <h2>{t('Positions')}</h2>
                <ThemeToggle/>
            </header>
           <div className='adddep'>
             <div>
                <p className='add'>{t('add')}</p>
             <p className='create'>{t('create')}</p></div>
                   <button onClick={(e)=>{addDeparment(e)}}><i className='bi bi-plus'></i> {t('adddep')}</button>
           </div>
           <div className='addrole'>
            <div className='header'>
                <div className='search-filter'>
                    {/* <i className='bi bi-search icon-search'></i> */}
                <input type='search' placeholder={t('search')}/>
                  <FilterDropdown
                        value={selectedDepartment}
                        onChange={setSelectedDepartment}
                        options={departmentOptions}
                    />
            </div>
              <div className='addroleco'>
                <button className='addrole' onClick={(e)=>{addRole(e)}}><i className='bi bi-plus'></i> {t('addrole')}</button>
              </div>
            </div>
            <div>
                <table className='table'>
                    <header className='header'>
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
