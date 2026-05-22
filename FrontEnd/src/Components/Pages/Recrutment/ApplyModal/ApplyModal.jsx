import { useState, useRef } from 'react';
import { applyForJob } from '../../../../services/atsService';
import './ApplyModal.css';

/**
 * ApplyModal — Public application form
 * Submits to POST /api/job-postings/{id}/apply (multipart/form-data)
 */
export default function ApplyModal({ isOpen, onClose, job }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    emergency_contacts: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');
  const resumeInputRef = useRef(null);
  const coverInputRef = useRef(null);

  if (!isOpen || !job) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setErrorMsg('Resume must be under 5 MB.');
      return;
    }
    setErrorMsg('');
    setResumeFile(file || null);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setCoverFile(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setErrorMsg('Please attach your resume (PDF).');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setErrorMsg('');

    const data = new FormData();
    data.append('full_name', formData.full_name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('date_of_birth', formData.date_of_birth || '');
    data.append('address', formData.address || '');
    data.append('emergency_contacts', formData.emergency_contacts || '');
    data.append('resume', resumeFile);
    if (coverFile) data.append('cover_letter', coverFile);

    try {
      await applyForJob(job.id, data, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(pct);
      });
      setSubmitStatus('success');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        'Failed to submit. Please try again.';
      setErrorMsg(msg);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      address: '',
      emergency_contacts: '',
    });
    setResumeFile(null);
    setCoverFile(null);
    setUploadProgress(0);
    setSubmitStatus(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="apply-backdrop" onClick={handleClose}>
      <div className="apply-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="apply-header">
          <div className="apply-header-left">
            <div className="apply-icon">
              <span className="material-symbols-outlined">work</span>
            </div>
            <div>
              <h2>Apply for Position</h2>
              <p className="apply-job-title">{job.title}</p>
            </div>
          </div>
          <button className="apply-close-btn" onClick={handleClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ── Job Info Strip ── */}
        <div className="apply-job-strip">
          {job.department?.name && (
            <span className="apply-chip">
              <span className="material-symbols-outlined">apartment</span>
              {job.department.name}
            </span>
          )}
          {job.employment_type && (
            <span className="apply-chip">
              <span className="material-symbols-outlined">schedule</span>
              {job.employment_type}
            </span>
          )}
          {job.location && (
            <span className="apply-chip">
              <span className="material-symbols-outlined">location_on</span>
              {job.location}
            </span>
          )}
          {(job.salary_min || job.salary_max) && (
            <span className="apply-chip apply-chip-green">
              <span className="material-symbols-outlined">payments</span>
              {job.salary_min && job.salary_max
                ? `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency || 'USD'}`
                : `${(job.salary_min || job.salary_max).toLocaleString()} ${job.salary_currency || 'USD'}`}
            </span>
          )}
        </div>

        {/* ── Success State ── */}
        {submitStatus === 'success' ? (
          <div className="apply-success">
            <div className="apply-success-icon">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <h3>Application Submitted!</h3>
            <p>
              Thank you, <strong>{formData.full_name}</strong>! Your application has been received.
              Our HR team will review it and get back to you at <strong>{formData.email}</strong>.
            </p>
            <div className="apply-success-note">
              <span className="material-symbols-outlined">smart_toy</span>
              Your CV is being analyzed by our AI screening system.
            </div>
            <button className="apply-submit-btn" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form className="apply-form" onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div className="apply-section-label">Personal Information</div>
            <div className="apply-form-row">
              <div className="apply-form-group">
                <label htmlFor="apply-name">Full Name <span className="required">*</span></label>
                <input
                  id="apply-name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-group">
                <label htmlFor="apply-email">Email Address <span className="required">*</span></label>
                <input
                  id="apply-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="apply-form-group">
                <label htmlFor="apply-phone">Phone Number</label>
                <input
                  id="apply-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="apply-form-group">
                <label htmlFor="apply-dob">Date of Birth</label>
                <input
                  id="apply-dob"
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="apply-form-row" style={{ gridTemplateColumns: '1fr' }}>
              <div className="apply-form-group">
                <label htmlFor="apply-address">Address</label>
                <input
                  id="apply-address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, City, State, Zip"
                />
              </div>
            </div>

            <div className="apply-form-row" style={{ gridTemplateColumns: '1fr' }}>
              <div className="apply-form-group">
                <label htmlFor="apply-emergency">Emergency Contact</label>
                <input
                  id="apply-emergency"
                  type="text"
                  name="emergency_contacts"
                  value={formData.emergency_contacts}
                  onChange={handleChange}
                  placeholder="Name - Phone Number"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="apply-section-label">Documents</div>

            <div className="apply-form-group">
              <label>Resume / CV <span className="required">*</span></label>
              <div
                className={`apply-drop-zone ${resumeFile ? 'apply-drop-zone--filled' : ''}`}
                onClick={() => resumeInputRef.current?.click()}
              >
                {resumeFile ? (
                  <>
                    <span className="material-symbols-outlined apply-file-icon">description</span>
                    <span className="apply-file-name">{resumeFile.name}</span>
                    <span className="apply-file-size">({(resumeFile.size / 1024).toFixed(0)} KB)</span>
                    <button
                      type="button"
                      className="apply-remove-file"
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null); resumeInputRef.current.value = ''; }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined apply-upload-icon">upload_file</span>
                    <span className="apply-drop-text">Click to upload or drag & drop</span>
                    <span className="apply-drop-hint">PDF, DOC, DOCX — max 5 MB</span>
                  </>
                )}
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  hidden
                />
              </div>
            </div>

            <div className="apply-form-group">
              <label>Cover Letter <span className="optional">(optional)</span></label>
              <div
                className={`apply-drop-zone apply-drop-zone--sm ${coverFile ? 'apply-drop-zone--filled' : ''}`}
                onClick={() => coverInputRef.current?.click()}
              >
                {coverFile ? (
                  <>
                    <span className="material-symbols-outlined apply-file-icon">article</span>
                    <span className="apply-file-name">{coverFile.name}</span>
                    <button
                      type="button"
                      className="apply-remove-file"
                      onClick={(e) => { e.stopPropagation(); setCoverFile(null); coverInputRef.current.value = ''; }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined apply-upload-icon">post_add</span>
                    <span className="apply-drop-text">Attach cover letter</span>
                  </>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCoverChange}
                  hidden
                />
              </div>
            </div>

            {/* Upload progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="apply-progress-wrap">
                <div className="apply-progress-label">
                  <span>Uploading…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="apply-progress-bar">
                  <div className="apply-progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="apply-error">
                <span className="material-symbols-outlined">error</span>
                {errorMsg}
              </div>
            )}

            {/* Footer */}
            <div className="apply-footer">
              <button type="button" className="apply-cancel-btn" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="apply-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><span className="apply-spinner" /> Submitting…</>
                ) : (
                  <><span className="material-symbols-outlined">send</span> Submit Application</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
