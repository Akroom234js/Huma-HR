import React, { useState, useEffect } from "react";
import "./DeductionsPenalties.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import apiClient from "../../../../apiConfig";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../Notification/NotificationContext";
import DashboardLoader from "../../../Shared/DashboardLoader/DashboardLoader";

const DeductionsPenalties = () => {
  const { t } = useTranslation('SalaryManagement/DeductionsPenalties');
  const { showSuccess, showError, showWarning } = useNotification();
  const [employees, setEmployees] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    category: "deduction", // "addition" or "deduction"
    deduction_type: "penalty",
    amount: "",
    absence_days: "0",
    reason: "",
    month: ""
  });

  // Generate months list
  const monthsList = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthsList.push(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  }

  useEffect(() => {
    fetchEmployees();
    fetchDeductions();
    if (!formData.month) setFormData(prev => ({ ...prev, month: monthsList[0] }));
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/employees');
      setEmployees(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  const fetchDeductions = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/deductions');
      setDeductions(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching deductions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.amount || !formData.month) {
      showWarning(t('FillRequired', "Please fill in all required fields."));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        is_addition: formData.category === "addition"
      };
      await apiClient.post('/deductions', payload);
      showSuccess(formData.category === "addition" ? t('BonusSuccess', "Addition recorded successfully!") : t('DeductionSuccess', "Deduction recorded successfully!"));
      setFormData({
        user_id: "",
        category: "deduction",
        deduction_type: "penalty",
        amount: "",
        absence_days: "0",
        reason: "",
        month: monthsList[0]
      });
      fetchDeductions();
    } catch (err) {
      console.error("Error submitting deduction", err);
      showError(err, t('RecordError', "Failed to record deduction."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sm-page dp-page">
      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      
      <header className="sm-header">
        <h1 className="sm-title">{t('Title', 'Financial Adjustments')}</h1>
        <p className="sm-subtitle">{t('Subtitle', 'Manage employee bonuses, rewards, and deductions.')}</p>
      </header>

      <div className="dp-content-container">
        {/* Form Section */}
        <div className="dp-form-card">
          <div className="adjustment-category-toggle">
            <button 
              type="button"
              className={formData.category === 'addition' ? 'active addition' : ''} 
              onClick={() => setFormData({...formData, category: 'addition', deduction_type: 'bonus'})}
            >
              <span className="material-symbols-outlined">add_circle</span>
              {t('Addition', 'Additions (Bonuses)')}
            </button>
            <button 
              type="button"
              className={formData.category === 'deduction' ? 'active deduction' : ''} 
              onClick={() => setFormData({...formData, category: 'deduction', deduction_type: 'penalty'})}
            >
              <span className="material-symbols-outlined">remove_circle</span>
              {t('Deduction', 'Deductions (Penalties)')}
            </button>
          </div>
          <h3 className="card-title">{formData.category === 'addition' ? t('AddBonus', 'Record New Bonus') : t('AddDeduction', 'Record New Deduction')}</h3>
          <form onSubmit={handleSubmit} className="dp-form">
            <div className="form-group">
              <label>{t('Employee', 'Employee')}</label>
              <select 
                value={formData.user_id} 
                onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                required
              >
                <option value="">{t('SelectEmployee', 'Select Employee')}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.user_id}>{emp.full_name} ({emp.employee_id})</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('Type', 'Adjustment Type')}</label>
                <select 
                  value={formData.deduction_type} 
                  onChange={(e) => setFormData({...formData, deduction_type: e.target.value})}
                >
                  {formData.category === 'addition' ? (
                    <>
                      <option value="bonus">{t('Bonus', 'Bonus')}</option>
                      <option value="reward">{t('Reward', 'Reward')}</option>
                      <option value="other">{t('Other', 'Other')}</option>
                    </>
                  ) : (
                    <>
                      <option value="absence">{t('Absence', 'Absence')}</option>
                      <option value="lateness">{t('Lateness', 'Lateness')}</option>
                      <option value="penalty">{t('Penalty', 'Penalty')}</option>
                      <option value="tax">{t('Tax', 'Tax')}</option>
                      <option value="insurance">{t('Insurance', 'Insurance')}</option>
                      <option value="other">{t('Other', 'Other')}</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>{t('Month', 'Target Month')}</label>
                <select 
                  value={formData.month} 
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                >
                  {monthsList.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('Amount', 'Amount ($)')}</label>
                <input 
                  type="number" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              {formData.deduction_type === 'absence' && (
                <div className="form-group">
                  <label>{t('Days', 'Absence Days')}</label>
                  <input 
                    type="number" 
                    value={formData.absence_days} 
                    onChange={(e) => setFormData({...formData, absence_days: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>{t('Reason', 'Reason / Notes')}</label>
              <textarea 
                value={formData.reason} 
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder={t('ReasonPlaceholder', 'Enter reason for deduction...')}
              />
            </div>

            <button type="submit" className={`dp-submit-btn ${formData.category}`} disabled={isSubmitting}>
              {isSubmitting ? t('Processing', 'Processing...') : (formData.category === 'addition' ? t('SubmitBonus', 'Record Bonus') : t('SubmitDeduction', 'Record Deduction'))}
            </button>
          </form>
        </div>

        {/* Table Section */}
        <div className="dp-table-card">
          <h3 className="card-title">{t('RecentAdjustments', 'Recent Financial Adjustments')}</h3>
          <div className="dp-table-wrapper">
            <table className="dp-table">
              <thead>
                <tr>
                  <th>{t('Date', 'DATE')}</th>
                  <th>{t('Employee', 'EMPLOYEE')}</th>
                  <th>{t('Type', 'TYPE')}</th>
                  <th>{t('Amount', 'AMOUNT')}</th>
                  <th>{t('Reason', 'REASON')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                      <DashboardLoader text={t('Loading', 'Loading adjustments...')} size="md" />
                    </td>
                  </tr>
                ) : deductions.length > 0 ? deductions.map(d => (
                  <tr key={d.id}>
                    <td>{new Date(d.applied_date).toLocaleDateString()}</td>
                    <td>
                      <div className="emp-info">
                        <span className="emp-name">{d.payroll_record?.user?.employee_profile?.full_name}</span>
                        <span className="emp-month">{d.payroll_record?.payroll_month}/{d.payroll_record?.payroll_year}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge tag-${d.deduction_type} ${d.is_addition ? 'addition' : ''}`}>
                        {d.deduction_type}
                      </span>
                    </td>
                    <td className={d.is_addition ? 'text-success' : 'text-danger'}>
                      {d.is_addition ? '+' : '-'}${Number(d.amount).toLocaleString()}
                    </td>
                    <td className="text-muted">{d.reason || '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center">{t('NoData', 'No recent deductions found.')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeductionsPenalties;
