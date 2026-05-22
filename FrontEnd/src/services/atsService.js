/**
 * atsService.js — ATS (Applicant Tracking System) API Service
 * ============================================================
 * Centralizes all API calls for job postings and applications.
 * Avoids scattering axios calls across every component.
 */

import apiClient from '../apiConfig';

// ─────────────────────────────────────────────────────────────
// JOB POSTINGS
// ─────────────────────────────────────────────────────────────

/** GET /api/job-postings — public, no auth needed */
export const getJobPostings = (filters = {}) => {
  const params = {};
  if (filters.status)           params.status = filters.status;
  if (filters.department_id)    params.department_id = filters.department_id;
  if (filters.experience_level) params.experience_level = filters.experience_level;
  if (filters.employment_type)  params.employment_type = filters.employment_type;
  if (filters.search)           params.search = filters.search;
  return apiClient.get('/job-postings', { params });
};

/** GET /api/job-postings/{id} — public, no auth needed */
export const getJobPosting = (id) =>
  apiClient.get(`/job-postings/${id}`);

/** POST /api/job-postings — HR only */
export const createJobPosting = (data) =>
  apiClient.post('/job-postings', data);

/** PUT /api/job-postings/{id} — HR only */
export const updateJobPosting = (id, data) =>
  apiClient.put(`/job-postings/${id}`, data);

/** PATCH /api/job-postings/{id}/publish — HR only */
export const publishJobPosting = (id) =>
  apiClient.patch(`/job-postings/${id}/publish`);

/** PATCH /api/job-postings/{id}/close — HR only */
export const closeJobPosting = (id) =>
  apiClient.patch(`/job-postings/${id}/close`);

/** DELETE /api/job-postings/{id} — HR only */
export const deleteJobPosting = (id) =>
  apiClient.delete(`/job-postings/${id}`);

/** GET /api/job-postings/{id}/stats — HR|Manager */
export const getJobStats = (id) =>
  apiClient.get(`/job-postings/${id}/stats`);

/** GET /api/applications/stats — HR|Manager, supports optional ?job_posting_id= */
export const getApplicationsPipelineStats = (jobPostingId = null) => {
  const params = {};
  if (jobPostingId) params.job_posting_id = jobPostingId;
  return apiClient.get('/applications/stats', { params });
};

// ─────────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/job-postings/{id}/apply — public
 * Requires multipart/form-data for file uploads.
 * @param {number} jobPostingId
 * @param {FormData} formData — must contain: full_name, email, phone, resume
 * @param {function} onUploadProgress — optional progress callback
 */
export const applyForJob = (jobPostingId, formData, onUploadProgress) =>
  apiClient.post(`/job-postings/${jobPostingId}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

/** GET /api/applications — HR|Manager, supports ?status=&job_posting_id=&search= */
export const getApplications = (filters = {}) => {
  const params = {};
  if (filters.status)          params.status = filters.status;
  if (filters.job_posting_id)  params.job_posting_id = filters.job_posting_id;
  if (filters.search)          params.search = filters.search;
  if (filters.per_page)        params.per_page = filters.per_page;
  return apiClient.get('/applications', { params });
};

/** GET /api/applications/{id} — HR|Manager */
export const getApplication = (id) =>
  apiClient.get(`/applications/${id}`);

/** GET /api/applications/{id}/allowed-transitions — HR|Manager */
export const getAllowedTransitions = (id) =>
  apiClient.get(`/applications/${id}/allowed-transitions`);

/**
 * GET /api/applications/{id}/resume — HR only
 * Returns binary blob for download.
 */
export const downloadResume = (id) =>
  apiClient.get(`/applications/${id}/resume`, { responseType: 'blob' });

// ─────────────────────────────────────────────────────────────
// PIPELINE ACTIONS — HR only
// ─────────────────────────────────────────────────────────────

/** PATCH /api/applications/{id}/review */
export const reviewApplication = (id) =>
  apiClient.patch(`/applications/${id}/review`);

/** PATCH /api/applications/{id}/shortlist */
export const shortlistApplication = (id, feedback = '') =>
  apiClient.patch(`/applications/${id}/shortlist`, { feedback });

/** PATCH /api/applications/{id}/interview */
export const interviewApplication = (id) =>
  apiClient.patch(`/applications/${id}/interview`);

/** PATCH /api/applications/{id}/offer */
export const offerApplication = (id) =>
  apiClient.patch(`/applications/${id}/offer`);

/** PATCH /api/applications/{id}/hire */
export const hireApplication = (id) =>
  apiClient.patch(`/applications/${id}/hire`);

/** PATCH /api/applications/{id}/reject */
export const rejectApplication = (id, feedback = '') =>
  apiClient.patch(`/applications/${id}/reject`, { feedback });

/** PATCH /api/applications/{id}/withdraw */
export const withdrawApplication = (id) =>
  apiClient.patch(`/applications/${id}/withdraw`);

/** PATCH /api/applications/{id}/status — generic status override */
export const updateApplicationStatus = (id, status, feedback = '', currentStage = '') =>
  apiClient.patch(`/applications/${id}/status`, { status, feedback, current_stage: currentStage });

/** DELETE /api/applications/{id} — HR only */
export const deleteApplication = (id) =>
  apiClient.delete(`/applications/${id}`);

// ─────────────────────────────────────────────────────────────
// INTERVIEWS
// ─────────────────────────────────────────────────────────────

/** POST /api/applications/{applicationId}/interviews — HR only */
export const scheduleInterview = (applicationId, data) =>
  apiClient.post(`/applications/${applicationId}/interviews`, data);

/** PATCH /api/interviews/{interviewId}/feedback — HR/Manager/Interviewer */
export const recordInterviewFeedback = (interviewId, data) =>
  apiClient.patch(`/interviews/${interviewId}/feedback`, data);

// ─────────────────────────────────────────────────────────────
// HELPER — Maps transition name to a service call
// ─────────────────────────────────────────────────────────────
export const executeTransition = (id, transition, feedback = '') => {
  switch (transition) {
    case 'reviewed':    return reviewApplication(id);
    case 'shortlisted': return shortlistApplication(id, feedback);
    case 'interviewing':return interviewApplication(id);
    case 'offered':     return offerApplication(id);
    case 'hired':       return hireApplication(id);
    case 'rejected':    return rejectApplication(id, feedback);
    case 'withdrawn':   return withdrawApplication(id);
    default:            return updateApplicationStatus(id, transition, feedback);
  }
};
