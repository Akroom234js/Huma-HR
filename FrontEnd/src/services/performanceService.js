import apiClient from "../apiConfig";

// ══════════════════════════════════════════════════════════════════
// 📋 1. Tasks Management (Manager & Employee)
// ══════════════════════════════════════════════════════════════════

// GET /api/tasks (عرض مهام القسم للمدير)
export const getDepartmentTasks = () => 
  apiClient.get("/tasks");

// GET /api/my-department/employees (جلب موظفي القسم للمدير وزملاء القسم للأقران)
export const getDepartmentEmployees = () =>
  apiClient.get("/my-department/employees");

// POST /api/tasks (إنشاء مهمة - مدير)
export const createTask = (data) =>
  apiClient.post("/tasks", {
    employee_profile_id: data.employee_profile_id,
    title: data.title,
    description: data.description,
    due_date: data.due_date,
    difficulty: data.difficulty,
    priority: data.priority,
    late_penalty_per_day: data.late_penalty_per_day,
  });

// PUT /api/tasks/{task} (تعديل مهمة - مدير)
export const updateTask = (taskId, data) =>
  apiClient.put(`/tasks/${taskId}`, {
    title: data.title,
    description: data.description,
    due_date: data.due_date,
    difficulty: data.difficulty,
    priority: data.priority,
    late_penalty_per_day: data.late_penalty_per_day,
  });

// DELETE /api/tasks/{task} (حذف مهمة - مدير)
export const deleteTask = (taskId) =>
  apiClient.delete(`/tasks/${taskId}`);

// GET /api/tasks/{task} (تفاصيل مهمة - مدير وموظف)
export const getTaskDetails = (taskId) =>
  apiClient.get(`/tasks/${taskId}`);

// PUT /api/tasks/{task}/score (تقييم المهمة ورصد الدرجة - مدير)
export const scoreTask = (taskId, data) =>
  apiClient.put(`/tasks/${taskId}/score`, {
    completion_score: data.completion_score,
    quality_score: data.quality_score,
    manager_note: data.manager_note,
  });

// PUT /api/tasks/{task}/revision (إرجاع للمراجعة - مدير)
export const requestRevision = (taskId, data) =>
  apiClient.put(`/tasks/${taskId}/revision`, {
    manager_note: data.manager_note,
  });

// PUT /api/tasks/{task}/start (بدء المهمة - موظف)
export const startTask = (taskId) =>
  apiClient.put(`/tasks/${taskId}/start`);

// POST/PUT /api/tasks/{task}/complete (إنجاز المهمة / إعادة إنجاز بعد المراجعة - موظف)
export const completeTask = (taskId, data = {}) => {
  if (data instanceof FormData) {
    return apiClient.post(`/tasks/${taskId}/complete`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  return apiClient.post(`/tasks/${taskId}/complete`, data);
};

// GET /api/tasks/my-tasks (عرض مهامي - موظف)
export const getMyTasks = () =>
  apiClient.get("/tasks/my-tasks");


// ══════════════════════════════════════════════════════════════════
// 🌟 2. Performance Cycles & Evaluations (Employee & Manager)
// ══════════════════════════════════════════════════════════════════

// GET /api/performance/cycles (عرض الدورات - متاح للجميع/المدير/HR)
export const getPerformanceCycles = () =>
  apiClient.get("/performance/cycles");

// GET /api/performance/cycles/{cycle} (تفاصيل دورة معينة)
export const getPerformanceCycleDetails = (cycleId) =>
  apiClient.get(`/performance/cycles/${cycleId}`);

// GET /api/performance/my-evaluation (جلب تقييم الموظف الحالي في الدورة النشطة)
export const getMyEvaluation = () =>
  apiClient.get("/performance/my-evaluation");

// POST /api/performance/peer-evaluations (تقييم زميل)
export const submitPeerEvaluation = (data) =>
  apiClient.post("/performance/peer-evaluations", {
    performance_cycle_id: data.performance_cycle_id ?? data.cycle_id,
    employee_profile_id: data.employee_profile_id ?? data.evaluatee_id,
    collaboration_score: data.collaboration_score ?? data.comm_score ?? 8,
    teamwork_score: data.teamwork_score ?? 8,
    comment: data.comment || data.feedback || 'Good collaboration',
  });

// GET /api/performance/manager-evaluations/my-team/{cycleId} (جلب أعضاء الفريق للتقييم في دورة)
export const getMyTeamEvaluations = (cycleId) =>
  apiClient.get(`/performance/manager-evaluations/my-team/${cycleId}`);

// POST /api/performance/manager-evaluations (إرسال تقييم مدير لموظف)
export const submitManagerEvaluation = (data) =>
  apiClient.post("/performance/manager-evaluations", {
    performance_cycle_id: data.performance_cycle_id,
    employee_profile_id: data.employee_profile_id,
    professionalism: data.professionalism,
    responsibility: data.responsibility,
    problem_solving: data.problem_solving,
    notes: data.notes,
  });

// PUT /api/performance/manager-evaluations/{id} (تعديل تقييم مدير)
export const updateManagerEvaluation = (evalId, data) =>
  apiClient.put(`/performance/manager-evaluations/${evalId}`, {
    professionalism: data.professionalism,
    responsibility: data.responsibility,
    problem_solving: data.problem_solving,
    notes: data.notes,
  });
