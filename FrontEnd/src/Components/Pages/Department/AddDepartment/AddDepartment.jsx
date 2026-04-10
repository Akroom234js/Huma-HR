import './AddDepartment.css'
import '../../Recrutment/ScheduleInterview/ScheduleInterview'
import ThemeToggle from '../../../ThemeToggle/ThemeToggle'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export default function AddDepartment({ onClose }) {
    const { t } = useTranslation('Department/AddDepartment')
    const [name, setName] = useState('')
    const [headId, setHeadId] = useState('')
    const [assignedEmployees, setAssignedEmployees] = useState([])

    // Mock data for employees based on typical HR system
    const employeesList = [
        { id: 1, name: 'Alice Smith' },
        { id: 2, name: 'Bob Johnson' },
        { id: 3, name: 'Charlie Brown' },
        { id: 4, name: 'Diana Prince' },
        { id: 5, name: 'Evan Wright' }
    ]

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

    const handleSubmit = () => {
        const payload = {
            name,
            headId,
            assignedEmployees: assignedEmployees.map(emp => emp.id)
        }
        console.log('Submitting to backend:', payload)
        // Add API call here
        if (onClose) onClose()
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
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
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
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                         </select>
                       </div>  
                       {/* Position slider removed as requested */}
                     </div>
                     <div className='selectinterviewers addemploy' >
                        {assignedEmployees.length === 0 ? (
                            <p className='no-employees'>{t('no_employees_assigned') || 'No employees assigned yet.'}</p>
                        ) : (
                            assignedEmployees.map((emp) => (
                                <div key={emp.id} className='assigned-employee-item'>
                                    <p>{emp.name}</p>
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
                    <button className='confirm' onClick={handleSubmit}>{t('submit')}</button>
                 </div> 
            </div>
        </div>
    )
}