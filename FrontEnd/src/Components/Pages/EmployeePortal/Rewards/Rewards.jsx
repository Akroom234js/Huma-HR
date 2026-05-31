import React from "react";
import "./Rewards.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useEffect } from "react";
import "../../EmployeePortal/MyRequests/Leaves.css"
import { useState } from "react";
import { getEmployeeRecognitions } from "../../../../services/RewardsBonusesService";
import { getEmployeeRewards } from "../../../../services/RewardsBonusesService";
// import SendRecognition from "./SendRecognition";

export default function RewardsBonuses() {
     const [rewards, setRewards] = useState([]);
     const [recognitions, setRecognitions] = useState([]);
    //  const [recognitionsSend, setRecognitionsSend] = useState([]);
     const [totalAmount, setTotalAmount] = useState(0);
     const [currentYear, setCurrentYear] = useState(0);
     const [loading, setLoading] = useState(true);
   useEffect(() => {
      const fetchRewards = async () => {
        try {
          const res = await getEmployeeRewards();
          const resRecognitions = await getEmployeeRecognitions();
         const data = res.data?.data ?? res.data ?? [];
         const dataRecognitions = res.data?.data ?? res.data ?? [];
          setRewards(Array.isArray(data.bonuses) ? data.bonuses : []);
          setRecognitions(Array.isArray(dataRecognitions.received) ? dataRecognitions.received : []);
          // setRecognitionsSend(Array.isArray(dataRecognitions.sent) ? dataRecognitions.sent : []);
          setCurrentYear(data.current_year)
          setTotalAmount(data.total_amount)
        } catch (err) {
          console.error('Failed to fetch Rewards:', err);
          setRewards([]);
        } finally {
          setLoading(false);
        }
      };
      fetchRewards();
    }, []);
//     const show=()=>{
//       console.log('fdfdf')
//                 const container = document.querySelector('.SendRecognition');
//             if (container) {
//                 document.body.style.overflow = 'hidden';
//                 container.style.display = 'flex';
//                 // container.style.visibility = 'hidden';
//                 // if (container) container.style.display = 'none';
//             }
//     }
//  const  red=['hh','yjhj','lll','llll','lll','hjjh','k','ll','lll','ll','k','jj','kkk']
  return (
    <div className="rewards-page">
      {/* <div className="SendRecognition">
        <SendRecognition/>
      </div> */}
     <div>
       <h1 className="page-title">Rewards & Bonuses</h1>
           {/* <button 
                            className={`premium-btn-primary `} 
                            onClick={() => show()}
                        >
                          send Recognition
                            <span className="material-symbols-outlined">{showPolicy ? 'visibility_off' : 'visibility'}</span> 
                            {showPolicy ? (t('HidePolicy') || "Hide Policy") : (t('ShowPolicy') || "Show Policy")} 
                        </button> */}
     </div>
      <div className="sm-theme-toggle-wrapper">
       
        <ThemeToggle />
      </div>

      <div className="rewards-grid">
        <div className="row-flex">
          <div className="card rewards-total-card">
            <div className="rewards-total-content">
              <div className="reward-icon">💵</div>
              <div>
                <p>Total Rewards/Bonuses ({currentYear})</p>
                <h2>{totalAmount} $</h2>
              </div>
            </div>
          </div>

          <div className="card recognition-card">
            <h2>Received  Recognition</h2>

            <div >
          
              <div className="recognition-con ">

                 {
                  recognitions.map((recognition)=>(
                    // <div className="recognition-box">1</div>
                    <div key={recognition.id} className="recognition-box brspan">
                        <p>
                         {recognition.message}
                </p>

                <span>- {recognition.sender.full_name} ({recognition.sender.job_title})</span>
                    </div>
                  ))
                 }
              </div>
            </div>
          </div>
        </div>

        <div className="card rewards-history-card">
          <h2>Rewards & Bonuses History</h2>

          <div className="table-wrapper">
            <table className="rewards-table">
              <thead>
                <tr>
                  <th>DATE RECEIVED</th>
                  <th>REWARD/BONUS TYPE</th>
                  <th>AMOUNT/VALUE</th>
                  <th>REASON/DESCRIPTION</th>
                  <th>AWARDED BY</th>
                </tr>
              </thead>

              <tbody>
            
                {
                  rewards.map((reward)=>(
                  <tr key={reward.id}>
                  <td>{reward.date_received}</td>
                  <td>{reward.type}</td>
                  <td className="green">{reward.amount}</td>
                  <td>{reward.reason}</td>
                  <td>{reward.awarded_by}</td>
                </tr>))
                }
        
            
              </tbody>
            </table>
          </div>
        </div>
 {/* <div className="card rewards-history-card card-len">
          <h2>Sent  Recognition</h2>
          
              <div className="recognition-con">

                 {
                  red.map((recognition)=>(
                    <div className="recognition-box ">
                      <div className="brspan"><p>ddjdfkf fnfnslkf nfkfslfsfs jfkjfsfssss</p>
             
                    <span className="brspan">dsdd</span></div>
                    <div className="del-ed">
                      <button>x</button>
                      <button className="bi bi-pencil"></button>
                      </div>
                    </div> */}
                    
                    {/* <div key={recognition.id} className="recognition-box">
                         <p>
                         {recognition.message}
                 </p>

                 <span>- {recognition.sender.full_name} ({recognition.sender.job_title})</span>
                    </div> */}
                  {/* ))
                 }
              </div> */}
{/* </div> */}
        {/* Policy */}
        <div className="card policy-card">
          <h2>📋 Policy Information</h2>

          <p>
            Our rewards and bonus program is designed to recognize the hard work
            and dedication of our employees. For detailed information on
            eligibility and criteria, please refer to the official
            <span className="policy-link">
              {" "}
              Company Rewards Policy document.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
