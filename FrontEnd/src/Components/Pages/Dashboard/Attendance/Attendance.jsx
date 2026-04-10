import React, { useState, useMemo, useRef, useEffect } from 'react';
import './Attendance.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import { useTranslation } from 'react-i18next';

/* ─── Static attendance data ─── */
const attendanceData = [
    { name: 'Olivia Rhye',    id: 'EMP-00123', dept: 'Engineering', date: '2023-10-26', timeIn: '09:05 AM', timeOut: '05:35 PM', duration: '8h 30m', status: 'onTime',  latenessReason: '-',                  img: 'https://i.pravatar.cc/150?u=olivia'  },
    { name: 'Phoenix Baker',  id: 'EMP-00124', dept: 'Design',      date: '2023-10-26', timeIn: '09:17 AM', timeOut: '06:02 PM', duration: '8h 45m', status: 'late',     latenessReason: 'Heavy traffic',      img: 'https://i.pravatar.cc/150?u=phoenix' },
    { name: 'Lana Steiner',   id: 'EMP-00125', dept: 'Product',     date: '2023-10-26', timeIn: '-',        timeOut: '-',        duration: '-',      status: 'onLeave',  latenessReason: '-',                  img: 'https://i.pravatar.cc/150?u=lana'    },
    { name: 'Candice Wu',     id: 'EMP-00126', dept: 'Engineering', date: '2023-10-26', timeIn: '-',        timeOut: '-',        duration: '-',      status: 'absent',   latenessReason: '-',                  img: 'https://i.pravatar.cc/150?u=candice' },
    { name: 'Demi Wilkinson', id: 'EMP-00127', dept: 'Design',      date: '2023-10-26', timeIn: '08:50 AM', timeOut: '05:20 PM', duration: '8h 30m', status: 'onTime',  latenessReason: '-',                  img: 'https://i.pravatar.cc/150?u=demi'    },
    { name: 'Nathan Roberts', id: 'EMP-00128', dept: 'Marketing',   date: '2023-10-26', timeIn: '09:45 AM', timeOut: '06:15 PM', duration: '8h 30m', status: 'late',    latenessReason: 'Doctor appointment', img: 'https://i.pravatar.cc/150?u=nathan'  },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const defaultDeptHours = [
    { dept: 'Engineering', startTime: '09:00', endTime: '17:00', gracePeriod: '15', workDays: ['Mon','Tue','Wed','Thu','Fri'] },
    { dept: 'Design',      startTime: '09:30', endTime: '17:30', gracePeriod: '10', workDays: ['Mon','Tue','Wed','Thu','Fri'] },
    { dept: 'Product',     startTime: '09:00', endTime: '18:00', gracePeriod: '15', workDays: ['Mon','Tue','Wed','Thu','Fri'] },
    { dept: 'Marketing',   startTime: '08:00', endTime: '16:00', gracePeriod: '0',  workDays: ['Mon','Tue','Wed','Thu','Fri'] },
    { dept: 'HR',          startTime: '08:30', endTime: '16:30', gracePeriod: '10', workDays: ['Mon','Tue','Wed','Thu','Fri','Sat'] },
];

/* ─── Compute total hours from "HH:MM" strings ─── */
const calcHours = (start, end) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return '—';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

/* ══════════════════════════════════════════════════
   SMOOTH ACCORDION — measures real height via ref
══════════════════════════════════════════════════ */
const Accordion = ({ open, children }) => {
    const innerRef = useRef(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (!innerRef.current) return;
        const observer = new ResizeObserver(() => {
            setHeight(innerRef.current?.scrollHeight ?? 0);
        });
        observer.observe(innerRef.current);
        return () => observer.disconnect();
    }, []);

    // Also recalculate when children change
    useEffect(() => {
        if (innerRef.current) setHeight(innerRef.current.scrollHeight);
    });

    return (
        <div
            className="at-accordion-wrapper"
            style={{ maxHeight: open ? height : 0 }}
            aria-hidden={!open}
        >
            <div ref={innerRef}>
                {children}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const Attendance = () => {
    const { t } = useTranslation('Dashboard/Attendance');

    /* Attendance table filters */
    const [searchTerm,   setSearchTerm]   = useState('');
    const [deptFilter,   setDeptFilter]   = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    /* Work-hours section */
    const [showWorkHours, setShowWorkHours] = useState(false);
    const [deptHours, setDeptHours]         = useState(defaultDeptHours);
    const [editingDept, setEditingDept]     = useState(null);
    const [saved, setSaved]                 = useState(null);

    /* ── Filtered rows ── */
    const filteredData = useMemo(() => {
        return attendanceData.filter(row => {
            const q = searchTerm.toLowerCase();
            const matchSearch = row.name.toLowerCase().includes(q) || row.id.toLowerCase().includes(q);
            const matchDept   = deptFilter   === '' || row.dept === deptFilter;
            const matchStatus = statusFilter  === '' || row.status === statusFilter;
            return matchSearch && matchDept && matchStatus;
        });
    }, [searchTerm, deptFilter, statusFilter]);

    /* ── Work-hours handlers ── */
    const handleHourChange = (dept, field, value) =>
        setDeptHours(prev => prev.map(d => d.dept === dept ? { ...d, [field]: value } : d));

    const toggleDay = (dept, day) =>
        setDeptHours(prev => prev.map(d => {
            if (d.dept !== dept) return d;
            const days = d.workDays.includes(day)
                ? d.workDays.filter(wd => wd !== day)
                : [...d.workDays, day];
            return { ...d, workDays: days };
        }));

    const handleSave = (dept) => {
        setEditingDept(null);
        setSaved(dept);
        setTimeout(() => setSaved(null), 2000);
    };

    /* ── Stats ── */
    const stats = [
        { label: t('stats.presentToday'), value: '1,210' },
        { label: t('stats.lateToday'),    value: '12'    },
        { label: t('stats.avgHours'),     value: '8.2h'  },
        { label: t('stats.latenessCount'),value: '89'    },
    ];

    /* ── Dropdown options ── */
    const departmentOptions = [
        { value: '',            label: t('filters.department') },
        { value: 'Engineering', label: 'Engineering'           },
        { value: 'Design',      label: 'Design'                },
        { value: 'Product',     label: 'Product'               },
        { value: 'Marketing',   label: 'Marketing'             },
    ];

    const statusOptions = [
        { value: '',        label: t('filters.status')    },
        { value: 'onTime',  label: t('status.onTime')     },
        { value: 'late',    label: t('status.late')       },
        { value: 'onLeave', label: t('status.onLeave')    },
        { value: 'absent',  label: t('status.absent')     },
    ];

    /* ══ RENDER ══ */
    return (
        <div className="at-page">

            {/* Theme Toggle */}
            <div className="at-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            {/* Header */}
            <header className="at-header">
                <h1 className="at-title">{t('title')}</h1>
            </header>

            {/* Stats */}
            <div className="at-stats-row">
                {stats.map((s, i) => (
                    <div key={i} className="at-stat-card">
                        <span className="at-stat-label">{s.label}</span>
                        <span className="at-stat-value">{s.value}</span>
                    </div>
                ))}
            </div>

            {/* ── Work Hours Settings ── */}
            <div className="at-workhours-card">
                <button
                    className="at-workhours-toggle"
                    onClick={() => setShowWorkHours(v => !v)}
                    aria-expanded={showWorkHours}
                >
                    <div className="at-workhours-toggle-left">
                        <span className="material-symbols-outlined at-wh-icon">schedule</span>
                        <div>
                            <span className="at-workhours-title">{t('workHours.sectionTitle')}</span>
                            <span className="at-workhours-subtitle">{t('workHours.sectionSubtitle')}</span>
                        </div>
                    </div>
                    <span className={`material-symbols-outlined at-wh-chevron ${showWorkHours ? 'open' : ''}`}>
                        expand_more
                    </span>
                </button>

                {/* Smooth accordion */}
                <Accordion open={showWorkHours}>
                    <div className="at-workhours-body">
                        {deptHours.map(d => {
                            const isEditing = editingDept === d.dept;
                            const justSaved = saved === d.dept;
                            return (
                                <div key={d.dept} className={`at-dept-row ${isEditing ? 'editing' : ''}`}>

                                    <div className="at-dept-name">
                                        <span className="material-symbols-outlined at-dept-icon">corporate_fare</span>
                                        <span>{d.dept}</span>
                                    </div>

                                    <div className="at-dept-field">
                                        <label className="at-field-label">{t('workHours.startTime')}</label>
                                        <input type="time" className="at-time-input" value={d.startTime}
                                            disabled={!isEditing}
                                            onChange={e => handleHourChange(d.dept, 'startTime', e.target.value)} />
                                    </div>

                                    <div className="at-dept-field">
                                        <label className="at-field-label">{t('workHours.endTime')}</label>
                                        <input type="time" className="at-time-input" value={d.endTime}
                                            disabled={!isEditing}
                                            onChange={e => handleHourChange(d.dept, 'endTime', e.target.value)} />
                                    </div>

                                    <div className="at-dept-field">
                                        <label className="at-field-label">{t('workHours.totalHours')}</label>
                                        <span className="at-total-hours">{calcHours(d.startTime, d.endTime)}</span>
                                    </div>

                                    <div className="at-dept-field">
                                        <label className="at-field-label">{t('workHours.gracePeriod')}</label>
                                        <input type="number" min="0" max="60" className="at-grace-input"
                                            value={d.gracePeriod} disabled={!isEditing}
                                            onChange={e => handleHourChange(d.dept, 'gracePeriod', e.target.value)} />
                                    </div>

                                    <div className="at-dept-field at-dept-days-field">
                                        <label className="at-field-label">{t('workHours.workDays')}</label>
                                        <div className="at-days-pills">
                                            {WEEKDAYS.map(day => (
                                                <button key={day}
                                                    className={`at-day-pill ${d.workDays.includes(day) ? 'active' : ''} ${!isEditing ? 'readonly' : ''}`}
                                                    onClick={() => isEditing && toggleDay(d.dept, day)}
                                                    disabled={!isEditing}
                                                    title={t(`days.${day}`)}>
                                                    {t(`days.${day}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="at-dept-actions">
                                        {isEditing ? (
                                            <>
                                                <button className="at-btn-save" onClick={() => handleSave(d.dept)}>
                                                    <span className="material-symbols-outlined">check</span>
                                                    {t('workHours.save')}
                                                </button>
                                                <button className="at-btn-cancel" onClick={() => setEditingDept(null)}>
                                                    {t('workHours.cancel')}
                                                </button>
                                            </>
                                        ) : (
                                            <button className={`at-btn-edit ${justSaved ? 'saved' : ''}`}
                                                onClick={() => setEditingDept(d.dept)}>
                                                {justSaved
                                                    ? <><span className="material-symbols-outlined">check_circle</span>{t('workHours.saved')}</>
                                                    : <><span className="material-symbols-outlined">edit</span>{t('workHours.edit')}</>
                                                }
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Accordion>
            </div>

            {/* Filter Card */}
            <div className="at-filter-card">
                <div className="at-all-filt">
                    <input type="text" className="at-search-input"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)} />
                    <div className="at-filters-row">
                        <FilterDropdown value={deptFilter} onChange={setDeptFilter}
                            options={departmentOptions} placeholder={t('filters.department')} />
                        <FilterDropdown value={statusFilter} onChange={setStatusFilter}
                            options={statusOptions} placeholder={t('filters.status')} />
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="at-table-card">
                <div className="at-table-header">
                    <h2 className="at-table-title">{t('table.title')}</h2>
                </div>
                <div className="at-table-wrapper">
                    <table className="at-table">
                        <thead>
                            <tr>
                                <th>{t('table.employeeName')}</th>
                                <th>{t('table.employeeId')}</th>
                                <th>{t('table.date')}</th>
                                <th>{t('table.timeIn')}</th>
                                <th>{t('table.timeOut')}</th>
                                <th>{t('table.duration')}</th>
                                <th>{t('table.status')}</th>
                                <th>{t('table.latenessReason')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, i) => (
                                <tr key={i}>
                                    <td>
                                        <div className="at-employee-cell">
                                            <img src={row.img} alt={row.name} className="at-avatar" />
                                            <span className="at-employee-name">{row.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="at-employee-id">{row.id}</span></td>
                                    <td><span className="at-date">{row.date}</span></td>
                                    <td><span className="at-time">{row.timeIn}</span></td>
                                    <td><span className="at-time">{row.timeOut}</span></td>
                                    <td><span className="at-duration">{row.duration}</span></td>
                                    <td>
                                        <span className={`at-status-badge at-status-${row.status}`}>
                                            {t(`status.${row.status}`)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="at-lateness-reason">
                                            {row.latenessReason === '-'
                                                ? <span className="at-dash">—</span>
                                                : row.latenessReason}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="at-no-results">
                                        {t('table.noResults')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
