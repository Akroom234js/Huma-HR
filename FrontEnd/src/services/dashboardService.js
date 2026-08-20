import apiClient from '../apiConfig';

// ══════════════════════════════════════════════════════════════════
// 📊 HumaHR Dashboard Services
// ══════════════════════════════════════════════════════════════════

/**
 * 1. General Dashboard Overview
 * GET /api/dashboard/general
 */
export const getGeneralDashboard = () => 
  apiClient.get('/dashboard/general');

/**
 * 2. Admin Attendance Dashboard & Records
 * GET /api/dashboard/attendance
 * @param {Object} params - { date, department_id, status, search }
 */
export const getAdminAttendance = (params = {}) => 
  apiClient.get('/dashboard/attendance', { params });

/**
 * 3. Employee Reports Dashboard
 * GET /api/dashboard/employee-reports
 * @param {Object} params - { search, department, status, join_date }
 */
export const getEmployeeReports = (params = {}) => 
  apiClient.get('/dashboard/employee-reports', { params });

/**
 * 4. Improvement Statistics & Department Benchmarks
 * GET /api/dashboard/improvement-stats
 */
export const getImprovementStats = () => 
  apiClient.get('/dashboard/improvement-stats');

/**
 * 5. Leaves Dashboard Analytics
 * GET /api/leaves/dashboard-analytics
 */
export const getLeavesDashboardAnalytics = () => 
  apiClient.get('/leaves/dashboard-analytics');

/**
 * 6. Salaries & Payroll Summary
 * GET /api/payroll
 * @param {Object} params - { department_id, status, month }
 */
export const getSalariesDashboard = (params = {}) => 
  apiClient.get('/payroll', { params });

/**
 * 7. Overall Performance Stats
 * GET /api/performance/stats
 */
export const getOverallPerformanceStats = () => 
  apiClient.get('/performance/stats');
