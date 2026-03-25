import React from 'react';
import './Salaries.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import FilterDropdown from '../../Recrutment/FilterDropdown/FilterDropdown';
const Salaries = () => {
    const {t}=useTranslation('Dashboard/SalariesCompensation')
     const [deptFilter, setDeptFilter] = useState('');
     const [statFilter, setStatFilter] = useState('');
     const [payroll, setRayrollFilter] = useState('');
       const departmentOptions = [
        { value: '', label: t('filters.department') },
        { value: 'Engineering', label: t('Engineering') },
        { value: 'Design', label: t('Design') },
        { value: 'Product', label: t('Product Management') },
        { value: 'Marketing', label: t('Marketing') },
    ];
        const statusOptions = [
        { value: '', label: t('filters.Status') },
        { value: 'Paid', label:t("filters.Paid") },
        { value: 'Ready', label: t("filters.Ready")},
        { value: 'Pending', label:t("filters.Pending")},
    ]
      const payrollperiodOptions = [
        { value: '', label: t('filters.payrollperiod') },
        { value: '1', label:"1"},
        { value: '2', label: "2"},
        { value: '3', label:"3"},
    ];
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1 className='er-title'>{t("SalariesCompensation")}</h1>
                <ThemeToggle />
            </header>
            <div className="salaries-page">
               <div className="salaries">
                    <div className="salaries-inf">
                        <h3 className="">{t("TotalMonthlyCost")}</h3>
                        <p className="">$125,430</p>
                    </div>
                    <div className="salaries-inf">
                        <h3 className="">{t("TotalDeductions")}</h3>
                        <p className="">$12,870</p>
                    </div>
                    <div className="salaries-inf">
                        <h3 className="">{t("TotalOvertimeCost")}</h3>
                        <p className="">$5,600</p>
                    </div>
                    <div className="salaries-inf">
                        <h3 className="">{t("NextPayrollDate")}</h3>
                        <p className="">Oct 31, 2023</p>
                    </div>
                </div>
            </div>
              <div className='filter-salary-co'>

                <div><input className='er-search-input' type='search' placeholder={t('search')}/></div>
                <div className='filter-salary'>
                    <div className='filters-salary'>
                        <FilterDropdown     
                         value={deptFilter}
                            onChange={setDeptFilter}
                            options={departmentOptions}
                            placeholder={t('filters.department')}/>
                             <FilterDropdown     
                         value={statFilter}
                            onChange={setStatFilter}
                            options={statusOptions}
                            placeholder={t('filters.department')}/>
                                 <FilterDropdown     
                         value={payroll}
                            onChange={setRayrollFilter}
                            options={payrollperiodOptions}
                            placeholder={t('filters.department')}/>
                    </div>
                    <div className='export'><button  className='btn-primary'><i className="bi bi-download"></i>  {t("ExportPayrollReport")}</button></div>
                </div>
              </div>
            
                <div className="Payroll-Summary-table er-table-card">
                    <div className="">
                        <h2 className="er-table-title">{t("PayrollSummaryTable")}</h2>
                    </div>
                    <div className="">
                        <table className="er-table ">
                            <thead className="">
                                <tr>
                                    <th className="">{t("EmployeeName")}</th>
                                    <th className="">{t("JobTitle")}</th>
                                    <th className="">{t("BasicSalary")}</th>
                                    <th className="">{t("TotalAdditions")}</th>
                                    <th className="">{t("TotalDeductions")}</th>
                                    <th className="">{t("NetSalary")}</th>
                                    <th className="">{t("Status")}</th>
                                  
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: "Olivia Rhye",title:"product design",Additions:"250$",Deductions:"330$", basic: "$5,500", net: "$5,600", status: "Paid", color: "green", img: 'https://i.pravatar.cc/150?u=olivia'},
                                    { name: "Phoenix Baker", title:"product design",Additions:"250$",Deductions:"330$",basic: "$6,200", net: "$6,380", status: "Ready", color: "blue",img: 'https://i.pravatar.cc/150?u=olivia' },
                                    { name: "Lana Steiner",title:"product design",Additions:"250$",Deductions:"330$", basic: "$7,000", net: "$6,550", status: "Paid", color: "green",img: 'https://i.pravatar.cc/150?u=olivia' },
                                    { name: "Candice Wu",title:"product design",Additions:"250$",Deductions:"330$", basic: "$6,800", net: "$7,190", status: "Pending", color: "orange",img: 'https://i.pravatar.cc/150?u=olivia' }
                                ].map((row, i) => (
                                    <tr key={i} className="">
                                        <td className="name-emp-salary"> <img src={row.img} alt={row.name} className="er-avatar" />  {row.name}</td>
                                        <td className="">{row.title}</td>
                                        <td className="">{row.basic}</td>
                                        <td className="">{row.Additions}</td>
                                        <td className="">{row.Deductions}</td>
                                        <td className="">{row.net}</td>
                                        <td className=""><span className={`bg-${row.color}`}>{row.status}</span></td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="salaries-page SalaryReports">
            
                      <div className="">
                        <h2 className="er-table-title">{t("SalaryReports")}</h2>
                    </div>
                        <div className='salaries SalaryReportsflex'>
                    <div className='view-salary-report'>
                        <h6>{t("GeneralSalaryReports")}</h6>
                        <p>{t("GeneralSalaryReportsdetials")}</p>
                        <Link>{t("ViewReport")}</Link>
                    </div>
                       <div className='view-salary-report'>
                        <h6>{t("OvertimeReport")}</h6>
                        <p>{t("OvertimeReportdetials")}</p>
                        <Link>{t("ViewReport")}</Link>
                    </div>
                       <div className='view-salary-report'>
                        <h6>{t("BonusesReport")}</h6>
                        <p>{t("BonusesReportdetials")}</p>
                        <Link>{t("ViewReport")}</Link>
                    </div>
                       <div className='view-salary-report'>
                        <h6>{t("EmployeeCostReport")}</h6>
                        <p>{t("EmployeeCostReportdetials")}</p>
                        <Link>{t("ViewReport")}</Link>
                    </div>
                </div>
                </div>
        </div>
    );
};

export default Salaries;
