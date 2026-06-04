import { useTranslation } from "react-i18next"
import DecisionBadge from '../../../Shared/Performance/DecisionBadge/DecisionBadge'
export default function PendingActions(){
     const {t}=useTranslation("HrPerformance/AutoActionsHub")
         const emp=["John Doe","Alice Smith","Robert King "]
    const dep=["IT Department","IT Department","IT Department"]
    const num=["98.0","30","80"]
    const row=[]
    for(let i=0;i<3;i++){
        row.push(
<tr>
                <td><span ><DecisionBadge decision="bonus"/></span></td>
                <td >{emp[i]}</td>
                <td>{dep[i]}</td>
                <td>{num[i]}</td>
                <td>Issue Q1 Cash Performance Bonus</td>
                <td>May 29, 2026</td>
                <td >
                  <button className="btn btn-success btn-sm"><i class="fa-solid fa-circle-check"></i> Approve</button>
                  <button className="btn btn-danger btn-sm" ><i class="fa-solid fa-circle-xmark"></i> Reject</button>
                </td>
              </tr>
        )
    }
    return(
        <>
          {/* <!-- Pending Actions --> */}
      <div className="card">
        <div className="card-title">
          <span>{t("pending.Pending")} </span>
          <span >API: GET /performance/actions</span>
        </div>

        <div className="table-wrapper">
          <table className="custom-table" id="actionsTable">
            <thead>
              <tr>
                <th>{t("pending.Type")}</th>
                <th>{t("pending.Employee")}</th>
                <th>{t("pending.Department")}</th>
                <th>{t("pending.Grade")}</th>
                <th>{t("pending.Recommendation")}</th>
                <th>{t("pending.Date")}</th>
                <th >{t("pending  Operations")}</th>
              </tr>
            </thead>
            <tbody>
              {row}
             
            </tbody>
          </table>
        </div>
      </div>
        </>
    )
}