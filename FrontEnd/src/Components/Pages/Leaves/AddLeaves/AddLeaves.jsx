import '../AddLeaves/AddLeaves.css'
import { useTranslation } from 'react-i18next'
export default function AddLeaves(){
    const {t}=useTranslation('Leaves/AddLeaves')
    const close=(e)=>{
        const close=document.querySelector('.addleaveshidden')
        const close1=document.querySelector('.addleaves-co')
       
        if(close){
             
             document.body.style.overflow='auto'
             close.style.display='none'
             close.style.visibility='hidden'
             close1.style.display='none'
        }
    }
    

    return(
        <>
         <div className='addleaves-co'>
              <h2 className="">{t('add')}</h2>
                 <form className="">
                            <div className="nameleaves"> 
                                <label className="" >{t('name')}</label>
                                <input className=""  placeholder="e.g., Annual Leave" type="text" />
                            </div>
                            <div className="nameleaves"> 
                                <label className="" >{t('name1')}</label>
                                <input className=""  placeholder="مثلاً إجازة سنوية" type="text" />
                            </div>
                            <div className="Allocation">
                                <label  >{t('Allocation')}</label>
                                <input className=""  placeholder={t('number')} type="number" />
                            </div>
                            <div className='DescriptionPolicy'>
                                <label className="" >{t("DescriptionPolicy")}</label>
                                <textarea className=""  placeholder={t('details')} rows="4"></textarea>
                            </div>
                               <div className='DescriptionPolicy'>
                                <label className="" >{t("DescriptionPolicy1")}</label>
                                <textarea className=""  placeholder={t('details1')} rows="4"></textarea>
                            </div>
                            <div className="paidApproval">
                                <div className="">
                                    <input className=""  type="checkbox" />
                                    <label className="" >{t('Paid')}</label>
                                </div>
                                <div className="">
                                    <input defaultChecked className=""  type="checkbox" />
                                    <label className="">{t('Approval')}</label>
                                </div>
                            </div>
                            <div className="cancon">
                                <button onClick={(e)=>{close(e)}} className="cancel" type="button">Cancel</button>
                                <button className="confirm" type="submit">Submit</button>
                            </div>
                        </form>
         </div>
        </>
    )
}