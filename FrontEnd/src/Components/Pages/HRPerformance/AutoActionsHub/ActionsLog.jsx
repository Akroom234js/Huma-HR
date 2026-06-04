import { useTranslation } from "react-i18next"
import DecisionBadge from '../../../Shared/Performance/DecisionBadge/DecisionBadge'
export default function ActionsLog(){
     const {t}=useTranslation("HrPerformance/AutoActionsHub")
     const emp=["Sarah Miller","Marcus Brody"]
     const decided=["Rachel Vance","Rachel Vance"]
     const status=["Dispatched to Training Module"," Released to Payroll Queue"]
     const log=[]
     for(let i=0;i<2;i++){
            log.push(
                 <tr>
               <td><span ><DecisionBadge decision="bonus"/></span></td>
                <td >{emp[i]}</td>
                <td>May 20, 2026</td>
                <td>{decided[i]}</td>
                <td className="sco-status"><i className="fa-solid fa-circle-check"></i> {status[i]}</td>
              </tr>
            )
     }
    return(
        <>
        
      {/* <!-- Action logs audit history --> */}
      <div className="card">
        <div className="card-title">{t("log.title")}</div>
        <div className="table-wrapper">
          <table className="custom-table" >
            <thead>
              <tr>
                <th>{t("log.Action")}</th>
                <th>{t("log.Employee")}</th>
                <th>{t("log.Date")}</th>
                <th>{t("log.Decided")}</th>
                <th>{t("log.Status")}</th>
              </tr>
            </thead>
            <tbody>
             {log}
            </tbody>
          </table>
        </div>
      </div>
        </>
    )
}