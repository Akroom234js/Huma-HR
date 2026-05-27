import React, { useState, useMemo, useRef, useEffect } from 'react';
import './Attendance.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import { useTranslation } from 'react-i18next';
import Avatar from '../../../Shared/Avatar/Avatar';
import apiClient from '../../../../apiConfig';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    const [deptHours, setDeptHours]         = useState([]);
    const [editingDept, setEditingDept]     = useState(null);
    const [saved, setSaved]                 = useState(null);

    /* Office locations section (Geofencing) */
    const [showLocations, setShowLocations] = useState(false);
    const [officeLocations, setOfficeLocations] = useState([]);
    const [locName, setLocName] = useState('');
    const [locLat, setLocLat] = useState('');
    const [locLon, setLocLon] = useState('');
    const [locRadius, setLocRadius] = useState(150);
    const [isSavingLoc, setIsSavingLoc] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchingMap, setIsSearchingMap] = useState(false);

    // Leaflet References
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);

    // Leaflet broken marker asset fix
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

    // Handle map setup when accordion is toggled open
    useEffect(() => {
        if (showLocations && mapRef.current) {
            // Short delay to allow Accordion sliding transition height to complete
            const timer = setTimeout(() => {
                if (!mapInstance.current && mapRef.current) {
                    const defaultSyriaLat = 34.8021;
                    const defaultSyriaLon = 38.9968;

                    const startLat = parseFloat(locLat) || defaultSyriaLat;
                    const startLon = parseFloat(locLon) || defaultSyriaLon;
                    const startZoom = (locLat && locLon) ? 13 : 7; // Zoom 7 is ideal to show all of Syria

                    mapInstance.current = L.map(mapRef.current).setView([startLat, startLon], startZoom);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(mapInstance.current);

                    // Click event on map to select coordinates
                    mapInstance.current.on('click', (e) => {
                        const { lat, lng } = e.latlng;
                        setLocLat(lat.toFixed(8));
                        setLocLon(lng.toFixed(8));
                    });

                    // If existing values are present, put marker immediately
                    if (locLat && locLon) {
                        updateMarker(startLat, startLon, locRadius);
                    } else {
                        // Ask for HR's GPS permission to center on current location automatically
                        if (navigator.geolocation) {
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
                                (error) => {
                                    console.log("GPS permission denied or unavailable. Fallback to Syria center.");
                                },
                                { enableHighAccuracy: true, timeout: 6000 }
                            );
                        }
                    }
                }
            }, 300);

            return () => {
                clearTimeout(timer);
            };
        } else {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                markerRef.current = null;
                circleRef.current = null;
            }
        }
    }, [showLocations]);

    // Keep circle radius visually in sync with locRadius input changes
    useEffect(() => {
        if (mapInstance.current && locLat && locLon && locRadius) {
            updateMarker(parseFloat(locLat), parseFloat(locLon), parseInt(locRadius));
        }
    }, [locLat, locLon, locRadius]);

    // Fetch locations from backend
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

    // Fetch department hours settings from backend
    const fetchDepartmentHours = async () => {
        try {
            const response = await apiClient.get('/department-hours');
            if (response.data && response.data.data) {
                const mappedHours = response.data.data.map(item => ({
                    dept: item.dept,
                    startTime: item.start_time.substring(0, 5),
                    endTime: item.end_time.substring(0, 5),
                    gracePeriod: String(item.grace_period),
                    workDays: item.work_days
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
            alert("يرجى إدخال اسم مكان للبحث عنه");
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
                alert(`تم العثور على: ${display_name}`);
            } else {
                alert("لم يتم العثور على الموقع المطلوب، يرجى كتابة اسم آخر أو مكان أدق.");
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            alert("فشل البحث عن الموقع، يرجى التحقق من الاتصال بالإنترنت والمحاولة مجدداً.");
        } finally {
            setIsSearchingMap(false);
        }
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        if (!locName || !locLat || !locLon || !locRadius) {
            alert("يرجى ملء جميع الحقول المطلوبة");
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
            
            // Clean up leaflet layers
            if (markerRef.current && mapInstance.current) {
                mapInstance.current.removeLayer(markerRef.current);
                markerRef.current = null;
            }
            if (circleRef.current && mapInstance.current) {
                mapInstance.current.removeLayer(circleRef.current);
                circleRef.current = null;
            }
            if (mapInstance.current) {
                mapInstance.current.setView([34.8021, 38.9968], 7);
            }

            fetchLocations();
            alert("تم إضافة موقع الفرع بنجاح!");
        } catch (error) {
            console.error("Failed to save location", error);
            const serverMsg = error.response?.data?.message || error.response?.data?.error || "";
            const validationErrors = error.response?.data?.errors;
            let detail = "";
            if (validationErrors && typeof validationErrors === 'object') {
                detail = Object.values(validationErrors).flat().join(" | ");
            } else if (validationErrors) {
                detail = String(validationErrors);
            }
            alert(`فشل إضافة الموقع الجغرافي: ${serverMsg} ${detail ? `(${detail})` : ''}. يرجى التحقق من الاتصال بالخادم وقيم الحقول المدخلة.`);
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
        if (!window.confirm("هل أنت متأكد من حذف موقع هذا الفرع؟")) return;
        try {
            await apiClient.delete(`/office-locations/${id}`);
            fetchLocations();
        } catch (error) {
            console.error("Failed to delete location", error);
        }
    };

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
            alert("فشل حفظ إعدادات ساعات العمل للقسم. يرجى التحقق من القيم المدخلة والاتصال بالخادم.");
        }
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
                        {deptHours.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#888', direction: 'rtl', width: '100%' }}>
                                ⚠️ لم يتم إنشاء أي أقسام في الشركة بعد. يرجى إضافة الأقسام أولاً في صفحة إدارة الأقسام لتتمكن من ضبط ساعات العمل الخاصة بها.
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
                            })
                        )}
                    </div>
                </Accordion>
            </div>

            {/* ── Office Locations Settings (Geofencing) ── */}
            <div className="at-workhours-card" style={{ marginTop: '20px' }}>
                <button
                    className="at-workhours-toggle"
                    onClick={() => setShowLocations(v => !v)}
                    aria-expanded={showLocations}
                >
                    <div className="at-workhours-toggle-left">
                        <span className="material-symbols-outlined at-wh-icon" style={{ color: '#4ade80' }}>pin_drop</span>
                        <div>
                            <span className="at-workhours-title">إعدادات المواقع الجغرافية (Geofencing)</span>
                            <span className="at-workhours-subtitle">تحديد الإحداثيات الجغرافية لفروع الشركة والقطر المسموح به للحضور</span>
                        </div>
                    </div>
                    <span className={`material-symbols-outlined at-wh-chevron ${showLocations ? 'open' : ''}`}>
                        expand_more
                    </span>
                </button>

                <Accordion open={showLocations}>
                    <div className="at-workhours-body" style={{ flexDirection: 'column', gap: '20px', padding: '20px' }}>
                        
                        {/* Search Box on Map */}
                        <div style={{ display: 'flex', gap: '10px', width: '100%', direction: 'rtl', marginBottom: '10px' }}>
                            <input 
                                type="text" 
                                className="at-search-input" 
                                style={{ flex: 1, color: '#fff', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', height: '40px', padding: '0 15px', borderRadius: '8px' }} 
                                placeholder="🔍 ابحث عن مدينة، منطقة، أو شارع لتحديده على الخريطة..." 
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
                                style={{ height: '40px', background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.4)', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} 
                                onClick={handleSearchLocation}
                                disabled={isSearchingMap}
                            >
                                {isSearchingMap ? (
                                    <span>جاري البحث...</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        <span>بحث</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Leaflet Map Div Container */}
                        <div style={{ width: '100%' }}>
                            <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '8px', textAlign: 'right', direction: 'rtl' }}>
                                📍 انقر على الخريطة لتحديد خط الطول والعرض تلقائياً:
                            </label>
                            <div 
                                ref={mapRef} 
                                style={{ 
                                    height: '300px', 
                                    width: '100%', 
                                    borderRadius: '8px', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.3)',
                                    zIndex: 1
                                }} 
                            />
                        </div>

                        {/* Form to Add Location */}
                        <form onSubmit={handleAddLocation} style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '15px',
                            alignItems: 'end',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '15px',
                            borderRadius: '8px',
                            width: '100%'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', color: '#888' }}>اسم الفرع/الموقع</label>
                                <input type="text" className="at-time-input" placeholder="الفرع الرئيسي..." value={locName} onChange={e => setLocName(e.target.value)} required style={{ color: '#fff', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', color: '#888' }}>خط العرض (Latitude)</label>
                                <input type="text" className="at-time-input" placeholder="31.963158..." value={locLat} onChange={e => setLocLat(e.target.value)} required style={{ color: '#fff', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', color: '#888' }}>خط الطول (Longitude)</label>
                                <input type="text" className="at-time-input" placeholder="35.930359..." value={locLon} onChange={e => setLocLon(e.target.value)} required style={{ color: '#fff', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', color: '#888' }}>القطر المسموح (متر)</label>
                                <input type="number" min="10" max="5000" className="at-grace-input" value={locRadius} onChange={e => setLocRadius(e.target.value)} required style={{ color: '#fff', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                            <div>
                                <button type="submit" className="at-btn-save" style={{ height: '40px', width: '100%', cursor: 'pointer' }} disabled={isSavingLoc}>
                                    <span className="material-symbols-outlined">add_location</span>
                                    إضافة الموقع
                                </button>
                            </div>
                        </form>

                        {/* List of Locations */}
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <table className="at-table" style={{ background: 'transparent' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '10px' }}>اسم الفرع</th>
                                        <th style={{ padding: '10px' }}>خط العرض (Latitude)</th>
                                        <th style={{ padding: '10px' }}>خط الطول (Longitude)</th>
                                        <th style={{ padding: '10px' }}>القطر الجغرافي</th>
                                        <th style={{ padding: '10px' }}>الحالة</th>
                                        <th style={{ padding: '10px' }}>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {officeLocations.map(loc => (
                                        <tr key={loc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{loc.name}</td>
                                            <td style={{ padding: '12px' }}>{parseFloat(loc.latitude).toFixed(6)}</td>
                                            <td style={{ padding: '12px' }}>{parseFloat(loc.longitude).toFixed(6)}</td>
                                            <td style={{ padding: '12px' }}>{loc.radius_meters} متر</td>
                                            <td style={{ padding: '12px' }}>
                                                <button
                                                    onClick={() => handleToggleLocation(loc.id, loc.is_active)}
                                                    style={{
                                                        border: 'none',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        background: loc.is_active ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)',
                                                        color: loc.is_active ? '#4ade80' : '#ef4444'
                                                    }}
                                                >
                                                    {loc.is_active ? 'نشط' : 'معطل'}
                                                </button>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button
                                                    onClick={() => handleDeleteLocation(loc.id)}
                                                    className="at-btn-cancel"
                                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '6px 12px', cursor: 'pointer' }}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {officeLocations.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                                لم يتم إدخال أي مواقع فروع للشركة بعد. يرجى استخدام النموذج أعلاه لإضافة موقعك الأول!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                                            <Avatar user={{ full_name: row.name }} size="sm" />
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
