import React from 'react';
import { useTranslation } from 'react-i18next';
import './MonthlyPayroll.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const MonthlyPayroll = () => {
    const {t}=useTranslation('SalaryManagement/MonthlyPayroll')
    return (
        <div className="sm-page">
           
            <header className="sm-header monthly">
                <h1 className="sm-title">{t('MonthlyPayroll')}</h1>
                 <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            </header>
              <div className="searchFilterco">
                                        <div className="searchFilter">
                                          
                                            <input className="Searchemployee" placeholder={t("Searchemployee")} type="text"/>
                                        </div>
                                        <select className="AllDepartments">
                                            <option>All Departments</option>
                                            <option>Engineering</option>
                                            <option>Product</option>
                                            <option>Design</option>
                                        </select>
                                        <select className="dateselect">
                                            <option>April 2024</option>
                                            <option>March 2024</option>
                                            <option>February 2024</option>
                                        </select>
                                    </div>
                                      <div className="tablesalary">
                                    <table className="">
                                        <thead className="">
                                            <tr>
                                                <th className="" >{t('name')}</th>
                                                <th className="" >{t('BasicSalary')}</th>
                                                <th className="" >{t('AbsenceDeducted')}</th>
                                                <th className="" >{t('Overtime')}</th>
                                                <th className="" >{t('Incentives')}</th>
                                                <th className="" >{t('Deductions')}</th>
                                                <th className="" >{t('FinalNetSalary')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className='salaryinfo'>
                                            {[
                                                {name: "John Doe", basic: "$5,000.00", abs: "$0.00 (0 days)", ot: "5 hrs", inc: "$250.00", ded: ["Lateness: $0", "Tax: $850", "Security: $200"], final: "$4,500.00"},
                                                {name: "Jane Smith", basic: "$6,200.00", abs: "$400.00 (2 days)", ot: "0 hrs", inc: "$0.00", ded: ["Lateness: $50", "Tax: $1,100", "Security: $250"], final: "$4,760.00"},
                                                {name: "Peter Jones", basic: "$4,500.00", abs: "$0.00 (0 days)", ot: "10 hrs", inc: "$500.00", ded: ["Lateness: $0", "Tax: $750", "Security: $180"], final: "$4,370.00"},
                                                {name: "Mary Williams", basic: "$7,000.00", abs: "$0.00 (0 days)", ot: "2 hrs", inc: "$100.00", ded: ["Lateness: $0", "Tax: $1,300", "Security: $300"], final: "$5,925.00"},
                                                {name: "David Brown", basic: "$3,800.00", abs: "$126.67 (1 day)", ot: "0 hrs", inc: "$0.00", ded: ["Lateness: $25", "Tax: $550", "Security: $150"], final: "$3,188.33"},
                                            ].map((row, idx) => (
                                                <tr key={idx} className="">
                                                    <td className="" >{row.name}</td>
                                                    <td className="">{row.basic}</td>
                                                    <td className="">{row.abs}</td>
                                                    <td className="">{row.ot}</td>
                                                    <td className="">{row.inc}</td>
                                                    <td className="">
                                                        {row.ded.map((d, i) => <div key={i}>{d}</div>)}
                                                    </td>
                                                    <td className="">{row.final}</td>
                                                </tr>
                                            ))}
                                        </tbody>

                                       
                                    </table>
                                </div>
                                  <div className='salaryinfocard'>
                                            {[
                                                {name: "John Doe", basic: "$5,000.00", abs: "$0.00 (0 days)", ot: "5 hrs", inc: "$250.00", ded: ["Lateness: $0", "Tax: $850", "Security: $200"], final: "$4,500.00"},
                                                {name: "Jane Smith", basic: "$6,200.00", abs: "$400.00 (2 days)", ot: "0 hrs", inc: "$0.00", ded: ["Lateness: $50", "Tax: $1,100", "Security: $250"], final: "$4,760.00"},
                                                {name: "Peter Jones", basic: "$4,500.00", abs: "$0.00 (0 days)", ot: "10 hrs", inc: "$500.00", ded: ["Lateness: $0", "Tax: $750", "Security: $180"], final: "$4,370.00"},
                                                {name: "Mary Williams", basic: "$7,000.00", abs: "$0.00 (0 days)", ot: "2 hrs", inc: "$100.00", ded: ["Lateness: $0", "Tax: $1,300", "Security: $300"], final: "$5,925.00"},
                                                {name: "David Brown", basic: "$3,800.00", abs: "$126.67 (1 day)", ot: "0 hrs", inc: "$0.00", ded: ["Lateness: $25", "Tax: $550", "Security: $150"], final: "$3,188.33"},
                                            ].map((row, idx) => (
                                                <div key={idx} className="infocard">
                                                  <div className='infocardsalary'>
                                                    <p className="" >{t('name')}: </p>
                                                      <p className="" >{row.name}</p>
                                                    </div>
                                                    <div className='infocardsalary'>
                                                         <p className="" >{t('BasicSalary')}: </p>
                                                        <p className="">{row.basic}</p>
                                                    </div>
                                                 <div className='infocardsalary'>
                                                     <p className="" >{t('AbsenceDeducted')}: </p>
                                                       <p className="">{row.abs}</p>
                                                 </div>
                                                   <div className='infocardsalary'>
                                                    <p className="" >{t('Overtime')}: </p>
                                                     <p className="">{row.ot}</p>
                                                   </div>
                                                 <div className='infocardsalary'>
                                                        <p className="" >{t('Incentives')}: </p>
                                                       <p className="">{row.inc}</p>
                                                 </div>
                                                   <div className='infocardsalary'>
                                                         <p className="" >{t('Deductions')}: </p>
                                                     <p className="">
                                                        {row.ded.map((d, i) => <div key={i}>{d}</div>)}
                                                    </p>
                                                   </div>
                                                   <div className='infocardsalary'>
                                                          <p className="" >{t('FinalNetSalary')}: </p>
                                                     <p className="">{row.final}</p>
                                                   </div>
                                                </div>
                                            ))}
                                        </div>
        </div>
    );
};

export default MonthlyPayroll;
