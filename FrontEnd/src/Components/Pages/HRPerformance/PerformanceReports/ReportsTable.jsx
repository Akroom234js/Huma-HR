import FinalScoreBreakdown from '../../../Shared/Performance/FinalScoreBreakdown/FinalScoreBreakdown'
import DecisionBadge from '../../../Shared/Performance/DecisionBadge/DecisionBadge'
import CompetencyGapTag from '../../../Shared/Performance/CompetencyGapTag/CompetencyGapTag'
import AIRecommendationCard from '../../../Shared/Performance/AIRecommendationCard/AIRecommendationCard'
import { useTranslation } from 'react-i18next'
export default function ReportsTable(){
       const {t}=useTranslation("HrPerformance/PerformanceReports")
    
            // Toggle Expandable Scorecard Rows
    function toggleRowDetails(detailRowId) {
     
      const detailRow = document.getElementById(detailRowId);
      detailRow.classList.toggle('expanded');
      
      const chevron = detailRow.previousElementSibling.querySelector('i');
      if (detailRow.classList.contains('expanded')) {
        chevron.className = "fa-solid fa-chevron-up";
         console.log(detailRowId)
      } else {
        chevron.className = "fa-solid fa-chevron-down";
      }
    }
    const emp=["John Doe","Alice Smith","Robert King "]
    const dep=["IT Department","IT Department","IT Department"]
    const num=["98.0","30","80","70","50","60"]
    const row=[]
    const det=[]
    for(let i=0;i<3;i++){
      row.push(           <>
        <tr className="clickable-row" onClick={(e)=>toggleRowDetails(`expand${i}`)}>
                <td ><i className="fa-solid fa-chevron-down" ></i>{emp[i]}</td>
                <td>{dep[i]}</td>
                <td>{num[0]}</td>
                <td>{num[1]}</td>
                <td>{num[2]}</td>
                <td>{num[3]}</td>
                <td>{num[4]}</td>
                <td >{num[5]}</td>
                <td><span ><DecisionBadge decision="bonus"/></span></td>
              
              </tr>
              <tr id={`expand${i}`} className="detail-row">
                <td colSpan="9">
                  <div className="detail-row-content">
                    <div className="weights-grid-hr">
                 <FinalScoreBreakdown scores={{ finalScore: 83.5, components: { task: 85, manager: 80, peer: 75, attendance: 90, overtime: 60 } }} />
                    </div>

                    {/* <!-- Gaps & AI recommendations details --> */}
                    <div >
                      <div>
                        <h4 >{t("Gaps")}</h4>
                        <div className='fl-per-re'>
                          <div><CompetencyGapTag gapType="technical" gapName="التنفيذ الفني" /></div>
                          <div className='AIRecommendationCard'>    <AIRecommendationCard recommendation={{ courseName: 'Agile Management', reason: 'تقليل التأخير', matchingScore: 92, sequence: 1 }} />
                      </div>
                          
                       
                        </div>
                      </div>

                    </div>
                  </div>
                </td>
              </tr>
      </> 
              )
    }
    return(
        <>
               {/* <!-- Row 1 --> */}
                {row}
              {/* <!-- Row 1 Details Accordion --> */}
              {det}
        </>
    )
}