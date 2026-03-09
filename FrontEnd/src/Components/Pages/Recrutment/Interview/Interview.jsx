import './Interview.css'
import { useTranslation } from "react-i18next";
export default function Interview({candidates}){
    const { t } = useTranslation("Recrutment/Interviews")
    const{id,name,position}=candidates
    return(
        <>
        <div className="interview">
             <div className='interviewTime'>
                <p className='interviewTime'>11:11</p>
                <p className='AmPm'>PM</p>
                <p className='duration'>{t('duration')}<span>: 1H</span></p>
             </div>
             <div className='empdet'>
                <p className='name'>{name}</p>
                <p> <span>{t('Applying')} </span>{ position}</p>
                <p className='det-inteerview'><i className='bi bi-geo-alt-fill'></i> Room 4</p>
             </div>
             <div className='interviewers'>
                <div className='interviewer'>
                <div className='interviewers'></div>
                <div className='interviewers'></div>
                <div className='interviewers'></div>
               
                </div>
                <p className='interviewers'>{t('interviewers')}</p></div>
        </div>
        </>
    )
}