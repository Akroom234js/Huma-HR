import React from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import './LeavesReports.css';
import { useTranslation } from 'react-i18next';
const LeavesReports = () => {
    const {t}=useTranslation("Reports/LeavesReports")
    const inf=[{title:t("Approved"),color:"green"},{title:t("Pending"),color:"orangered"},{title:t("Rejected"),color:"red"}]
    const number=["62.6%","28.9%","8.5%"]
    const number1=["89","41","12"]
    const info=[]
    for(let i=0;i<=2;i++){
      info.push(
   <div className='info-mar'>
                <div className='daily-attendance daily-attendance-border'><p>{inf[i].title}</p><p>{number[i]} ({number1[i]})</p></div>
                <div className='Approved-inf'><div className={`Approved-inf ${inf[i].color}`} style={{width:`${number[i]}`}}></div></div>
              </div>
      )
    }   
    return (
        <div className="reports-page">
            <PageHeader title={t("LeavesReports")} Explanation={t("Detailed")} />
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
    );
};

export default LeavesReports;
