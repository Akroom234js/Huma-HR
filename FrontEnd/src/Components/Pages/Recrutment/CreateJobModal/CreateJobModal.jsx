import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './CreateJobModal.css';
import apiClient from '../../../../apiConfig';
import { createJobPosting, updateJobPosting, publishJobPosting, closeJobPosting } from '../../../../services/atsService';

const CreateJobModal = ({ isOpen, onClose, onSave, editingJob, departmentOptions: propDeptOptions }) => {
  const { t } = useTranslation('Recrutment/OpeningJobs');

  const [formData, setFormData] = useState({
    title: '',
    department_id: '',
    position_id: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    employment_type: '',
    experience_level: '',
    location: '',
    application_deadline: '',
    description: '',
  });

  const [positions, setPositions]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors]           = useState({});
  const [actionMsg, setActionMsg]      = useState('');

  // Fetch positions and departments from API
  useEffect(() => {
    if (!isOpen) return;
    apiClient.get('/positions', { params: { per_page: 100 } }).then(res => {
      const data = res.data?.data?.positions ?? res.data?.positions ?? res.data?.data ?? res.data ?? [];
      setPositions(Array.isArray(data) ? data : []);
    }).catch(() => setPositions([]));

    apiClient.get('/departments').then(res => {
      const data = res.data?.data ?? res.data ?? [];
      setDepartments(Array.isArray(data) ? data : []);
    }).catch(() => setDepartments([]));
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingJob) {
      setFormData({
        title:                editingJob.title          || '',
        department_id:        editingJob.department?.id || editingJob.department_id || '',
        position_id:          editingJob.position_id    || '',
        salary_min:           editingJob.salary_min     || '',
        salary_max:           editingJob.salary_max     || '',
        salary_currency:      editingJob.salary_currency || 'USD',
        employment_type:      editingJob.employment_type  || '',
        experience_level:     editingJob.experience_level || '',
        location:             editingJob.location        || '',
        application_deadline: editingJob.application_deadline ? editingJob.application_deadline.slice(0, 10) : '',
        description:          editingJob.description    || '',
      });
    } else {
      setFormData({
        title: '', department_id: '', position_id: '',
        salary_min: '', salary_max: '', salary_currency: 'USD',
        employment_type: '', experience_level: '', location: '',
        application_deadline: '', description: '',
      });
    }
    setErrors({});
    setActionMsg('');
  }, [editingJob, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const buildPayload = () => {
    const p = { ...formData };
    // Remove empty strings so backend doesn't reject nullable fields
    Object.keys(p).forEach(k => { if (p[k] === '') delete p[k]; });
    return p;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      let result;
      if (editingJob) {
        result = await updateJobPosting(editingJob.id, buildPayload());
      } else {
        result = await createJobPosting(buildPayload());
      }
      const saved = result.data?.data ?? result.data;
      onSave(saved);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data?.errors || {});
      } else {
        setErrors({ _global: err.response?.data?.message || 'Failed to save job posting.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!editingJob) return;
    setIsSubmitting(true);
    try {
      const res = await publishJobPosting(editingJob.id);
      setActionMsg('Job published successfully!');
      onSave(res.data?.data ?? res.data);
    } catch {
      setErrors({ _global: 'Failed to publish job.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!editingJob) return;
    setIsSubmitting(true);
    try {
      const res = await closeJobPosting(editingJob.id);
      setActionMsg('Job closed.');
      onSave(res.data?.data ?? res.data);
    } catch {
      setErrors({ _global: 'Failed to close job.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadge = editingJob?.status ? (
    <span className={`job-status-badge status-${editingJob.status}`}>
      {editingJob.status}
    </span>
  ) : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-container--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2>{editingJob ? t('Modal.Edit-Title') : t('Modal.Create-Title')}</h2>
            {statusBadge}
          </div>
          <button className="close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {actionMsg && (
          <div className="modal-action-msg">
            <span className="material-symbols-outlined">check_circle</span>
            {actionMsg}
          </div>
        )}
        {errors._global && (
          <div className="modal-error-msg">
            <span className="material-symbols-outlined">error</span>
            {errors._global}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* Title */}
            <div className="form-group">
              <label>{t('Modal.Job-Title')} <span className="req">*</span></label>
              <input
                type="text" name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('Modal.Placeholder-Title')}
                required
              />
              {errors.title && <span className="field-error">{errors.title[0]}</span>}
            </div>

            {/* Department + Position */}
            <div className="form-row">
              <div className="form-group">
                <label>{t('Modal.Department')}</label>
                <select name="department_id" value={formData.department_id} onChange={handleChange}>
                  <option value="">{t('Modal.Select-Department')}</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Position <span className="req">*</span></label>
                <select name="position_id" value={formData.position_id} onChange={handleChange} required>
                  <option value="">Select position…</option>
                  {positions
                    .filter(p => !formData.department_id || String(p.department?.id || p.department_id) === String(formData.department_id))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
                {errors.position_id && <span className="field-error">{errors.position_id[0]}</span>}
              </div>
            </div>

            {/* Salary */}
            <div className="form-row">
              <div className="form-group">
                <label>Min Salary</label>
                <input type="number" name="salary_min" value={formData.salary_min}
                  onChange={handleChange} placeholder="e.g. 60000" min="0" />
              </div>
              <div className="form-group">
                <label>Max Salary</label>
                <input type="number" name="salary_max" value={formData.salary_max}
                  onChange={handleChange} placeholder="e.g. 100000" min="0" />
              </div>
              <div className="form-group form-group--sm">
                <label>Currency</label>
                <select name="salary_currency" value={formData.salary_currency} onChange={handleChange}>
                  {['USD','EUR','GBP','SAR','AED','JOD'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Employment Type + Experience Level */}
            <div className="form-row">
              <div className="form-group">
                <label>Employment Type</label>
                <select name="employment_type" value={formData.employment_type} onChange={handleChange}>
                  <option value="">Select type…</option>
                  {['full-time','part-time','contract','temporary','internship'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Experience Level</label>
                <select name="experience_level" value={formData.experience_level} onChange={handleChange}>
                  <option value="">Select level…</option>
                  {['entry-level','associate','mid-senior','director','executive'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location + Deadline */}
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location}
                  onChange={handleChange} placeholder="e.g. Amman, Jordan / Remote" />
              </div>
              <div className="form-group">
                <label>Application Deadline</label>
                <input type="date" name="application_deadline"
                  value={formData.application_deadline} onChange={handleChange} />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>{t('Modal.Job-Description')} <span className="req">*</span> <span className="field-hint">(min 150 chars for AI accuracy)</span></label>
              <div className="editor-container">
                <div className="editor-toolbar">
                  <button type="button" className="editor-btn"><span className="material-symbols-outlined">format_bold</span></button>
                  <button type="button" className="editor-btn"><span className="material-symbols-outlined">format_italic</span></button>
                  <button type="button" className="editor-btn"><span className="material-symbols-outlined">format_list_bulleted</span></button>
                  <button type="button" className="editor-btn"><span className="material-symbols-outlined">format_list_numbered</span></button>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('Modal.Placeholder-Description')}
                  required
                  rows={6}
                />
                <div className="char-count" style={{ color: formData.description.length < 150 ? '#f87171' : '#34d399' }}>
                  {formData.description.length} / 150 min
                </div>
              </div>
              {errors.description && <span className="field-error">{errors.description[0]}</span>}
            </div>
          </div>

          <div className="modal-footer">
            {/* Publish / Close actions (only when editing) */}
            {editingJob && editingJob.status === 'draft' && (
              <button type="button" className="btn-publish" onClick={handlePublish} disabled={isSubmitting}>
                <span className="material-symbols-outlined">publish</span> Publish
              </button>
            )}
            {editingJob && editingJob.status === 'open' && (
              <button type="button" className="btn-close-job" onClick={handleClose} disabled={isSubmitting}>
                <span className="material-symbols-outlined">lock</span> Close Job
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              {t('Modal.Cancel')}
            </button>
            <button type="submit" className="btn-post" disabled={isSubmitting}>
              {isSubmitting ? <span className="modal-spinner" /> : null}
              {editingJob ? t('Modal.Update') : t('Modal.Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
