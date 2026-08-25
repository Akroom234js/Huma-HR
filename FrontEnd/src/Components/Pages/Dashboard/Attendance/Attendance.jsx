import React, { useState, useMemo, useRef, useEffect } from 'react';
import './Attendance.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import { useTranslation } from 'react-i18next';
import Avatar from '../../../Shared/Avatar/Avatar';
import apiClient from '../../../../apiConfig';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const calcHours = (start, end) => {
    if (!start || !end || !String(start).includes(':') || !String(end).includes(':')) return '—';
    const [sh, sm] = String(start).split(':').map(Number);
    const [eh, em] = String(end).split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return '—';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

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

const Attendance = () => {
    const { t, i18n } = useTranslation('Dashboard/Attendance');
    const isAr = i18n?.language === 'ar';

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({
        presentToday: 0,
        lateToday: 0,
        avgHours: '0h',
        latenessCount: 0
    });
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const [attendanceError, setAttendanceError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const attendanceAbortRef = useRef(null);
    const attendanceFirstRender = useRef(true);

    // Settings Hub State
    const [showSettingsHub, setShowSettingsHub] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState('workHours'); // 'workHours' | 'geofencing'

    // Department Hours State
    const [deptHours, setDeptHours]         = useState([]);
    const [editingDept, setEditingDept]     = useState(null);
    const [saved, setSaved]                 = useState(null);

    // Geofencing Locations State
    const [officeLocations, setOfficeLocations] = useState([]);
    const [locName, setLocName] = useState('');
    const [locLat, setLocLat] = useState('');
    const [locLon, setLocLon] = useState('');
    const [locRadius, setLocRadius] = useState(150);
    const [isSavingLoc, setIsSavingLoc] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchingMap, setIsSearchingMap] = useState(false);

    const fetchAttendanceData = async (currentFilters) => {
        if (attendanceAbortRef.current) {
            attendanceAbortRef.current.abort();
        }

        const controller = new AbortController();
        attendanceAbortRef.current = controller;

        try {
            setAttendanceLoading(true);
            setAttendanceError(null);

            const params = {};

            if (currentFilters.date) params.date = currentFilters.date;
            if (currentFilters.status) params.status = currentFilters.status;
            if (currentFilters.search) params.search = currentFilters.search;

            if (
                currentFilters.department_id !== '' &&
                currentFilters.department_id !== null &&
                currentFilters.department_id !== undefined &&
                !Number.isNaN(Number(currentFilters.department_id))
            ) {
                params.department_id = currentFilters.department_id;
            }
            const response = await apiClient.get('/dashboard/attendance', {
                params,
                signal: controller.signal
            });

            const result = response?.data || {};

            if (result.status || result.success) {
                const data = result.data || {};
                const apiStats = data.stats || {};
                const records = Array.isArray(data.records)
                    ? data.records
                    : Array.isArray(data.data)
                        ? data.data
                        : [];

                setAttendanceStats({
                    presentToday: apiStats.present_today ?? apiStats.presentToday ?? 0,
                    lateToday: apiStats.late_today ?? apiStats.lateToday ?? 0,
                    avgHours: apiStats.avg_hours ?? apiStats.avgHours ?? '0h',
                    latenessCount: apiStats.lateness_count ?? apiStats.latenessCount ?? 0
                });

                setAttendanceRecords(records);
            } else {
                setAttendanceRecords([]);
                setAttendanceError(result.message || t('error'));
            }
        } catch (error) {
            if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
                return;
            }

            console.error('Error fetching attendance data:', error);
            setAttendanceError(
                error?.response?.data?.message ||
                error?.message ||
                t('error')
            );
        } finally {
            if (!controller.signal.aborted) {
                setAttendanceLoading(false);
            }
        }
    };

    useEffect(() => {
        const filters = {
            date: dateFilter,
            department_id: deptFilter,
            status: statusFilter,
            search: searchTerm
        };

        if (attendanceFirstRender.current) {
            attendanceFirstRender.current = false;
            fetchAttendanceData(filters);
            return;
        }

        const timer = setTimeout(() => {
            fetchAttendanceData(filters);
        }, 500);

        return () => clearTimeout(timer);
    }, [dateFilter, deptFilter, statusFilter, searchTerm]);

    useEffect(() => {
        return () => {
            if (attendanceAbortRef.current) {
                attendanceAbortRef.current.abort();
            }
        };
    }, []);

    const handleAttendanceSearchChange = (value) => {
        setSearchTerm(value);
    };

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && L.Icon.Default) {
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        }
    }, []);

    const updateMarker = (lat, lng, rad) => {
        if (!mapInstance.current) return;
        const position = [lat, lng];

        if (markerRef.current) {
            markerRef.current.setLatLng(position);
        } else {
            markerRef.current = L.marker(position).addTo(mapInstance.current);
        }

        if (circleRef.current) {
            circleRef.current.setLatLng(position);
            circleRef.current.setRadius(rad);
        } else {
            circleRef.current = L.circle(position, {
                radius: rad,
                color: '#4ade80',
                fillColor: '#4ade80',
                fillOpacity: 0.15,
                weight: 1
            }).addTo(mapInstance.current);
        }

        mapInstance.current.setView(position, 15);
    };

    useEffect(() => {
        if (showSettingsHub && activeSettingsTab === 'geofencing' && mapRef.current) {
            const timer = setTimeout(() => {
                if (!mapInstance.current && mapRef.current) {
                    const defaultLat = parseFloat(locLat) || 33.5138;
                    const defaultLon = parseFloat(locLon) || 36.2765;
                    const startZoom = (locLat && locLon) ? 13 : 8; 

                    mapInstance.current = L.map(mapRef.current).setView([defaultLat, defaultLon], startZoom);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(mapInstance.current);

                    mapInstance.current.on('click', (e) => {
                        const { lat, lng } = e.latlng;
                        setLocLat(lat.toFixed(8));
                        setLocLon(lng.toFixed(8));
                    });

                    if (locLat && locLon) {
                        updateMarker(defaultLat, defaultLon, locRadius);
                    } else if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const { latitude, longitude } = position.coords;
                                setLocLat(latitude.toFixed(6));
                                setLocLon(longitude.toFixed(6));
                                if (mapInstance.current) {
                                    mapInstance.current.setView([latitude, longitude], 15);
                                    updateMarker(latitude, longitude, locRadius);
                                }
                            },
                            () => {},
                            { enableHighAccuracy: true, timeout: 6000 }
                        );
                    }
                } else if (mapInstance.current) {
                    mapInstance.current.invalidateSize();
                }
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [showSettingsHub, activeSettingsTab]);

    useEffect(() => {
        if (mapInstance.current && locLat && locLon && locRadius) {
            updateMarker(parseFloat(locLat), parseFloat(locLon), parseInt(locRadius));
        }
    }, [locLat, locLon, locRadius]);

    const fetchLocations = async () => {
        try {
            const response = await apiClient.get('/office-locations');
            if (response.data && response.data.data) {
                setOfficeLocations(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch office locations", error);
        }
    };

    const fetchDepartmentHours = async () => {
        try {
            const response = await apiClient.get('/department-hours');
            if (response.data && response.data.data) {
                const mappedHours = response.data.data.map(item => ({
                    dept: item.dept,
                    startTime: String(item.start_time || '').substring(0, 5),
                    endTime: String(item.end_time || '').substring(0, 5),
                    gracePeriod: String(item.grace_period),
                    workDays: Array.isArray(item.work_days) ? item.work_days : []
                }));
                setDeptHours(mappedHours);
            }
        } catch (error) {
            console.error("Failed to fetch department hours", error);
        }
    };

    useEffect(() => {
        fetchLocations();
        fetchDepartmentHours();
    }, []);

    const handleSearchLocation = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery || !searchQuery.trim()) {
            alert(t('geofencing.alerts.enterSearch'));
            return;
        }
        setIsSearchingMap(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const parsedLat = parseFloat(lat);
                const parsedLon = parseFloat(lon);
                
                setLocLat(parsedLat.toFixed(8));
                setLocLon(parsedLon.toFixed(8));
                
                if (mapInstance.current) {
                    const position = [parsedLat, parsedLon];
                    mapInstance.current.setView(position, 15);
                    updateMarker(parsedLat, parsedLon, locRadius);
                }
                alert(`${t('geofencing.alerts.found')}${display_name}`);
            } else {
                alert(t('geofencing.alerts.notFound'));
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            alert(t('geofencing.alerts.searchFailed'));
        } finally {
            setIsSearchingMap(false);
        }
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        if (!locName || !locLat || !locLon || !locRadius) {
            alert(t('geofencing.alerts.fillAll'));
            return;
        }
        setIsSavingLoc(true);
        try {
            await apiClient.post('/office-locations', {
                name: locName,
                latitude: parseFloat(locLat),
                longitude: parseFloat(locLon),
                radius_meters: parseInt(locRadius),
                is_active: true
            });
            setLocName('');
            setLocLat('');
            setLocLon('');
            setLocRadius(150);
            
            if (markerRef.current && mapInstance.current) {
                mapInstance.current.removeLayer(markerRef.current);
                markerRef.current = null;
            }
            if (circleRef.current && mapInstance.current) {
                mapInstance.current.removeLayer(circleRef.current);
                circleRef.current = null;
            }
            if (mapInstance.current) {
                mapInstance.current.setView([33.5138, 36.2765], 8);
            }

            fetchLocations();
            alert(t('geofencing.alerts.addedSuccess'));
        } catch (error) {
            console.error("Failed to save location", error);
            alert(t('geofencing.alerts.failedAdd'));
        } finally {
            setIsSavingLoc(false);
        }
    };

    const handleToggleLocation = async (id, currentStatus) => {
        try {
            await apiClient.put(`/office-locations/${id}`, {
                is_active: !currentStatus
            });
            fetchLocations();
        } catch (error) {
            console.error("Failed to toggle location status", error);
        }
    };

    const handleDeleteLocation = async (id) => {
        if (!window.confirm(t('geofencing.alerts.confirmDelete'))) return;
        try {
            await apiClient.delete(`/office-locations/${id}`);
            fetchLocations();
        } catch (error) {
            console.error("Failed to delete location", error);
        }
    };

    const filteredData = useMemo(() => {
        return attendanceRecords.filter(row => {
            const departmentId = row.department_id ?? row.department?.id;
            const departmentName = row.dept || row.department?.name || row.department || '';

            if (deptFilter === '') return true;

            if (!Number.isNaN(Number(deptFilter)) && departmentId != null) {
                return String(departmentId) === String(deptFilter);
            }

            return String(departmentName) === String(deptFilter);
        });
    }, [attendanceRecords, deptFilter]);

    const handleHourChange = (dept, field, value) =>
        setDeptHours(prev => prev.map(d => d.dept === dept ? { ...d, [field]: value } : d));

    const toggleDay = (dept, day) =>
        setDeptHours(prev => prev.map(d => {
            if (d.dept !== dept) return d;
            const currentDays = Array.isArray(d.workDays) ? d.workDays : [];
            const days = currentDays.includes(day)
                ? currentDays.filter(wd => wd !== day)
                : [...currentDays, day];
            return { ...d, workDays: days };
        }));

    const handleSave = async (deptName) => {
        const d = deptHours.find(item => item.dept === deptName);
        if (!d) return;

        try {
            await apiClient.put(`/department-hours/${deptName}`, {
                start_time: d.startTime,
                end_time: d.endTime,
                grace_period: parseInt(d.gracePeriod),
                work_days: d.workDays
            });
            setEditingDept(null);
            setSaved(deptName);
            setTimeout(() => setSaved(null), 2000);
            fetchDepartmentHours();
        } catch (error) {
            console.error("Failed to update department work hours", error);
            alert(t('workHours.errorSave'));
        }
    };

    const stats = [
        { label: t('stats.presentToday'), value: attendanceStats.presentToday },
        { label: t('stats.lateToday'), value: attendanceStats.lateToday },
        { label: t('stats.avgHours'), value: attendanceStats.avgHours },
        { label: t('stats.latenessCount'), value: attendanceStats.latenessCount },
    ];

    const departmentOptions = useMemo(() => {
        const departmentMap = new Map();

        attendanceRecords.forEach(row => {
            const departmentId = row.department_id ?? row.department?.id;
            const departmentName = row.dept || row.department?.name || row.department;

            if (!departmentName && departmentId == null) return;

            const value = departmentId != null ? String(departmentId) : String(departmentName);
            const label = departmentName || value;

            if (!departmentMap.has(value)) {
                departmentMap.set(value, label);
            }
        });

        return [
            { value: '', label: t('filters.department') },
            ...Array.from(departmentMap.entries())
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([value, label]) => ({ value, label }))
        ];
    }, [attendanceRecords, t]);

    const statusOptions = [
        { value: '',        label: t('filters.status')    },
        { value: 'onTime',  label: t('status.onTime')     },
        { value: 'late',    label: t('status.late')       },
        { value: 'onLeave', label: t('status.onLeave')    },
        { value: 'absent',  label: t('status.absent')     },
    ];

    return (
        <div className={`at-page ${isAr ? 'rtl' : 'ltr'}`}>

            <div className="at-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <header className="at-header">
                <h1 className="at-title">{t('title')}</h1>
            </header>
            
            {/* Stats Row */}
            <div className="at-stats-row">
                {stats.map((s, i) => (
                    <div key={i} className="at-stat-card">
                        <span className="at-stat-label">{s.label}</span>
                        <span className="at-stat-value">{s.value}</span>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                ✨ UNIFIED ATTENDANCE CONFIGURATION & POLICIES HUB (Clean & Clear UX)
               ══════════════════════════════════════════════════════════════════ */}
            <div className="at-settings-hub-card">
                <div className="at-settings-hub-header">
                    <div className="at-settings-hub-header-left">
                        <div className="at-settings-hub-icon-wrapper">
                            <span className="material-symbols-outlined at-settings-main-icon">tune</span>
                        </div>
                        <div>
                            <div className="at-settings-hub-title-row">
                                <span className="at-settings-hub-title">{t('settingsHub.title')}</span>
                                <span className="at-settings-hub-badge">{t('settingsHub.badge')}</span>
                            </div>
                            <span className="at-settings-hub-subtitle">{t('settingsHub.subtitle')}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={`at-settings-toggle-btn ${showSettingsHub ? 'active' : ''}`}
                        onClick={() => setShowSettingsHub(v => !v)}
                        aria-expanded={showSettingsHub}
                    >
                        <span className="material-symbols-outlined">
                            {showSettingsHub ? 'expand_less' : 'settings'}
                        </span>
                        <span>{showSettingsHub ? t('settingsHub.hideSettings') : t('settingsHub.showSettings')}</span>
                    </button>
                </div>

                <Accordion open={showSettingsHub}>
                    <div className="at-settings-hub-body">
                        {/* Segmented Tab Navigation */}
                        <div className="at-settings-tabs-bar">
                            <button
                                type="button"
                                className={`at-settings-tab-btn ${activeSettingsTab === 'workHours' ? 'active' : ''}`}
                                onClick={() => setActiveSettingsTab('workHours')}
                            >
                                <span className="material-symbols-outlined">schedule</span>
                                <span>{t('settingsHub.tabWorkHours')}</span>
                            </button>
                            <button
                                type="button"
                                className={`at-settings-tab-btn ${activeSettingsTab === 'geofencing' ? 'active' : ''}`}
                                onClick={() => setActiveSettingsTab('geofencing')}
                            >
                                <span className="material-symbols-outlined">pin_drop</span>
                                <span>{t('settingsHub.tabGeofencing')}</span>
                            </button>
                        </div>

                        {/* 🕒 TAB 1: Department Work Hours */}
                        {activeSettingsTab === 'workHours' && (
                            <div className="at-settings-tab-pane">
                                {deptHours.length === 0 ? (
                                    <div className="at-empty-dept-alert">
                                        ⚠️ {t('settingsHub.noDepartments')}
                                    </div>
                                ) : (
                                    deptHours.map(d => {
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
                                                    <input
                                                        type="time"
                                                        className="at-time-input"
                                                        value={d.startTime}
                                                        disabled={!isEditing}
                                                        onChange={e => handleHourChange(d.dept, 'startTime', e.target.value)}
                                                    />
                                                </div>

                                                <div className="at-dept-field">
                                                    <label className="at-field-label">{t('workHours.endTime')}</label>
                                                    <input
                                                        type="time"
                                                        className="at-time-input"
                                                        value={d.endTime}
                                                        disabled={!isEditing}
                                                        onChange={e => handleHourChange(d.dept, 'endTime', e.target.value)}
                                                    />
                                                </div>

                                                <div className="at-dept-field">
                                                    <label className="at-field-label">{t('workHours.totalHours')}</label>
                                                    <span className="at-total-hours">{calcHours(d.startTime, d.endTime)}</span>
                                                </div>

                                                <div className="at-dept-field">
                                                    <label className="at-field-label">{t('workHours.gracePeriod')}</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="60"
                                                        className="at-grace-input"
                                                        value={d.gracePeriod}
                                                        disabled={!isEditing}
                                                        onChange={e => handleHourChange(d.dept, 'gracePeriod', e.target.value)}
                                                    />
                                                </div>

                                                <div className="at-dept-field at-dept-days-field">
                                                    <label className="at-field-label">{t('workHours.workDays')}</label>
                                                    <div className="at-days-pills">
                                                        {WEEKDAYS.map(day => (
                                                            <button
                                                                key={day}
                                                                type="button"
                                                                className={`at-day-pill ${d.workDays.includes(day) ? 'active' : ''} ${!isEditing ? 'readonly' : ''}`}
                                                                onClick={() => isEditing && toggleDay(d.dept, day)}
                                                                disabled={!isEditing}
                                                                title={t(`days.${day}`)}
                                                            >
                                                                {t(`days.${day}`)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="at-dept-actions">
                                                    {isEditing ? (
                                                        <>
                                                            <button type="button" className="at-btn-save" onClick={() => handleSave(d.dept)}>
                                                                <span className="material-symbols-outlined">check</span>
                                                                {t('workHours.save')}
                                                            </button>
                                                            <button type="button" className="at-btn-cancel" onClick={() => setEditingDept(null)}>
                                                                {t('workHours.cancel')}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className={`at-btn-edit ${justSaved ? 'saved' : ''}`}
                                                            onClick={() => setEditingDept(d.dept)}
                                                        >
                                                            {justSaved ? (
                                                                <>
                                                                    <span className="material-symbols-outlined">check_circle</span>
                                                                    {t('workHours.saved')}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="material-symbols-outlined">edit</span>
                                                                    {t('workHours.edit')}
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* 📍 TAB 2: Geofencing & Locations */}
                        {activeSettingsTab === 'geofencing' && (
                            <div className="at-settings-tab-pane">
                                {/* Search Map Input */}
                                <div className="at-map-search-row">
                                    <input 
                                        type="text" 
                                        className="at-search-input" 
                                        placeholder={t('geofencing.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearchLocation(e);
                                            }
                                        }}
                                    />
                                    <button 
                                        type="button" 
                                        className="at-btn-save" 
                                        onClick={handleSearchLocation}
                                        disabled={isSearchingMap}
                                    >
                                        <span className="material-symbols-outlined">search</span>
                                        <span>{isSearchingMap ? t('geofencing.searching') : t('geofencing.searchBtn')}</span>
                                    </button>
                                </div>

                                {/* Leaflet Map Div Container */}
                                <div className="at-map-container-wrapper">
                                    <label className="at-map-hint">
                                        {t('geofencing.clickMapHint')}
                                    </label>
                                    <div 
                                        ref={mapRef} 
                                        className="at-leaflet-map-div"
                                    />
                                </div>

                                {/* Form to Add Location */}
                                <form onSubmit={handleAddLocation} className="at-geo-grid-form">
                                    <div className="at-form-group">
                                        <label>{t('geofencing.branchName')}</label>
                                        <input
                                            type="text"
                                            className="at-time-input"
                                            placeholder={t('geofencing.branchNamePlaceholder')}
                                            value={locName}
                                            onChange={e => setLocName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="at-form-group">
                                        <label>{t('geofencing.latitude')}</label>
                                        <input
                                            type="text"
                                            className="at-time-input"
                                            placeholder={t('geofencing.latitudePlaceholder')}
                                            value={locLat}
                                            onChange={e => setLocLat(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="at-form-group">
                                        <label>{t('geofencing.longitude')}</label>
                                        <input
                                            type="text"
                                            className="at-time-input"
                                            placeholder={t('geofencing.longitudePlaceholder')}
                                            value={locLon}
                                            onChange={e => setLocLon(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="at-form-group">
                                        <label>{t('geofencing.radius')}</label>
                                        <input
                                            type="number"
                                            min="10"
                                            max="5000"
                                            className="at-grace-input"
                                            value={locRadius}
                                            onChange={e => setLocRadius(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <button type="submit" className="at-btn-save" style={{ height: '40px', width: '100%', cursor: 'pointer' }} disabled={isSavingLoc}>
                                            <span className="material-symbols-outlined">add_location</span>
                                            {isSavingLoc ? t('geofencing.savingBranch') : t('geofencing.addBranchBtn')}
                                        </button>
                                    </div>
                                </form>

                                {/* Locations Table */}
                                <div className="at-table-wrapper">
                                    <table className="at-table">
                                        <thead>
                                            <tr>
                                                <th>{t('geofencing.table.branchName')}</th>
                                                <th>{t('geofencing.table.latitude')}</th>
                                                <th>{t('geofencing.table.longitude')}</th>
                                                <th>{t('geofencing.table.radius')}</th>
                                                <th>{t('geofencing.table.status')}</th>
                                                <th>{t('geofencing.table.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {officeLocations.map(loc => (
                                                <tr key={loc.id}>
                                                    <td style={{ fontWeight: 'bold' }}>{loc.name}</td>
                                                    <td>{parseFloat(loc.latitude).toFixed(6)}</td>
                                                    <td>{parseFloat(loc.longitude).toFixed(6)}</td>
                                                    <td>{loc.radius_meters} {t('geofencing.table.meters')}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleLocation(loc.id, loc.is_active)}
                                                            className={`at-loc-status-btn ${loc.is_active ? 'active' : 'inactive'}`}
                                                        >
                                                            {loc.is_active ? t('geofencing.table.active') : t('geofencing.table.inactive')}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteLocation(loc.id)}
                                                            className="at-btn-cancel"
                                                            style={{ color: '#ef4444' }}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                                            {t('geofencing.table.delete')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {officeLocations.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="at-no-results">
                                                        {t('geofencing.table.noLocations')}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </Accordion>
            </div>

            {/* Filter Section */}
            <div className="at-filter-card">
                <div className="at-all-filt">
                    <input
                        type="text"
                        className="at-search-input"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => handleAttendanceSearchChange(e.target.value)}
                    />

                    <div className="at-filters-row">
                        <FilterDropdown
                            value={deptFilter}
                            onChange={setDeptFilter}
                            options={departmentOptions}
                            placeholder={t('filters.department')}
                        />

                        <FilterDropdown
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusOptions}
                            placeholder={t('filters.status')}
                        />

                        <input
                            type="date"
                            className="at-search-input"
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                            aria-label="Attendance date"
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Main Table */}
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
                            {attendanceLoading ? (
                                <tr>
                                    <td colSpan="8" className="at-no-results">
                                        {t('loading')}
                                    </td>
                                </tr>
                            ) : attendanceError ? (
                                <tr>
                                    <td colSpan="8" className="at-no-results" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                        {attendanceError}
                                    </td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((row, i) => {
                                    const employeeName = row.name || row.full_name || '—';
                                    const employeeId = row.employee_id || row.id || '—';
                                    const timeIn = row.timeIn || row.time_in || '—';
                                    const timeOut = row.timeOut || row.time_out || '—';
                                    const duration = row.duration || '—';
                                    const latenessReason =
                                        row.latenessReason ||
                                        row.lateness_reason ||
                                        '-';

                                    return (
                                        <tr key={row.id || row.employee_id || i}>
                                            <td>
                                                <div className="at-employee-cell">
                                                    {row.img ? (
                                                        <img
                                                            src={row.img}
                                                            alt={employeeName}
                                                            className="at-avatar"
                                                        />
                                                    ) : (
                                                        <Avatar
                                                            user={{ full_name: employeeName }}
                                                            size="sm"
                                                        />
                                                    )}
                                                    <span className="at-employee-name">
                                                        {employeeName}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="at-employee-id">
                                                    {employeeId}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="at-date">
                                                    {row.date || '—'}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="at-time">
                                                    {timeIn}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="at-time">
                                                    {timeOut}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="at-duration">
                                                    {duration}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={`at-status-badge at-status-${row.status || 'unknown'}`}>
                                                    {row.status
                                                        ? t(`status.${row.status}`)
                                                        : '—'}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="at-lateness-reason">
                                                    {latenessReason === '-' || !latenessReason
                                                        ? <span className="at-dash">—</span>
                                                        : latenessReason}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
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
