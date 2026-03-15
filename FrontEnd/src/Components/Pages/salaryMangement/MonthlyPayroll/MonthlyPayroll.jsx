import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './MonthlyPayroll.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const initialData = [
    {
        id: 1, name: "John Doe", dept: "Engineering", month: "April 2024", basic: "$5,000.00", ot: "5 hrs",
        dedTypes: [],
        dedAmounts: [], final: "$4,500.00",
        abs: "$0.00 (0 days)", date: "- -", ded: ["None"], reason: "-", by: "System", status: "Unpaid"
    },
    {
        id: 2, name: "Jane Smith", dept: "Product", month: "April 2024", basic: "$6,200.00", ot: "0 hrs",
        dedTypes: [{ label: "Unexcused Absence", class: "tag-unexcused" }, { label: "Lateness", class: "tag-lateness" }],
        dedAmounts: [{ val: "$400.00", muted: false }, { val: "$50.00", muted: true }],
        final: "$4,760.00",
        abs: "$400.00 (2 days)", date: "2024-04-25", ded: ["Unexcused Absence: $400", "Lateness: $50"], reason: "2 days absence", by: "System", status: "Unpaid"
    },
    {
        id: 3, name: "Peter Jones", dept: "Design", month: "April 2024", basic: "$4,500.00", ot: "10 hrs",
        dedTypes: [{ label: "Policy Violation", class: "tag-policy" }],
        dedAmounts: [{ val: "$75.00", muted: false }],
        final: "$4,370.00",
        abs: "$0.00 (0 days)", date: "2024-04-25", ded: ["Policy Violation: $75"], reason: "Policy Violation", by: "System", status: "Paid"
    },
    {
        id: 4, name: "Mary Williams", dept: "Engineering", month: "March 2024", basic: "$7,000.00", ot: "2 hrs",
        dedTypes: [],
        dedAmounts: [], final: "$5,925.00",
        abs: "$0.00 (0 days)", date: "- -", ded: ["None"], reason: "-", by: "System", status: "Paid"
    },
    {
        id: 5, name: "David Brown", dept: "Product", month: "March 2024", basic: "$3,800.00", ot: "0 hrs",
        dedTypes: [{ label: "Unexcused Absence", class: "tag-unexcused" }, { label: "Lateness", class: "tag-lateness" }],
        dedAmounts: [{ val: "$126.67", muted: false }, { val: "$25.00", muted: true }],
        final: "$3,188.33",
        abs: "$126.67 (1 day)", date: "2024-03-25", ded: ["Unexcused Absence: $126.67", "Lateness: $25"], reason: "1 day absence", by: "System", status: "Paid"
    }
];

const MonthlyPayroll = () => {
    const { t } = useTranslation('SalaryManagement/MonthlyPayroll');
    const [details, setDetails] = useState([]);
    
    // Dataset State
    const [payrollData, setPayrollData] = useState(initialData);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState("All Departments");
    const [selectedMonth, setSelectedMonth] = useState("April 2024");

    const filteredData = payrollData.filter(row => {
        const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === "All Departments" || row.dept === selectedDept;
        const matchesMonth = row.month === selectedMonth;
        return matchesSearch && matchesDept && matchesMonth;
    });

    // Payment Logic
    const handlePayEmployee = (id) => {
        setPayrollData(prevData => prevData.map(emp => 
            emp.id === id ? { ...emp, status: "Paid" } : emp
        ));
    };

    const handlePayAll = () => {
        setPayrollData(prevData => prevData.map(emp => {
            // Only pay the ones exactly currently visible in the filter
            const isVisible = filteredData.some(fEmp => fEmp.id === emp.id);
            if (isVisible && emp.status === "Unpaid") {
                return { ...emp, status: "Paid" };
            }
            return emp;
        }));
    };

    const moredetails = (e, abs, ded, date, reason, by) => {
        const vis = document.querySelector(".details")
        const zind=document.querySelector(".mobile-toggle")
        if(zind) zind.style.zIndex="-1"
        if(vis) vis.style.display = "block"
        document.body.style.overflow = 'hidden'
        
        const newDetails = (
            <div className='details-content-wrapper'>
                <div className='details-body'>
                    <div className='infocardsalary'>
                        <p>{t('AbsenceDeducted', 'Absence Deducted')}:</p>
                        <p>{abs}</p>
                    </div>
                    <div className='infocardsalary'>
                        <p>{t('Deductions', 'Deductions')}:</p>
                        <div>{ded.map((d, i) => <div key={i}>{d}</div>)}</div>
                    </div>
                    <div className='infocardsalary'>
                        <p>{t('deductiondate', 'Deduction Date')}:</p>
                        <p>{date}</p>
                    </div>
                    <div className='infocardsalary'>
                        <p>{t('reason', 'Reason')}:</p>
                        <p>{reason}</p>
                    </div>
                    <div className='infocardsalary'>
                        <p>{t('Applied', 'Applied By')}:</p>
                        <p>{by}</p>
                    </div>
                </div>
            </div>
        );

        setDetails([newDetails]);
    };

    const hidden = (e) => {
        const hid = document.querySelector(".details")
        if (hid) hid.style.display = "none"
        document.body.style.overflow='auto'
        const zind=document.querySelector(".mobile-toggle")
        if (zind) zind.style.zIndex="10"
    }

    return (
        <div className="sm-page">
            <header className="sm-header monthly">
                <h1 className="sm-title">{t('MonthlyPayroll', 'Monthly Payroll & Deductions')}</h1>
                <div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>
            </header>

            <div className='details'>
                <div className='newdetails'>
                    <div className='details-header-section'>
                        <h3>{t('Details', 'Details')}</h3>
                        <button onClick={(e) => { hidden(e) }} className='close-details-btn'>
                            <span className='bi bi-x'></span>
                        </button>
                    </div>
                    {details}
                </div>
            </div>

            <div className='monthlypayrollco'>
                <div className="searchFilterco pay-all-container">
                    <div style={{display: "flex", gap: "10px", flexWrap: "wrap", flex: 1}}>
                        <div className="searchFilter">
                            <i className="bi bi-search search-icon-input"></i>
                            <input 
                                className="Searchemployee" 
                                placeholder={t("Searchemployee", "Search employee...")} 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="AllDepartments"
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                        >
                            <option>All Departments</option>
                            <option>Engineering</option>
                            <option>Product</option>
                            <option>Design</option>
                        </select>
                        <select 
                            className="dateselect"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option>April 2024</option>
                            <option>March 2024</option>
                            <option>February 2024</option>
                        </select>
                    </div>
                    {filteredData.some(emp => emp.status === "Unpaid") && (
                        <button className="pay-all-btn" onClick={handlePayAll}>
                            <i className="bi bi-check2-all"></i> {t('PayAll', 'Pay All Unpaid')}
                        </button>
                    )}
                </div>

                <div className="tablesalary">
                    <table className="">
                        <thead className="">
                            <tr>
                                <th className="" >{t('name', 'EMPLOYEE NAME')}</th>
                                <th className="" >{t('BasicSalary', 'BASIC SALARY')}</th>
                                <th className="" >{t('Overtime', 'OVERTIME HOURS')}</th>
                                <th className="" >{t('DeductionType', 'DEDUCTION TYPE')}</th>
                                <th className="" >{t('DeductionAmount', 'DEDUCTION AMOUNT')}</th>
                                <th className="" >{t('FinalNetSalary', 'FINAL NET SALARY')}</th>
                                <th className="" >{t('Actions', 'STATUS & ACTIONS')}</th>
                            </tr>
                        </thead>
                        <tbody className='salaryinfo'>
                            {filteredData.length > 0 ? filteredData.map((row, idx) => (
                                <tr key={idx} className="">
                                    <td className="" style={{fontWeight: '500'}}>{row.name}</td>
                                    <td className="">{row.basic}</td>
                                    <td className="">{row.ot}</td>
                                    <td className="">
                                        {row.dedTypes.length > 0 ? (
                                            <div className="deduction-container">
                                                {row.dedTypes.map((type, i) => (
                                                    <span key={i} className={`deduction-type-tag ${type.class}`}>{type.label}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{color: 'var(--text-muted)'}}>None</span>
                                        )}
                                    </td>
                                    <td className="">
                                        {row.dedAmounts.length > 0 ? (
                                            <div className="deduction-amount-col">
                                                {row.dedAmounts.map((amt, i) => (
                                                    <span key={i} className={amt.muted ? 'deduction-amount-muted' : 'deduction-amount-val'}>{amt.val}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span>$0.00</span>
                                        )}
                                    </td>
                                    <td className="final-salary-bold">{row.final}</td>
                                    <td className="status-actions-cell">
                                        <div className={`status-badge ${row.status === 'Paid' ? 'paid' : 'unpaid'}`}>
                                            {t(row.status, row.status)}
                                        </div>
                                        {row.status === "Unpaid" && (
                                            <button className="pay-btn" onClick={() => handlePayEmployee(row.id)}>
                                                {t('Pay', 'Pay')}
                                            </button>
                                        )}
                                        <button className="moredetails" onClick={(e) => { moredetails(e, row.abs, row.ded, row.date, row.reason, row.by) }}>
                                            {t('more', 'More Details')}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{textAlign: 'center', padding: '20px', color: 'var(--text-muted)'}}>
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className='salaryinfocard'>
                    {filteredData.length > 0 ? filteredData.map((row, idx) => (
                        <div key={idx} className="infocard">
                            <div className='infocardsalary'>
                                <p className="" >{t('name')}: </p>
                                <p className="" style={{fontWeight:'bold'}}>{row.name}</p>
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
                                <p className="" >{t('DeductionType', 'Deduction Type')}: </p>
                                <div className="">
                                    {row.dedTypes.length > 0 ? row.dedTypes.map((type, i) => <div key={i} style={{fontSize:'12px'}} >{type.label}</div>) : "None"}
                                </div>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('DeductionAmount')}: </p>
                                <p className="">
                                    {row.dedAmounts.length > 0 ? row.dedAmounts.map((amt, i) => <span key={i} style={{marginInlineEnd:'5px'}}>{amt.val}</span>) : "$0.00"}
                                </p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('FinalNetSalary')}: </p>
                                <p className="" style={{fontWeight:'bold'}}>{row.final}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('Status', 'Status')}: </p>
                                <div className={`status-badge ${row.status === 'Paid' ? 'paid' : 'unpaid'}`}>
                                    {t(row.status, row.status)}
                                </div>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'15px'}}>
                                {row.status === "Unpaid" ? (
                                    <button className="pay-btn" onClick={() => handlePayEmployee(row.id)}>
                                        {t('Pay', 'Pay')}
                                    </button>
                                ) : <div></div>}
                               <button className="moredetails" onClick={(e) => { moredetails(e, row.abs, row.ded, row.date, row.reason, row.by) }}>
                                  {t('more', 'More Details')}
                               </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{textAlign: 'center', padding: '20px', color: 'var(--text-muted)'}}>
                            No data found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthlyPayroll;
