import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './EvalTemplateBuilder.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import {
  getPerformanceTemplates,
  createPerformanceTemplate,
  updatePerformanceTemplate,
  deletePerformanceTemplate
} from '../../../../services/PerformanceHrService';

/* ─── helpers ─────────────────────────────────────────────── */
const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, Number(v) || 0));
const sum   = (obj) => Object.values(obj).reduce((a, b) => a + Number(b), 0);
const fmt   = (n)   => Number(n).toFixed(2);

/* ─── default template ────────────────────────────────────── */
const DEFAULT_TEMPLATE = {
  name: 'القالب الافتراضي للشركة',
  components: {
    tasks: {
      label: 'درجة المهام',
      icon: 'task_alt',
      color: '#3b82f6',
      weight: 40,
      is_active: true,
      sub_components: {
        completion_weight:           { label: 'وزن الاكتمال',            value: 60,  unit: '%',  min: 0, max: 100 },
        quality_weight:              { label: 'وزن الجودة',              value: 40,  unit: '%',  min: 0, max: 100 },
        late_penalty_per_day_percent:{ label: 'خصم التأخير اليومي',      value: 5,   unit: '%',  min: 0, max: 20  },
        max_late_penalty_percent:    { label: 'الحد الأقصى للخصم',      value: 50,  unit: '%',  min: 0, max: 100 },
      },
    },
    manager: {
      label: 'درجة المدير',
      icon: 'manage_accounts',
      color: '#8b5cf6',
      weight: 25,
      is_active: true,
      sub_components: {
        professionalism: { label: 'الاحترافية',      value: 33.33, unit: '%', min: 0, max: 100, max_score: 10 },
        responsibility:  { label: 'المسؤولية',        value: 33.33, unit: '%', min: 0, max: 100, max_score: 10 },
        problem_solving: { label: 'حل المشكلات',     value: 33.34, unit: '%', min: 0, max: 100, max_score: 10 },
      },
    },
    peer: {
      label: 'درجة الزملاء',
      icon: 'groups',
      color: '#10b981',
      weight: 15,
      is_active: true,
      sub_components: {
        teamwork:    { label: 'العمل الجماعي', value: 50, unit: '%', min: 0, max: 100 },
        cooperation: { label: 'التعاون',       value: 50, unit: '%', min: 0, max: 100 },
      },
    },
    attendance: {
      label: 'درجة الحضور',
      icon: 'how_to_reg',
      color: '#f59e0b',
      weight: 10,
      is_active: true,
      sub_components: {
        points_full_attendance: { label: 'حضور كامل',       value: 10, unit: 'نقطة', min: 0, max: 20 },
        points_minor_late:      { label: 'تأخير بسيط',      value: 7,  unit: 'نقطة', min: 0, max: 20 },
        points_repeated_late:   { label: 'تأخير متكرر',     value: 4,  unit: 'نقطة', min: 0, max: 20 },
        points_absent:          { label: 'غياب',             value: 0,  unit: 'نقطة', min: 0, max: 20 },
      },
    },
    overtime: {
      label: 'العمل الإضافي',
      icon: 'more_time',
      color: '#ec4899',
      weight: 10,
      is_active: true,
      sub_components: {
        multiplier:    { label: 'معامل الحساب', value: 2,   unit: 'x',       min: 0.5, max: 10  },
        max_score_cap: { label: 'الحد الأقصى', value: 100, unit: 'نقطة',     min: 10,  max: 200 },
      },
    },
  },
  decision_thresholds: {
    promotion_bonus:   { label: 'ترقية + مكافأة', color: '#10b981', icon: 'emoji_events',  min: 90,  max: 100 },
    bonus:             { label: 'مكافأة',          color: '#3b82f6', icon: 'redeem',        min: 75,  max: 89  },
    training_required: { label: 'يتطلب تدريباً',   color: '#f59e0b', icon: 'school',        min: 60,  max: 74  },
    warning:           { label: 'إنذار',            color: '#ef4444', icon: 'warning',       min: 0,   max: 59  },
  },
};

/* ─── tiny helpers ────────────────────────────────────────── */
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function WeightRing({ value, color }) {
  const r = 28, C = 2 * Math.PI * r;
  const offset = C - (value / 100) * C;
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" className="etb-ring">
      <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7" />
      <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={C} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 35 35)"
        style={{ transition: 'stroke-dashoffset .5s ease' }}
      />
      <text x="35" y="40" textAnchor="middle" fontSize="13" fontWeight="700"
        fill={color}>{value}%</text>
    </svg>
  );
}

function SubRow({ label, field, value, unit, min, max, onChange, hasMaxScore, maxScore, onMaxScoreChange }) {
  const { t } = useTranslation('HrPerformance/EvalTemplateBuilder');
  const displayUnit = unit === 'نقطة' ? (value > 1 && value < 11 ? t('point_plural') : t('point')) : unit;
  return (
    <div className="etb-sub-row">
      <span className="etb-sub-label">{label}</span>
      <div className="etb-sub-controls">
        {hasMaxScore && (
          <div className="etb-max-score-wrap">
            <span className="etb-unit-tag">{t('max_cap')}</span>
            <input type="number" className="etb-num-input etb-narrow"
              value={maxScore} min={1} max={50}
              onChange={(e) => onMaxScoreChange(Number(e.target.value))} />
          </div>
        )}
        <input type="range" className="etb-range"
          min={min} max={max} step={0.01} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ '--track-color': 'rgba(255,255,255,.1)' }}
        />
        <input type="number" className="etb-num-input"
          value={fmt(value)} min={min} max={max} step={0.01}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <span className="etb-unit-tag">{displayUnit}</span>
      </div>
    </div>
  );
}

/* ─── main component ──────────────────────────────────────── */
export default function EvalTemplateBuilder() {
  const { t } = useTranslation('HrPerformance/EvalTemplateBuilder');
  const [template, setTemplate] = useState(() => {
    const defaultTpl = deepClone(DEFAULT_TEMPLATE);
    defaultTpl.name = t('default_template_name');
    return defaultTpl;
  });
  const [isNameCustomized, setIsNameCustomized] = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [tab,      setTab]      = useState('components'); // components | decisions | preview
  const [expandedComp, setExpandedComp] = useState(null);

  useEffect(() => {
    if (!isNameCustomized) {
      setTemplate(prev => {
        const next = deepClone(prev);
        next.name = t('default_template_name');
        return next;
      });
    }
  }, [t, isNameCustomized]);

  /* ── active components ── */
  const activeComps = Object.entries(template.components).filter(([, c]) => c.is_active);
  const totalWeight = activeComps.reduce((a, [, c]) => a + Number(c.weight), 0);
  const weightsOk   = Math.abs(totalWeight - 100) < 0.01;

  /* ── toggle component active ── */
  const toggleActive = (key) => {
    setTemplate(prev => {
      const next = deepClone(prev);
      next.components[key].is_active = !next.components[key].is_active;
      return next;
    });
  };

  /* ── update top-level weight ── */
  const updateWeight = (key, val) => {
    setTemplate(prev => {
      const next = deepClone(prev);
      next.components[key].weight = clamp(val);
      return next;
    });
  };

  /* ── update sub-component value ── */
  const updateSub = (compKey, subKey, val) => {
    setTemplate(prev => {
      const next = deepClone(prev);
      next.components[compKey].sub_components[subKey].value = val;
      return next;
    });
  };

  /* ── update max_score of sub-component ── */
  const updateMaxScore = (compKey, subKey, val) => {
    setTemplate(prev => {
      const next = deepClone(prev);
      next.components[compKey].sub_components[subKey].max_score = val;
      return next;
    });
  };

  /* ── update decision threshold ── */
  const updateThreshold = (key, field, val) => {
    setTemplate(prev => {
      const next = deepClone(prev);
      next.decision_thresholds[key][field] = clamp(val, 0, 100);
      return next;
    });
  };

  /* ── auto-distribute weights ── */
  const autoDistribute = () => {
    const keys = Object.keys(template.components).filter(k => template.components[k].is_active);
    if (!keys.length) return;
    const each = +(100 / keys.length).toFixed(2);
    const remainder = +(100 - each * (keys.length - 1)).toFixed(2);
    setTemplate(prev => {
      const next = deepClone(prev);
      keys.forEach((k, i) => {
        next.components[k].weight = i === keys.length - 1 ? remainder : each;
      });
      return next;
    });
  };

  const [templateId, setTemplateId] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load all templates from backend
  const loadAllTemplates = async () => {
    try {
      const res = await getPerformanceTemplates();
      const raw = res?.data?.data || res?.data || [];
      const list = Array.isArray(raw) ? raw : [];
      setSavedTemplates(list);
      return list;
    } catch (err) {
      console.error("Failed to load evaluation templates:", err);
      return [];
    }
  };

  const applyTemplateToEditor = (tpl) => {
    if (!tpl) return;
    setTemplateId(tpl.id);
    setTemplate(prev => {
      const next = deepClone(prev);
      next.name = tpl.name || prev.name;

      // Check if components exist in raw_components or components array
      const rawComps = tpl.raw_components || {};
      if (Object.keys(rawComps).length > 0) {
        Object.entries(rawComps).forEach(([k, v]) => {
          if (next.components[k]) {
            next.components[k].weight = is_array_or_obj_weight(v);
            next.components[k].is_active = is_array_or_obj_active(v);
            const subs = v.sub_components || v.sub_weights;
            if (subs && next.components[k].sub_components) {
              Object.entries(subs).forEach(([sk, sv]) => {
                if (next.components[k].sub_components[sk]) {
                  next.components[k].sub_components[sk].value = sv.value ?? (typeof sv === 'number' ? sv : next.components[k].sub_components[sk].value);
                  if (sv.max_score !== undefined) {
                    next.components[k].sub_components[sk].max_score = sv.max_score;
                  }
                }
              });
            }
          }
        });
      } else if (Array.isArray(tpl.components)) {
        tpl.components.forEach(c => {
          const key = c.key || c.component_key;
          if (next.components[key]) {
            next.components[key].weight = c.weight ?? next.components[key].weight;
            next.components[key].is_active = c.is_active ?? true;
          }
        });
      }

      return next;
    });
    setIsNameCustomized(true);
  };

  const is_array_or_obj_weight = (v) => {
    if (typeof v === 'number') return v;
    if (v && typeof v.weight === 'number') return v.weight;
    return 0;
  };

  const is_array_or_obj_active = (v) => {
    if (typeof v === 'boolean') return v;
    if (v && typeof v.is_active === 'boolean') return v.is_active;
    return true;
  };

  useEffect(() => {
    const init = async () => {
      const list = await loadAllTemplates();
      if (list.length > 0) {
        const defaultTpl = list.find(t => t.is_active || t.is_default) || list[0];
        applyTemplateToEditor(defaultTpl);
      }
    };
    init();
  }, []);

  const handleSelectTemplate = (tpl) => {
    applyTemplateToEditor(tpl);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleCreateNewTemplate = () => {
    setTemplateId(null);
    const newTpl = deepClone(DEFAULT_TEMPLATE);
    newTpl.name = 'قالب تقييم جديد 2026';
    setTemplate(newTpl);
    setIsNameCustomized(true);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleDeleteTemplate = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا القالب؟')) return;
    try {
      await deletePerformanceTemplate(id);
      alert('تم حذف القالب بنجاح.');
      const list = await loadAllTemplates();
      if (templateId === id && list.length > 0) {
        applyTemplateToEditor(list[0]);
      }
    } catch (err) {
      console.error("Failed to delete template:", err);
      const msg = err.response?.data?.message || 'تعذر حذف القالب لأنه مستخدم في دورات أداء.';
      alert(msg);
    }
  };

  /* ── save / export ── */
  const buildPayload = (asNew = false) => {
    const components = {};
    Object.entries(template.components).forEach(([key, comp]) => {
      const subs = {};
      if (comp.sub_components) {
        Object.entries(comp.sub_components).forEach(([sk, sv]) => {
          subs[sk] = { value: sv.value, ...(sv.max_score !== undefined ? { max_score: sv.max_score } : {}) };
        });
      }
      components[key] = {
        weight: comp.is_active ? Number(comp.weight) : 0,
        is_active: Boolean(comp.is_active),
        sub_components: subs,
      };
    });
    return { 
      name: template.name, 
      components, 
      is_default: !asNew && templateId ? undefined : true 
    };
  };

  const handleSave = async (saveAsNew = false) => {
    if (!weightsOk) {
      alert(`مجموع أوزان المعايير الحالية هو (${totalWeight}%)، ويجب أن يساوي 100% تماماً.`);
      return;
    }
    const payload = buildPayload(saveAsNew);
    try {
      setIsSaving(true);
      if (templateId && !saveAsNew) {
        await updatePerformanceTemplate(templateId, payload);
      } else {
        const res = await createPerformanceTemplate(payload);
        if (res.data?.data?.id) setTemplateId(res.data.data.id);
      }
      setSaved(true);
      await loadAllTemplates();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save template:", error);
      const errors = error.response?.data?.errors;
      let msg = error.response?.data?.message || "تعذر حفظ القالب.";
      if (errors && typeof errors === 'object') {
        const detailed = Object.values(errors).flat().join('\n');
        if (detailed) msg = detailed;
      }
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const activeLoadedTpl = savedTemplates.find(t => t.id === templateId);

  /* ─── formula preview ─── */
  const FormulaPreview = () => (
    <div className="etb-formula-wrap">
      <div className="etb-formula-title">
        <span className="material-symbols-outlined">functions</span>
        {t('final_score_formula')}
      </div>
      <div className="etb-formula-eq">
        {t('final_score')} =
        {activeComps.map(([key, comp], i) => (
          <span key={key} className="etb-formula-term" style={{ '--c': comp.color }}>
            {i > 0 && ' + '}
            <span className="etb-formula-label">{t(`components.${key}.label`)}</span>
            <span className="etb-formula-x">×</span>
            <span className="etb-formula-pct">{comp.weight}%</span>
          </span>
        ))}
      </div>

      {/* task formula */}
      {template.components.tasks.is_active && (
        <div className="etb-sub-formula">
          <span className="etb-sf-head" style={{ color: template.components.tasks.color }}>{t('components.tasks.label')} =</span>
          ({t('components.tasks.sub_components.completion_weight')} × {template.components.tasks.sub_components.completion_weight.value}%) +
          ({t('components.tasks.sub_components.quality_weight')} × {template.components.tasks.sub_components.quality_weight.value}%) -
          ({t('days_late')} × {template.components.tasks.sub_components.late_penalty_per_day_percent.value}%
          [{t('max_cap')} {template.components.tasks.sub_components.max_late_penalty_percent.value}%])
        </div>
      )}

      {/* manager formula */}
      {template.components.manager.is_active && (
        <div className="etb-sub-formula">
          <span className="etb-sf-head" style={{ color: template.components.manager.color }}>{t('components.manager.label')} =</span>
          {Object.entries(template.components.manager.sub_components).map(([k, sv], i) => (
            <span key={k}>
              {i > 0 && ' + '}
              ({t(`components.manager.sub_components.${k}`)} [{fmt(sv.value)}%] / {sv.max_score ?? 10})
            </span>
          ))} × 10
        </div>
      )}

      {/* decisions */}
      <div className="etb-decisions-preview">
        <div className="etb-dp-title">
          <span className="material-symbols-outlined">pivot_table_chart</span>
          {t('auto_decisions_table')}
        </div>
        <div className="etb-dp-grid">
          {Object.entries(template.decision_thresholds).map(([key, d]) => (
            <div key={key} className="etb-dp-card" style={{ '--dc': d.color }}>
              <span className="material-symbols-outlined etb-dp-icon">{d.icon}</span>
              <strong>{t(`decision_thresholds.${key}`)}</strong>
              <span className="etb-dp-range">{d.min} – {d.max}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ─── JSX ─── */
  return (
    <div className="performance-container etb-root">

      {/* ── header ── */}
      <div className="etb-header">
        <div className="etb-header-left">
          <span className="material-symbols-outlined etb-head-icon">tune</span>
          <div>
            <h2 className="etb-title">{t('title')}</h2>
            <p className="etb-subtitle">{t('subtitle')}</p>
          </div>
        </div>
        <div className="etb-header-right">
          <div className="em-theme-toggle-wrapper"><ThemeToggle /></div>
          {templateId && (
            <button 
              className="etb-auto-btn" 
              onClick={() => handleSave(true)} 
              disabled={!weightsOk || isSaving}
              style={{ padding: '10px 16px' }}
            >
              <span className="material-symbols-outlined">add_circle</span>
              {t('save_as_new') || 'حفظ كنسخة جديدة'}
            </button>
          )}
          <button className="etb-save-btn" onClick={() => handleSave(false)} disabled={!weightsOk || isSaving}>
            <span className="material-symbols-outlined">{saved ? 'check_circle' : 'save'}</span>
            {saved ? t('saved') : (templateId ? (t('save_changes') || 'حفظ التعديلات') : t('save_template'))}
          </button>
        </div>
      </div>

      {/* ── SAVED TEMPLATES OVERVIEW CARDS ── */}
      <div className="etb-templates-section">
        <div className="etb-sec-head">
          <div className="etb-sec-title">
            <span className="material-symbols-outlined">view_carousel</span>
            <span>{t('saved_templates') || 'قوالب التقييم المحفوظة في النظام'} ({savedTemplates.length})</span>
          </div>
          <button className="etb-new-tpl-btn" onClick={handleCreateNewTemplate}>
            <span className="material-symbols-outlined">add</span>
            <span>{t('create_new') || 'إنشاء قالب جديد'}</span>
          </button>
        </div>

        <div className="etb-templates-grid">
          {savedTemplates.map((tpl) => {
            const isSelected = tpl.id === templateId;
            const hasActiveCycle = !!tpl.active_cycle;
            const componentsList = tpl.components || [];

            return (
              <div 
                key={tpl.id} 
                className={`etb-tpl-card ${isSelected ? 'selected' : ''} ${hasActiveCycle ? 'is-active-cycle' : ''}`}
                onClick={() => handleSelectTemplate(tpl)}
              >
                <div className="etb-tpl-header">
                  <div className="etb-tpl-badges">
                    {hasActiveCycle && (
                      <span className="etb-badge-active-cycle" title={`${t('active_for_cycle') || 'دورة نشطة'}: ${tpl.active_cycle.title}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                        {t('active_for_cycle') || 'مفعل لدورة'}: {tpl.active_cycle.title}
                      </span>
                    )}
                    {tpl.is_default && (
                      <span className="etb-badge-default">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>star</span>
                        {t('default_badge') || 'القالب الافتراضي'}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {tpl.cycles_count || 0} {t('cycles_count') || 'دورات'}
                    </span>
                  </div>

                  <h3 className="etb-tpl-name">
                    <span>{tpl.name}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined" style={{ color: '#359EFF', fontSize: '18px' }}>
                        edit
                      </span>
                    )}
                  </h3>

                  {hasActiveCycle && (
                    <div className="etb-tpl-cycle-info">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>event</span>
                      <span>{t('cycle_period') || 'فترة الدورة'}: {tpl.active_cycle.start_date} → {tpl.active_cycle.end_date}</span>
                    </div>
                  )}
                </div>

                {/* Weight Minibar */}
                <div className="etb-tpl-minibar">
                  {componentsList.filter(c => c.is_active !== false).map((c, idx) => {
                    const compColors = {
                      tasks: '#359EFF',
                      manager: '#8b5cf6',
                      peer: '#10b981',
                      attendance: '#f59e0b',
                      overtime: '#ef4444',
                      self_assessment: '#6b7280'
                    };
                    const color = compColors[c.key] || '#359EFF';
                    return (
                      <div 
                        key={idx} 
                        className="etb-minibar-segment" 
                        style={{ width: `${c.weight}%`, backgroundColor: color }}
                        title={`${c.key}: ${c.weight}%`}
                      />
                    );
                  })}
                </div>

                {/* Weight distribution labels */}
                <div className="etb-tpl-comp-labels">
                  {componentsList.filter(c => c.is_active !== false).map((c, idx) => {
                    const compColors = {
                      tasks: '#359EFF',
                      manager: '#8b5cf6',
                      peer: '#10b981',
                      attendance: '#f59e0b',
                      overtime: '#ef4444',
                      self_assessment: '#6b7280'
                    };
                    return (
                      <span key={idx} className="etb-tpl-comp-item">
                        <span className="etb-comp-dot" style={{ backgroundColor: compColors[c.key] || '#359EFF' }}></span>
                        <span>{t(`components.${c.key}.label` || c.key)}: <strong>{c.weight}%</strong></span>
                      </span>
                    );
                  })}
                </div>

                <div className="etb-tpl-footer">
                  <button className="etb-card-load-btn" onClick={() => handleSelectTemplate(tpl)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>tune</span>
                    <span>{isSelected ? (t('currently_editing') || 'قيد التعديل الآن') : (t('edit_in_editor') || 'تعديل في المحرر')}</span>
                  </button>

                  {!hasActiveCycle && (!tpl.cycles_count || tpl.cycles_count === 0) && (
                    <button 
                      className="etb-card-del-btn" 
                      title={t('delete') || 'حذف القالب'}
                      onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ACTIVE CYCLE BANNER IF LOADED TEMPLATE IS LINKED ── */}
      {activeLoadedTpl?.active_cycle && (
        <div className="etb-active-cycle-banner">
          <div className="etb-banner-left">
            <span className="material-symbols-outlined etb-banner-icon">verified</span>
            <div className="etb-banner-text">
              <h4>هذا القالب معتمد ومفعّل حالياً لدورة الأداء: "{activeLoadedTpl.active_cycle.title}"</h4>
              <p>تاريخ بدء الدورة: {activeLoadedTpl.active_cycle.start_date} — تاريخ الانتهاء: {activeLoadedTpl.active_cycle.end_date} (الحالة: نشطة Active)</p>
            </div>
          </div>
          <span className="etb-badge-active-cycle">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
            مربوط بدورة نشطة
          </span>
        </div>
      )}

      {/* ── template name ── */}
      <div className="etb-name-row card-hr">
        <span className="material-symbols-outlined etb-name-icon">label</span>
        <div className="etb-name-field-wrap">
          <label>{t('template_name')}</label>
          <input className="etb-name-input" value={template.name}
            onChange={e => {
              setTemplate(prev => ({ ...prev, name: e.target.value }));
              setIsNameCustomized(true);
            }} />
        </div>
        {templateId && (
          <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
            ID: #{templateId}
          </span>
        )}
      </div>

      {/* ── tabs ── */}
      <div className="etb-tabs">
        {[
          { id: 'components', label: t('tabs.components'),  icon: 'leaderboard'   },
          { id: 'decisions',  label: t('tabs.decisions'),   icon: 'low_priority'  },
          { id: 'preview',    label: t('tabs.preview'),     icon: 'functions'     },
        ].map(tabItem => (
          <button key={tabItem.id}
            className={`etb-tab ${tab === tabItem.id ? 'active' : ''}`}
            onClick={() => setTab(tabItem.id)}>
            <span className="material-symbols-outlined">{tabItem.icon}</span>
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════ TAB: COMPONENTS ═══════════════════ */}
      {tab === 'components' && (
        <div className="etb-tab-body">

          {/* weight status bar */}
          <div className={`etb-weight-bar card-hr ${weightsOk ? 'ok' : 'error'}`}>
            <div className="etb-wb-left">
              <span className="material-symbols-outlined">{weightsOk ? 'check_circle' : 'error'}</span>
              <span>{t('total_weight')} <strong>{fmt(totalWeight)}%</strong></span>
              {!weightsOk && <span className="etb-wb-hint">{t('must_equal_100')}</span>}
            </div>
            <button className="etb-auto-btn" onClick={autoDistribute}>
              <span className="material-symbols-outlined">auto_fix_high</span>
              {t('auto_distribute')}
            </button>
          </div>

          {/* weight overview rings */}
          <div className="etb-rings-row card-hr">
            {Object.entries(template.components).map(([key, comp]) => (
              <div key={key} className={`etb-ring-item ${!comp.is_active ? 'inactive' : ''}`}>
                <WeightRing value={comp.weight} color={comp.is_active ? comp.color : '#6b7280'} />
                <span className="etb-ring-label">{t(`components.${key}.label`)}</span>
              </div>
            ))}
          </div>

          {/* component cards */}
          {Object.entries(template.components).map(([key, comp]) => (
            <div key={key} className={`etb-comp-card card-hr ${!comp.is_active ? 'etb-disabled' : ''}`}
              style={{ '--comp-color': comp.color }}>

              {/* card header */}
              <div className="etb-comp-header">
                <div className="etb-comp-title-wrap">
                  <span className="material-symbols-outlined etb-comp-icon">{comp.icon}</span>
                  <div>
                    <h3 className="etb-comp-name">{t(`components.${key}.label`)}</h3>
                    <p className="etb-comp-hint">
                      {comp.is_active
                        ? t('represents_pct', { weight: comp.weight })
                        : t('disabled_hint')}
                    </p>
                  </div>
                </div>
                <div className="etb-comp-controls">
                  {/* weight input */}
                  {comp.is_active && (
                    <div className="etb-weight-ctrl">
                      <label>{t('weight')}</label>
                      <div className="etb-weight-inp-wrap">
                        <input type="number" min={0} max={100} step={0.5}
                          value={comp.weight}
                          onChange={e => updateWeight(key, parseFloat(e.target.value))}
                          className="etb-weight-inp" />
                        <span>%</span>
                      </div>
                    </div>
                  )}
                  {/* toggle */}
                  <button className={`etb-toggle-btn ${comp.is_active ? 'on' : 'off'}`}
                    onClick={() => toggleActive(key)}>
                    <span className="material-symbols-outlined">{comp.is_active ? 'toggle_on' : 'toggle_off'}</span>
                    {comp.is_active ? t('active') : t('inactive')}
                  </button>
                  {/* expand */}
                  {comp.is_active && (
                    <button className="etb-expand-btn"
                      onClick={() => setExpandedComp(expandedComp === key ? null : key)}>
                      <span className="material-symbols-outlined">
                        {expandedComp === key ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* sub-components (expanded) */}
              {comp.is_active && expandedComp === key && (
                <div className="etb-sub-body">
                  <div className="etb-sub-title">{t('internal_settings')}</div>
                  {Object.entries(comp.sub_components).map(([sk, sv]) => (
                    <SubRow key={sk}
                      label={t(`components.${key}.sub_components.${sk}`)} field={sk}
                      value={sv.value} unit={sv.unit}
                      min={sv.min}     max={sv.max}
                      hasMaxScore={'max_score' in sv}
                      maxScore={sv.max_score}
                      onChange={v => updateSub(key, sk, v)}
                      onMaxScoreChange={v => updateMaxScore(key, sk, v)}
                    />
                  ))}

                  {/* sub-weight validation for manager/peer */}
                  {(key === 'manager' || key === 'peer') && (() => {
                    const s = sum(Object.fromEntries(
                      Object.entries(comp.sub_components).map(([k, v]) => [k, v.value])
                    ));
                    const ok = Math.abs(s - 100) < 0.5;
                    return (
                      <div className={`etb-sub-sum ${ok ? 'ok' : 'error'}`}>
                        <span className="material-symbols-outlined">{ok ? 'check_circle' : 'error'}</span>
                        {t('total_internal_weight')} <strong>{fmt(s)}%</strong>
                        {!ok && t('must_equal_100_internal')}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════ TAB: DECISIONS ═══════════════════ */}
      {tab === 'decisions' && (
        <div className="etb-tab-body">
          <div className="card-hr etb-decisions-info">
            <span className="material-symbols-outlined">info</span>
            {t('decisions_info')}
          </div>
          <div className="etb-decisions-grid">
            {Object.entries(template.decision_thresholds).map(([key, d]) => (
              <div key={key} className="etb-dec-card card-hr" style={{ '--dc': d.color }}>
                <div className="etb-dec-header">
                  <span className="material-symbols-outlined etb-dec-icon">{d.icon}</span>
                  <strong className="etb-dec-label">{t(`decision_thresholds.${key}`)}</strong>
                </div>
                <div className="etb-dec-fields">
                  <div className="etb-dec-field">
                    <label>{t('min')}</label>
                    <div className="etb-dec-inp-wrap">
                      <input type="number" min={0} max={100}
                        value={d.min}
                        onChange={e => updateThreshold(key, 'min', +e.target.value)}
                        className="etb-dec-inp" />
                      <span>%</span>
                    </div>
                  </div>
                  <span className="etb-dec-sep">—</span>
                  <div className="etb-dec-field">
                    <label>{t('max')}</label>
                    <div className="etb-dec-inp-wrap">
                      <input type="number" min={0} max={100}
                        value={d.max}
                        onChange={e => updateThreshold(key, 'max', +e.target.value)}
                        className="etb-dec-inp" />
                      <span>%</span>
                    </div>
                  </div>
                </div>
                <div className="etb-dec-preview-bar">
                  <div className="etb-dec-bar-fill"
                    style={{ width: `${d.max - d.min}%`, marginLeft: `${d.min}%`, background: d.color }} />
                </div>
                <span className="etb-dec-range-label">
                  {d.min} – {d.max} {d.max > 1 && d.max < 11 ? t('point_plural') : t('point')}
                </span>
              </div>
            ))}
          </div>

          {/* visual scale */}
          <div className="card-hr etb-dec-scale">
            <div className="etb-ds-title">{t('decision_timeline')}</div>
            <div className="etb-ds-bar">
              {Object.entries(template.decision_thresholds)
                .sort((a, b) => a[1].min - b[1].min)
                .map(([key, d]) => {
                  const label = t(`decision_thresholds.${key}`);
                  return (
                    <div key={key} className="etb-ds-seg"
                      style={{ width: `${d.max - d.min + 1}%`, background: d.color }}
                      title={`${label}: ${d.min}-${d.max}`}>
                      <span>{label}</span>
                    </div>
                  );
                })}
            </div>
            <div className="etb-ds-labels">
              <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ TAB: PREVIEW ═══════════════════ */}
      {tab === 'preview' && (
        <div className="etb-tab-body">
          <FormulaPreview />
        </div>
      )}
    </div>
  );
}
