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
                <p> <span>{t('Applying')}</span>{position}</p>
             </div>
             <div className='interviewers'>hhh</div>
        </div>
        </>
    )
}