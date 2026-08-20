import apiClient from "../apiConfig";

// ══════════════════════════════════════════════════════════════════
// 📊 1. Performance Stats & Metrics (HR)
// ══════════════════════════════════════════════════════════════════

// GET /api/performance/stats
export const getPerformanceStats = (params = {}) =>
  apiClient.get("/performance/stats", { params });

// ══════════════════════════════════════════════════════════════════
// 📝 2. Evaluation Templates (HR)
// ══════════════════════════════════════════════════════════════════

// GET /api/performance/templates
export const getPerformanceTemplates = () =>
  apiClient.get("/performance/templates");

// POST /api/performance/templates
export const createPerformanceTemplate = (data) =>
  apiClient.post("/performance/templates", data);

// PUT /api/performance/templates/{template}
export const updatePerformanceTemplate = (templateId, data) =>
  apiClient.put(`/performance/templates/${templateId}`, data);

// DELETE /api/performance/templates/{template}
export const deletePerformanceTemplate = (templateId) =>
  apiClient.delete(`/performance/templates/${templateId}`);

// ══════════════════════════════════════════════════════════════════
// 🔄 3. Performance Cycles Management (HR)
// ══════════════════════════════════════════════════════════════════

// GET /api/performance/cycles
export const getListCycle = () =>
  apiClient.get("/performance/cycles");

export const getPerformanceCycles = () =>
  apiClient.get("/performance/cycles");

// GET /api/performance/cycles/{cycle}
export const getPerformanceCycleDetails = (cycleId) =>
  apiClient.get(`/performance/cycles/${cycleId}`);

// POST /api/performance/cycles
export const createPerformanceCycle = (data) =>
  apiClient.post("/performance/cycles", data);

// PUT /api/performance/cycles/{cycle}
export const updatePerformanceCycle = (cycleId, data) =>
  apiClient.put(`/performance/cycles/${cycleId}`, data);

// POST /api/performance/cycles/{cycle}/activate
export const activatePerformanceCycle = (cycleId) =>
  apiClient.post(`/performance/cycles/${cycleId}/activate`);

// POST /api/performance/cycles/{cycle}/close
export const closePerformanceCycle = (cycleId) =>
  apiClient.post(`/performance/cycles/${cycleId}/close`);

// POST /api/performance/cycles/process-expired
export const processExpiredCycles = () =>
  apiClient.post("/performance/cycles/process-expired");

// ══════════════════════════════════════════════════════════════════
// 📈 4. Evaluations Results & 360 Reports (HR)
// ══════════════════════════════════════════════════════════════════

// GET /api/performance/evaluations/{cycleId}
export const getEvaluationsByCycle = (cycleId, params = {}) =>
  apiClient.get(`/performance/evaluations/${cycleId}`, { params });

// GET /api/performance/evaluations/{cycleId}/{employeeId}
export const getEmployeeEvaluationDetails = (cycleId, employeeId) =>
  apiClient.get(`/performance/evaluations/${cycleId}/${employeeId}`);

// GET /api/performance/manager-evaluations/{cycleId}/{employeeId}
export const getManagerEvaluationForEmployee = (cycleId, employeeId) =>
  apiClient.get(`/performance/manager-evaluations/${cycleId}/${employeeId}`);

// GET /api/performance/peer-evaluations/{cycleId}/{employeeId}
export const getPeerEvaluationsForEmployee = (cycleId, employeeId) =>
  apiClient.get(`/performance/peer-evaluations/${cycleId}/${employeeId}`);

// ══════════════════════════════════════════════════════════════════
// ⚡ 5. Performance Actions & Auto-Decisions (HR)
// ══════════════════════════════════════════════════════════════════

// GET /api/performance/actions
export const getPerformanceActions = (params = {}) =>
  apiClient.get("/performance/actions", { params });

// PUT /api/performance/actions/{action}/approve
export const approvePerformanceAction = (actionId, note = "") =>
  apiClient.put(`/performance/actions/${actionId}/approve`, { note });

// PUT /api/performance/actions/{action}/reject
export const rejectPerformanceAction = (actionId, reason = "") =>
  apiClient.put(`/performance/actions/${actionId}/reject`, { reason });