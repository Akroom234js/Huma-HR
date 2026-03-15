import React from 'react';
import { useTranslation } from 'react-i18next';
import './MonthlyPayroll.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useState } from 'react';
const MonthlyPayroll = () => {
    const { t } = useTranslation('SalaryManagement/MonthlyPayroll')
    const [details, setDetails] = useState([]);
    const moredetails = (e, abs, ded, date, reason, by) => {
        const vis = document.querySelector(".details")
          const zind=document.querySelector(".mobile-toggle")
          zind.style.zIndex="-1"
        vis.style.display = "block"
        document.body.style.overflow = 'hidden'
        const newDetails = (
            <div >
                <div className='infocardsalary'>
                    <p>{t('AbsenceDeducted')}:</p>
                    <p>{abs}</p>
                </div>

                <div className='infocardsalary'>
                    <p>{t('Deductions')}:</p>
                    <div>{ded.map((d, i) => <div key={i}>{d}</div>)}</div>
                </div>

                <div className='infocardsalary'>
                    <p>{t('deductiondate')}:</p>
                    <p>{date}</p>
                </div>

                <div className='infocardsalary'>
                    <p>{t('reason')}:</p>
                    <p>{reason}</p>
                </div>

                <div className='infocardsalary'>
                    <p>{t('Applied')}:</p>
                    <p>{by}</p>
                </div>
            </div>
        );

        setDetails([newDetails]);
    };
    const hidden = (e) => {
        const hid = document.querySelector(".details")
        hid.style.display = "none"
        document.body.style.overflow='auto'
               const zind=document.querySelector(".mobile-toggle")
          zind.style.zIndex="10"
    }
    return (
        <div className="sm-page">

            <header className="sm-header monthly">
                <h1 className="sm-title">{t('MonthlyPayroll')}</h1>
                <div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>
            </header>
            <div className='details'><div className='newdetails'>
                {details}
                <button onClick={(e) => { hidden(e) }}><span className='bi bi-x'></span></button></div></div>
            <div className='monthlypayrollco'>

                <div className="searchFilterco">
                    <div className="searchFilter">

                        <input className="Searchemployee" placeholder={t("Searchemployee")} type="text" />
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
                    
                                <th className="" >{t('Overtime')}</th>
                                <th className="" >{t('Incentives')}</th>
                          
                                <th className="" >{t('DeductionAmount')}</th>
                                <th className="" >{t('FinalNetSalary')}</th>
                                <th className="" >{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className='salaryinfo'>
                            {[
                                { name: "John Doe", basic: "$5,000.00", date: "2024-04-25", abs: "$0.00 (0 days)", ot: "5 hrs", inc: "$250.00", ded: ["Lateness: $0", "Tax: $850", "Security: $200"], amount: "1.1$", final: "$4,500.00", reason: "2 days absence", by: "System" },
                                { name: "Jane Smith", basic: "$6,200.00", date: "2024-04-25", abs: "$400.00 (2 days)", ot: "0 hrs", inc: "$0.00", ded: ["Lateness: $50", "Tax: $1,100", "Security: $250"], amount: "1.1$", final: "$4,760.00", reason: "2 days absence", by: "System" },
                                { name: "Peter Jones", basic: "$4,500.00", date: "2024-04-25", abs: "$0.00 (0 days)", ot: "10 hrs", inc: "$500.00", ded: ["Lateness: $0", "Tax: $750", "Security: $180"], amount: "1.1$", final: "$4,370.00", reason: "2 days absence", by: "System" },
                                { name: "Mary Williams", basic: "$7,000.00", date: "2024-04-25", abs: "$0.00 (0 days)", ot: "2 hrs", inc: "$100.00", ded: ["Lateness: $0", "Tax: $1,300", "Security: $300"], amount: "1.1$", final: "$5,925.00", reason: "2 days absence", by: "System" },
                                { name: "David Brown", basic: "$3,800.00", date: "2024-04-25", abs: "$126.67 (1 day)", ot: "0 hrs", inc: "$0.00", ded: ["Lateness: $25", "Tax: $550", "Security: $150"], amount: "1.1$", final: "$3,188.33", reason: "2 days absence", by: "System" },
                            ].map((row, idx) => (
                                <tr key={idx} className="">
                                    <td className="" >{row.name}</td>
                                    <td className="">{row.basic}</td>
                                   
                                    <td className="">{row.ot}</td>
                                    <td className="">{row.inc}</td>
                            
                                    <td className="">{row.amount}</td>
                                    <td className="">{row.final}</td>
                                    <td ><button className="moredetails" onClick={(e) => { moredetails(e, row.abs, row.ded, row.date, row.reason, row.by) }}>{t('more')}</button></td>

                                </tr>
                            ))}
                        </tbody>


                    </table>

                </div>

                <div className='salaryinfocard'>
                    {[
                        { name: "John Doe", basic: "$5,000.00", date: "2024-04-25", abs: "$0.00 (0 days)", ot: "5 hrs", inc: "$250.00", ded: ["Lateness: $0", "Tax: $850", "Security: $200"], amount: "1.1$", final: "$4,500.00", reason: "2 days absence", by: "System" },
                        { name: "Jane Smith", basic: "$6,200.00", date: "2024-04-25", abs: "$400.00 (2 days)", ot: "0 hrs", inc: "$0.00", ded: ["Lateness: $50", "Tax: $1,100", "Security: $250"], amount: "1.1$", final: "$4,760.00", reason: "2 days absence", by: "System" },
                        { name: "Peter Jones", basic: "$4,500.00", date: "2024-04-25", abs: "$0.00 (0 days)", ot: "10 hrs", inc: "$500.00", ded: ["Lateness: $0", "Tax: $750", "Security: $180"], amount: "1.1$", final: "$4,370.00", reason: "2 days absence", by: "System" },
                        { name: "Mary Williams", basic: "$7,000.00", date: "2024-04-25", abs: "$0.00 (0 days)", ot: "2 hrs", inc: "$100.00", ded: ["Lateness: $0", "Tax: $1,300", "Security: $300"], amount: "1.1$", final: "$5,925.00", reason: "2 days absence", by: "System" },
                        { name: "David Brown", basic: "$3,800.00", date: "2024-04-25", abs: "$126.67 (1 day)", ot: "0 hrs", inc: "$0.00", ded: ["Lateness: $25", "Tax: $550", "Security: $150"], amount: "1.1$", final: "$3,188.33", reason: "2 days absence", by: "System" },
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
                                <p className="" >{t('DeductionAmount')}: </p>
                                <p className="">{row.amount}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('FinalNetSalary')}: </p>
                                <p className="">{row.final}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('AbsenceDeducted')}: </p>
                                <p className="">{row.abs}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('deductiondate')}: </p>
                                <p className="">{row.date}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('reaspn')}: </p>
                                <p className="">{row.reason}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('Applied')}: </p>
                                <p className="">{row.by}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MonthlyPayroll;
