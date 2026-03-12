import AddLeaves from '../AddLeaves/AddLeaves'
import '../LeavesManagement/LeavesManagement.css'
import { useTranslation } from 'react-i18next'
export default function LeavesManagement(){
    const {t}=useTranslation('Leaves/LeavesManagement')
    const type=['Vacation',"Sick","Personal","Bereavement","Parental"]
    const type1=["Vacation1","Sick1","Personal1","Bereavement1","Parental1"]
    
    const addnewtype=(e)=>{
        const add=document.querySelector('.addleaveshidden')
        const add1=document.querySelector('.addleaves-co')
       
        if(add){
             
             document.body.style.overflow='hidden'
             add.style.display='block'
             add.style.visibility='visible'
             add1.style.display='block'
        }
    }
    const status="Pending"
    const typesLeaves=[]
    for(let i=0;i<4;i++){
        
                          typesLeaves.push(  <li><span className="typesLeaves">{t(type[`${i}`])}</span> {t(type1[`${i}`])}</li>)
    }
    const leavesinfo=[]
    for(let i=0;i<4;i++){
        
                          leavesinfo.push(          <tr className="leaves-emp">
                            <td className="">John Doe</td>
                            <td className="">Vacation</td>
                            <td className="">2024-08-15</td>
                            <td className="">2024-08-20</td>
                            <td className="PAID">10</td>
                            <td className="">
                                <span className={`status ${status=="Pending"?"brown":status=="Approved"?"green":"red"}`}>Pending</span>
                            </td>
                            <td className="check-x">
                                    <button className={`${status=="Pending"?"check-leaves":"check-leaveshidden"}`}><span className="bi bi-check"></span></button>
                                    <button className={`${status=="Pending"?"x-leaves":"check-leaveshidden"}`}><span className="bi bi-x" style={{fontVariationSettings: "'FILL' 1"}}></span></button>
                            </td>
                        </tr>)
    }
    const leavesinfocard=[]
    for(let i=0;i<4;i++){
        leavesinfocard.push(<div className='leavescard-co'>
            <div className='leavescard'><p>{t('EMPLOYEE')}: </p><p> John Doe</p></div>
            <div className='leavescard'><p>{t("LEAVETYPE")}: </p><p> Vacation</p></div>
            <div className='leavescard'><p>{t("FROMDATE")}: </p><p> 2024-08-15</p></div>
            <div className='leavescard'><p>{t("TODATE")}: </p><p> 2024-08-20</p></div>
            <div className='leavescard'><p>{t("LEAVESREMAINING")}: </p><p> 10</p></div>
            <div className='leavescard'><p>{t("STATUS")}: </p><p> Pending</p></div>
            <div className='leavescard-button'>  <button className={`${status=="Pending"?"check-leaves-card":"check-leaveshidden"}`}><span className="bi bi-check">Accept</span></button>
                                    <button className={`${status=="Pending"?"x-leaves-card":"check-leaveshidden"}`}><span className="bi bi-x" style={{fontVariationSettings: "'FILL' 1"}}>Reject</span></button></div>
        </div>)
    }
    return(
        <>
        <div className='addleaveshidden'>
<AddLeaves/>
            </div>
         <header className="leavesManagementadd">
                                <div className='leavesManagementHeader'>
                                    <p className="leavesManagement">{t("LeavesManagement")} </p>
                                    <p className="Track">{t('track')}</p>
                                </div>
                                <button className='add' onClick={(e)=>{addnewtype(e)}}><i className='bi bi-plus'></i>{t('add')}</button>
                            </header>
         <div className="leaves-table">
  <div className='leaves-table-filter'>
     <h3 className="">{t('RequestsTable')}</h3>
                                 
                                      <div className='leaves-filter'>
                                          <div className="relative">
                                            <select className="">
                                                <option>{t('FilterbyStatus')}</option>
                                                <option>{t("Approved")}</option>
                                                <option>{t("Pending")}</option>
                                                <option>{t("Rejected")}</option>
                                            </select>
                                            
                                        </div>
                                        <div className="relative">
                                            <select className="">
                                                <option>{t('FilterbyLeaveType')}</option>
                                                <option>Vacation</option>
                                                <option>Sick Leave</option>
                                                <option>Personal</option>
                                            </select>
                                          
                                        </div>
                                        <div className="relative">
                                            <input className="" pattern="^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|30)\/\d{4}$" placeholder="mm/dd/yyyy" type="text" />
                                       
                                        </div>
                                      </div>
  </div>

  <div className="">
                <table className="">
                    <thead className="leaves">
                        <tr>
                            <th className="" >{t('EMPLOYEE')}</th>
                            <th className="" >{t("LEAVETYPE")}</th>
                            <th className="" >{t("FROMDATE")}</th>
                            <th className="" >{t("TODATE")}</th>
                            <th className="PAID" >{t("LEAVESREMAINING")}</th>
                            <th className="" >{t("STATUS")}</th>
                            <th className="" >{t("ACTIONS")}</th>
                        </tr>
                    </thead>
                  <tbody>{leavesinfo}</tbody>
                 
                </table>
                 <div className='leavesinfocard'>{leavesinfocard}</div>
            </div>

         </div>
         <div className="leaves-policy">
                <h3 className="PolicyOverview">{t("PolicyOverview")}</h3>
                <div className="Eligibility">
                    <div>
                        <h4 className="">{t("Eligibility")}</h4>
                        <p>{t("Eligibility1")}</p>
                    </div>
                    <div className="Types">
                        <h4 >{t("Types")}</h4>
                        <ul >{typesLeaves}</ul>
                    </div>
                    <div className="Request">
                        <h4 >{t("Request")}</h4>
                        <p>{t("Request1")}</p>
                    </div>
                    <div className="Request2">
                        <p className="Request2">{t("Request2")}</p>
                    </div>
                </div>
            </div>
        </>
    )
}