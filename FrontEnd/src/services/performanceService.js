import apiClient from "../apiConfig";

// 1. GET /api/tasks (عرض مهام القسم للمدير)
export const getDepartmentTasks = () => 
  apiClient.get("/tasks");

// 2. GET /api/my-department/employees (جلب موظفي القسم للمدير)
export const getDepartmentEmployees = () =>
  apiClient.get("/my-department/employees");

// 3. POST /api/tasks (إنشاء مهمة - مدير)
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

// 4. PUT /api/tasks/{task} (تعديل مهمة - مدير)
export const updateTask = (taskId, data) =>
  apiClient.put(`/tasks/${taskId}`, {
    title: data.title,
    description: data.description,
    due_date: data.due_date,
    difficulty: data.difficulty,
    priority: data.priority,
    late_penalty_per_day: data.late_penalty_per_day,
  });

// 5. DELETE /api/tasks/{task} (حذف مهمة - مدير)
export const deleteTask = (taskId) =>
  apiClient.delete(`/tasks/${taskId}`);

// 6. GET /api/tasks/{task} (تفاصيل مهمة - مدير وموظف)
export const getTaskDetails = (taskId) =>
  apiClient.get(`/tasks/${taskId}`);

// 7. PUT /api/tasks/{task}/score (تقييم المهمة ورصد الدرجة - مدير)
export const scoreTask = (taskId, data) =>
  apiClient.put(`/tasks/${taskId}/score`, {
    completion_score: data.completion_score,
    quality_score: data.quality_score,
    manager_note: data.manager_note,
  });

// 8. PUT /api/tasks/{task}/revision (إرجاع للمراجعة - مدير)
export const requestRevision = (taskId, data) =>
  apiClient.put(`/tasks/${taskId}/revision`, {
    manager_note: data.manager_note,
  });

// 9. PUT /api/tasks/{task}/start (بدء المهمة - موظف)
export const startTask = (taskId) =>
  apiClient.put(`/tasks/${taskId}/start`);

// 10. PUT /api/tasks/{task}/complete (إنجاز المهمة / إعادة إنجاز بعد المراجعة - موظف)
export const completeTask = (taskId) =>
  apiClient.put(`/tasks/${taskId}/complete`);

// 11. GET /api/tasks/my-tasks (عرض مهامي - موظف)
export const getMyTasks = () =>
  apiClient.get("/tasks/my-tasks");
