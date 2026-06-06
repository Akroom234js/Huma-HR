import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './EvalTemplateBuilder.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

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

  /* ── save / export ── */
  const buildPayload = () => {
    const config = { components: {} };
    Object.entries(template.components).forEach(([key, comp]) => {
      const subs = {};
      Object.entries(comp.sub_components).forEach(([sk, sv]) => {
        subs[sk] = { value: sv.value, ...(sv.max_score !== undefined ? { max_score: sv.max_score } : {}) };
      });
      config.components[key] = {
        weight: comp.weight,
        is_active: comp.is_active,
        sub_components: subs,
      };
    });
    config.decision_thresholds = {};
    Object.entries(template.decision_thresholds).forEach(([k, v]) => {
      config.decision_thresholds[k] = { min: v.min, max: v.max };
    });
    return { name: template.name, config };
  };

  const handleSave = () => {
    if (!weightsOk) return;
    const payload = buildPayload();
    console.log('📦 Template Payload to POST /performance/templates:', payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          <button className="etb-save-btn" onClick={handleSave} disabled={!weightsOk}>
            <span className="material-symbols-outlined">{saved ? 'check_circle' : 'save'}</span>
            {saved ? t('saved') : t('save_template')}
          </button>
        </div>
      </div>

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
          {/* JSON payload preview */}
          <div className="card-hr etb-json-wrap">
            <div className="card-title-hr">
              <span>
                <span className="material-symbols-outlined">data_object</span>
                {t('json_payload')}
              </span>
              <button className="etb-copy-btn"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(buildPayload(), null, 2))}>
                <span className="material-symbols-outlined">content_copy</span>
                {t('copy')}
              </button>
            </div>
            <pre className="etb-json-pre">{JSON.stringify(buildPayload(), null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
