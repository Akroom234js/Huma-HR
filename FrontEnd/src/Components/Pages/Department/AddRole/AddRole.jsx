import '../AddDepartment/AddDepartment.css'
import '../AddRole/AddRole.css'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import apiClient from '../../../../apiConfig'

export default function AddRole({ onClose, onSuccess }) {
    const { t } = useTranslation('Department/AddRole')
    const [title, setTitle] = useState('')
    const [departmentId, setDepartmentId] = useState('')
    const [openings, setOpenings] = useState('')
    const [description, setDescription] = useState('')
    const [skills, setSkills] = useState('')
    const [reportingTo, setReportingTo] = useState('')
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await apiClient.get('/departments');
                setDepartments(res.data?.data || []);
            } catch (error) {
                console.error("Failed to fetch departments", error);
            }
        };
        fetchDepartments();
    }, []);

    const handleSubmit = async () => {
        if (!title || !departmentId) {
            alert("Please fill in Position and Department");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                title,
                department_id: departmentId,
                description,
                requirements: skills, // Backend often calls them requirements
                reporting_to: reportingTo || null // Optional if model supports it
            };
            await apiClient.post('/positions', payload);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to create role:', error);
            alert(error.response?.data?.message || "Failed to create position");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='add-department'>
            <div className='add-department-co'>
                <div className='add-department-title'>
                    <p>{t('add')}</p>
                </div>
                <div className='details-dep'>
                    <div className='name-head'>
                        <div>
                            <p className='name'>{t('position')}</p>
                            <input 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                placeholder={t('e.gtitle')} 
                            />
                        </div>
                        <div>
                            <p className='head'>{t('name')}</p>
                            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                                <option value="">{t('select_department') || 'Select Department'}</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className='assign'>
                    <div className='select-emp-role'>
                        <div className='number'>
                            <p>{t('number')}</p>
                            <input 
                                type="number"
                                value={openings}
                                onChange={(e) => setOpenings(e.target.value)}
                                placeholder={t('e.g')} 
                            />
                        </div>
                    </div>
                    <div className='role'>
                        <p>{t('Role')}</p>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('enter')} 
                        />
                    </div>
                    <div className='skill'>
                        <p>{t('skill')}</p>
                        <input 
                            className='skill' 
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder={t('addskill')} 
                        />
                    </div>
                    <div className='reporting'>
                        <p className='head'>{t('reporting')}</p>
                        <select value={reportingTo} onChange={(e) => setReportingTo(e.target.value)}>
                            <option value="">{t('select_position') || 'Select Position'}</option>
                            {/* In a real app, you might fetch existing positions here too */}
                            <option value="manager">Manager</option>
                            <option value="senior">Senior</option>
                        </select>
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