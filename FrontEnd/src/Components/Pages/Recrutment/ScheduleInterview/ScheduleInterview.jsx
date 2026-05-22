import { useState, useEffect } from 'react';
import './scheduleInterview.css';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';
import { scheduleInterview, interviewApplication } from '../../../../services/atsService';

export default function ScheduleInterview({ name, department, applicationId, onClose, onSuccess }) {
    const { t } = useTranslation("Recrutment/ScheduleInterview");
    
    // Form States
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [interviewType, setInterviewType] = useState('video');
    const [interviewerId, setInterviewerId] = useState('');
    const [notes, setNotes] = useState('');

    // Fetch and loading states
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch live active employees to populate interviewer select list
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoadingEmployees(true);
                const res = await apiClient.get('/employees?per_page=100');
                // The API returns pagination data wrapped in { success: true, data: { employees: [...] } }
                const list = res.data?.data?.employees || res.data?.employees || [];
                setEmployees(list);
            } catch (err) {
                console.error("Failed to load interviewers:", err);
                setError(t('failedToLoadEmployees', 'Failed to load employees list.'));
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, [t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!interviewerId) {
            setError(t('selectInterviewerError', 'Please select an interviewer from the list.'));
            return;
        }

        const scheduledAt = `${date}T${startTime}:00`;
        const scheduledTimeDate = new Date(scheduledAt);
        if (scheduledTimeDate <= new Date()) {
            setError(t('futureDateError', 'Interview date and time must be in the future.'));
            return;
        }

        try {
            setSubmitting(true);

            // 1. Post scheduling details to backend
            await scheduleInterview(applicationId, {
                interviewer_id: parseInt(interviewerId, 10),
                interview_type: interviewType,
                scheduled_at: scheduledAt,
                notes: notes // optional note field
            });

            // 2. Transition candidate application to 'interviewing' stage
            const transitionRes = await interviewApplication(applicationId);
            const updatedApplication = transitionRes.data?.data ?? transitionRes.data;

            // 3. Callback on success
            if (onSuccess) {
                onSuccess(updatedApplication);
            }
        } catch (err) {
            console.error("Error scheduling interview:", err);
            setError(err.response?.data?.message || t('errorSubmitting', 'Failed to schedule interview. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    const interviewTypes = [
        { value: 'video', label: t('video', 'Video / Online') },
        { value: 'phone', label: t('phone', 'Phone Call') },
        { value: 'in-person', label: t('in-person', 'In-Person') },
        { value: 'technical', label: t('technical', 'Technical Interview') },
        { value: 'hr', label: t('hr', 'HR Round') }
    ];

    return (
        <div className="shinvisibility">
            <div className="sh_In_scr">
                <div className="sh_In_con">
                    <form onSubmit={handleSubmit}>
                        <div className="sh_In_tpx">
                            <div>
                                <p className="sh_In_tit">{t("shinterview")}</p>
                                <p className="sh_In_for">
                                    <span className="sh_In_name">{name}</span> — {department}
                                </p>
                            </div>
                            <button className='sh_In_x' type='button' onClick={onClose} aria-label="Close">x</button>
                        </div>
                        
                        <hr />

                        {error && (
                            <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #fee2e2', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <div className='con'>
                            {/* Interview Date */}
                            <div className='date'>
                                <p>{t('date')}</p>
                                <input 
                                    type='date' 
                                    required 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)} 
                                    className={!date ? 'hidden' : 'black'} 
                                    onKeyDown={(e) => e.preventDefault()} 
                                />
                            </div>

                            {/* Interview Type */}
                            <div className='type'>
                                <p>{t('type')}</p>
                                <select 
                                    value={interviewType}
                                    onChange={(e) => setInterviewType(e.target.value)}
                                    required
                                >
                                    {interviewTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Start Time */}
                            <div className='start'>
                                <p>{t('start')}</p>
                                <input 
                                    type='time' 
                                    required 
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)} 
                                    className={!startTime ? 'hidden' : 'black'} 
                                    onKeyDown={(e) => e.preventDefault()} 
                                />
                            </div>

                            {/* End Time (Visual only) */}
                            <div className='enddate'>
                                <p>{t('end')}</p>
                                <input 
                                    type='time' 
                                    required 
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)} 
                                    className={!endTime ? 'hidden' : 'black'} 
                                    onKeyDown={(e) => e.preventDefault()} 
                                />
                            </div>
                        </div>

                        {/* Interviewers Selection */}
                        <div className='interviewers'>
                            <p className='interviewers'>{t("interviewers")}</p>
                            <div className='selectinterviewers'>
                                {loadingEmployees ? (
                                    <div style={{ padding: '10px', color: 'gray', textAlign: 'center', fontSize: '14px' }}>
                                        Loading active team members...
                                    </div>
                                ) : employees.length === 0 ? (
                                    <div style={{ padding: '10px', color: 'gray', textAlign: 'center', fontSize: '14px' }}>
                                        No active employees found.
                                    </div>
                                ) : (
                                    employees.map(emp => {
                                        const isSelected = interviewerId === emp.user_id;
                                        return (
                                            <div 
                                                key={emp.id}
                                                style={{
                                                    backgroundColor: isSelected ? 'rgba(53, 158, 255, 0.15)' : 'transparent',
                                                    border: isSelected ? '1px solid rgb(53, 158, 255)' : 'none',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <p style={{ margin: 0, fontSize: '14px' }}>
                                                    {emp.full_name} <span style={{ color: 'gray', fontSize: '12px' }}>({emp.job_title || 'Employee'})</span>
                                                </p>
                                                <button 
                                                    type='button' 
                                                    onClick={() => setInterviewerId(emp.user_id)}
                                                    style={{ 
                                                        color: isSelected ? '#10b981' : 'var(--text-main)', 
                                                        fontWeight: isSelected ? 'bold' : 'normal' 
                                                    }}
                                                >
                                                    {isSelected ? '✓' : '+'}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <p className='ctrl'>{t("ctrl")}</p>
                        </div>

                        {/* Additional Notes */}
                        <div className='notes'>
                            <p className='notes'>{t("notes")}</p>
                            <textarea 
                                className='notes' 
                                placeholder={t("placeholder")}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className='cancon'>
                            <button className='cancel' type='button' onClick={onClose} disabled={submitting}>
                                {t("cancel")}
                            </button>
                            <button className='confirm' type='submit' disabled={submitting}>
                                {submitting ? (
                                    <span className="action-spinner" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '5px' }} />
                                ) : (
                                    <i className='bi bi-check'></i>
                                )}
                                {t("confirm")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}