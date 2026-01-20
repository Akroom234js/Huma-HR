import { useTranslation } from "react-i18next"
import './Attachments.css'
import '../ScheduleInterview/ScheduleInterview'
export default function Attachments({name,att}){
    const { t } = useTranslation("Recrutment/Attachments")
     const close=(e)=>{
       console.log('1')
        const element=document.querySelector('.shinvisibility')
        console.log(element)
        if(element){
               console.log('fff')
            element.className='shinhidden'
        }
    }
     const attDoc=[]
    for(let i=0;i<5;i++){
      <div>
        {attDoc.push(
            <div>
                </div>
        )}
      </div>
    }
    return(<>
      <div className="sh_In_scr ">
                <div className="attachments">
                   <div className="att-name-x">
                     <div>
                    <p className="att-name">{name}</p>
                    <p className="att-attachments">{t('attachments')}</p>
                </div>
              <div className="down-x">  <button className="btn-move calender">
                    <i className="bi bi-download"></i>
                    <span>{t('download')}</span>
                </button>
                    <button className='sh_In_x x' type='button' onClick={(e)=>{close(e)}}>x</button></div>
                   </div>
                    <div className="doc"></div>
                    <div className="total"><p>8 {t('Documents')} 100kb</p></div>
                </div>
            </div>
    </>)
}