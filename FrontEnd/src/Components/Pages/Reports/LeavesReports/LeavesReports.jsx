import React, { useState } from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import ReportPdfPreview from "../components/ReportPdfPreview/ReportPdfPreview";
import './LeavesReports.css';
import { useTranslation } from 'react-i18next';

const LeavesReports = () => {
    const {t}=useTranslation("Reports/LeavesReports")
    const [showPreview, setShowPreview] = useState(false);

    const inf=[{title:t("Approved"),color:"green"},{title:t("Pending"),color:"orangered"},{title:t("Rejected"),color:"red"}]
    const number=["62.6%","28.9%","8.5%"]
    const number1=["89","41","12"]
    const info=[]
    
    for(let i=0;i<=2;i++){
      info.push(
        <div className='info-mar' key={i}>
            <div className='daily-attendance daily-attendance-border'><p>{inf[i].title}</p><p>{number[i]} ({number1[i]})</p></div>
            <div className='Approved-inf'><div className={`Approved-inf ${inf[i].color}`} style={{width:`${number[i]}`}}></div></div>
        </div>
      )
    }   

    const reportConfig = {
        title: t("LeavesReports"),
        summary: "This report provides a detailed breakdown of employee leave activity, including submission status, leave types, and key indicators like average duration and approval rates.",
        kpis: [
            { label: t("submitted"), value: "142" },
            { label: t("approved"), value: "89" },
            { label: t("pending"), value: "41" },
            { label: t("rejected"), value: "12" },
        ],
        sections: [
            {
                title: t("leavestatus"),
                content: (
                    <div style={{ padding: '10px 0' }}>
                        {inf.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>
                                    <span>{item.title}</span>
                                    <span>{number[idx]} ({number1[idx]})</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: item.color === 'green' ? '#22c55e' : item.color === 'orangered' ? '#f59e0b' : '#ef4444', width: number[idx] }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            },
            {
                title: t("Breakdown"),
                content: (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="pdf-stat-box">
                            <p style={{ margin: '5px 0', display: 'flex', justifyContent: 'space-between' }}><span>{t("Annual")}:</span> <strong>65 (45.7%)</strong></p>
                            <p style={{ margin: '5px 0', display: 'flex', justifyContent: 'space-between' }}><span>{t("Sick")}:</span> <strong>40 (28.1%)</strong></p>
                        </div>
                        <div className="pdf-stat-box">
                            <p style={{ margin: '5px 0', display: 'flex', justifyContent: 'space-between' }}><span>{t("Unpaid")}:</span> <strong>15 (10.5%)</strong></p>
                            <p style={{ margin: '5px 0', display: 'flex', justifyContent: 'space-between' }}><span>{t("Other")}:</span> <strong>22 (15.7%)</strong></p>
                        </div>
                    </div>
                )
            },
            {
                title: t("key"),
                content: (
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t("Average")}</p>
                            <p style={{ fontSize: '18px', fontWeight: '800' }}>2.3 {t("days")}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t("rate")}</p>
                            <p style={{ fontSize: '18px', fontWeight: '800', color: '#3b82f6' }}>62.6%</p>
                        </div>
                    </div>
                )
            }
        ],
        filename: "Leaves_Report.pdf"
    };

    return (
        <>
        <ReportPdfPreview 
            show={showPreview} 
            onClose={() => setShowPreview(false)} 
            {...reportConfig}
        />

        <div className="reports-page">
            <PageHeader 
                title={t("LeavesReports")} 
                Explanation={t("Detailed")}
                actions={
                    <button className="emp-export-btn" onClick={() => setShowPreview(true)}>
                      <i className="bi bi-file-earmark-arrow-down" /> Export PDF
                    </button>
                }
            />
            <ReportsNavbar />
          <div className='leave-reports-co'>
             <div className='leave-reports'>
             <h5>{t("leaveactivity")}</h5>
              <div className='daily-attendance'>
              <p>{t("submitted")}</p>
                <p>142</p>
            </div>
            <div className='daily-attendance'>
              <p>{t("approved")}</p>
                <p className='green'>89</p>
            </div>
             <div className='daily-attendance'>
            <p>{t("pending")}</p>
                <p className='orangered'>41</p>
            </div>
             <div className='daily-attendance daily-attendance-border'>
              <p>{t("rejected")}</p>
                <p className='red'>12</p>
            </div>
            
           
           </div>

           {/* ===== */}
    <div className='leave-reports'>
             <h5>{t("leavestatus")}</h5>
             <div className='inf-mar'>
           {info}
           </div>
</div>
           {/* ===== */}

               <div className='leave-reports'>
             <h5>{t("Breakdown")}</h5>
              <div className='daily-attendance'>
              <p>{t("Annual")}</p>
                <p>65 (45.7%)</p>
            </div>
            <div className='daily-attendance'>
              <p>{t("Sick")}</p>
                <p >40 (28.1%)</p>
            </div>
             <div className='daily-attendance'>
            <p>{t("Unpaid")}</p>
                <p >15 (10.5%)</p>
            </div>
             <div className='daily-attendance daily-attendance-border'>
              <p>{t("Other")}</p>
                <p >22 (15.7%)</p>
            </div>
            
           
           </div>


                   <div className='leave-reports'>
             <h5>{t("key")}</h5>
              <div className='daily-attendance'>
              <p>{t("Average")}</p>
                <p>2.3 {t("days")}</p>
            </div>
            <div className='daily-attendance'>
              <p>{t("rate")}</p>
                <p className='blue'>62.6%</p>
            </div>
             <div className=' daily-attendance-border'>
            <p className='gray'>{t("Employees")}</p>
               <div className='highest-leave-days'>
                <div className='daily-attendance daily-attendance-border'>
              <p>Sarah Jenkins</p>
                <p >12 {t("days")}</p>
            </div>
            <div className='daily-attendance daily-attendance-border'>
              <p>Mike Ross</p>
                <p >10 {t("days")}</p>
            </div>
            <div className='daily-attendance daily-attendance-border'>
              <p>Harvey Specter</p>
                <p>8 {t("days")}</p>
            </div>
               </div>
            </div>
          
            
           
            </div>
          </div>
        </div>
        </>
    );
};

export default LeavesReports;
