import './AddDepartment.css'
import ThemeToggle from '../../../ThemeToggle/ThemeToggle'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import apiClient from '../../../../apiConfig'

export default function AddDepartment({ onClose, onSuccess }) {
    const { t } = useTranslation('Department/AddDepartment')
    const [name, setName] = useState('')
    const [headId, setHeadId] = useState('')
    const [assignedEmployees, setAssignedEmployees] = useState([])
    const [employeesList, setEmployeesList] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await apiClient.get('/employees', { params: { per_page: 100 } });
                setEmployeesList(res.data?.data?.employees || []);
            } catch (error) {
                console.error("Failed to fetch employees", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleAddEmployee = (e) => {
        const empId = parseInt(e.target.value)
        if (!empId) return
        
        const employee = employeesList.find(emp => emp.id === empId)
        if (employee && !assignedEmployees.find(emp => emp.id === empId)) {
            setAssignedEmployees([...assignedEmployees, employee])
        }
        e.target.value = '' // Reset select
    }

    const handleRemoveEmployee = (empId) => {
        setAssignedEmployees(assignedEmployees.filter(emp => emp.id !== empId))
    }

    const handleSubmit = async () => {
        if (!name) {
            alert("Please enter department name");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                name,
                head_id: headId || null,
                employee_ids: assignedEmployees.map(emp => emp.id)
            }
            await apiClient.post('/departments', payload);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to create department:', error);
            alert(error.response?.data?.message || "Failed to create department");
        } finally {
            setLoading(false);
        }
    }

    const unassignedEmployees = employeesList.filter(
        emp => !assignedEmployees.find(assigned => assigned.id === emp.id) && emp.id !== parseInt(headId)
    )

    return (
        <div className='add-department'>
            <div className='add-department-co'>
                 <div className='add-department-title'>
                    <p>{t('add')}</p>
                 </div> 
                 <div className='details-dep'>
                     <p>{t('details')}</p>
                     <div className='name-head'>
                       <div>
                         <p className='name'>{t('name')}</p>
                         <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder={t('e.g')}
                         />
                       </div>
                       <div>
                         <p className='head'>{t('head')}</p>
                         <select value={headId} onChange={(e) => setHeadId(e.target.value)}>
                            <option value="">{t('select_head') || 'Select Head'}</option>
                            {employeesList.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                            ))}
                         </select>
                       </div>
                     </div>
                 </div>
                 <div className='assign'>
                     <p>{t('assign')}</p>
                     <div className='select-emp-role'>
                       <div className='full-width-select'>
                         <p className='selectemp'>{t('selectemp')}</p>
                         <select onChange={handleAddEmployee} defaultValue="">
                            <option value="" disabled>{t('select_employee_to_assign') || 'Select employee to assign'}</option>
                            {unassignedEmployees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                            ))}
                         </select>
                       </div>  
                     </div>
                     <div className='selectinterviewers addemploy' >
                        {assignedEmployees.length === 0 ? (
                            <p className='no-employees'>{t('no_employees_assigned') || 'No employees assigned yet.'}</p>
                        ) : (
                            assignedEmployees.map((emp) => (
                                <div key={emp.id} className='assigned-employee-item'>
                                    <p>{emp.full_name}</p>
                                    <button 
                                        type='button' 
                                        className='remove-btn' 
                                        onClick={() => handleRemoveEmployee(emp.id)}
                                    >
                                        -
                                    </button>
                                </div>
                            ))
                        )}
                     </div>
                 </div>
                 <div className='send-can-adddepartment cancon'>
                    <button className='cancel' onClick={onClose}>{t('cancel')}</button>
                    <button className='confirm' onClick={handleSubmit} disabled={loading}>
                        {loading ? '...' : t('submit')}
                    </button>
                 </div> 
            </div>
        </div>
    )
}