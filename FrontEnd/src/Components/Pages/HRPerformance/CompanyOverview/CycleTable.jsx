import { useTranslation } from "react-i18next";
export default function CycleTable(){
     const {t}=useTranslation("HrPerformance/CompanyOverview")
        const show=()=>{
      console.log('fdfdf')
                const container = document.querySelector('.cycle-modal-hr');
            if (container) {
                document.body.style.overflow = 'hidden';
                container.style.display = 'flex';
             
            }
    }
    const name=["First Quarter 2026 (Q1)","Fourth Quarter 2025 (Q4)","Second Quarter 2026 (Q2)"]
    const date=["Jan 01, 2026 - Mar 31, 2026","Oct 01, 2025 - Dec 31, 2025","Apr 01, 2026 - Jun 30, 2026"]
    const back=["Awaiting final closing to calculate","Processed successfully","Unopened"]
    const status=["Active","Closed","Draft"]
    const cycle=[]
    for(let i=0;i<3;i++){
        cycle.push( <tr>
                <td >{name[i]}</td>
                <td>{date[i]}</td>
                <td>14 Employees</td>
                <td><span className="badge badge-cycle-active"><i className={`${status[i]==="Active"?"fa-solid fa-circle-play":"hidden-hr"}`}></i> {status[i]}</span></td>
                <td>
                  <div >
                    <span ></span>
                    <span >{back[i]}</span>
                  </div>
                </td>
                <td >
                      <div className={` ${status[i]==="Active"?"":"none-hr"}`} >--</div>
           <div>    <button className={`btn btn-start-cycle btn-edit-cycle ${status[i]==="Draft"?"":"none-hr"}`} onClick={()=>show()}>edit</button>
                </div>
                <div>
           <button className={`btn btn-secondary btn-sm ${status[i]==="Closed"?"":"none-hr"}`} disabled><i className="fa-solid fa-lock"></i> Locked</button>
               
                </div>
                </td>
              </tr>)
    }
    return(
        <>
         {/* <!-- Cycles Cards --> */}
      <div className="card">
        <div className="card-title">
          <span>{t("cycle.Active")}</span>
          <span ><i className="fa-solid fa-circle-check"></i> {t("cycle.Job")}</span>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t("cycle.Cycle")}</th>
                <th>{t("cycle.Duration")}</th>
                <th>{t("cycleTracked")}</th>
                <th>{t("cycle.Status")}</th>
                <th>{t("cycle.Background")}</th>
                <th>{t("cycle.Operations")}</th>
              </tr>
            </thead>
            <tbody>
                {cycle}
            </tbody>
          </table>
        </div>
      </div></>
    )
}