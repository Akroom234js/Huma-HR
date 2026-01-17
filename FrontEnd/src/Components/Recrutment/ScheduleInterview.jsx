import { useState } from 'react';
import './scheduleInterview.css'
import { useTranslation } from 'react-i18next'
export default function ScheduleInterview() {
    const { t } = useTranslation("Recrutment/ScheduleInterview")
    const [hidden, setHidden] = useState(true)
    const [hidden1, setHidden1] = useState(true)
    const [hidden2, setHidden2] = useState(true)
    const employees = [];

    const e = ['p1', 'p2', 'p3', 'p4']
    for (let i = 0; i < 5; i++) {
        employees.push(
            <option key={i} option={e[i]}>{e[i]}</option>
        )
    }
    const Interviews = []
    for (let i = 0; i < 5; i++) {
        Interviews.push(
            <option key={i} option={e[i]}>{e[i]}</option>
        )
    }
    const changeDate = (e,key) => {
        if(key=='0'){
            setHidden(false)
        }
        else if (key=='1'){
            setHidden1(false)
        }
        else if(key=='2'){
            setHidden2(false)
        }
    }
    return (
        <>
            <div className="sh_In_scr">
                <div className="sh_In_con">
                    <form>
                        <div className="sh_In_tpx">
                            <div>
                                <p className="sh_In_tit">{t("shinterview")}</p>
                                <p className="sh_In_for"> <span className="sh_In_name">hadeel </span>- recrutment</p>
                            </div>
                            <button className='sh_In_x' type='button'>x</button>
                        </div>
                        <hr />
                        <div className='con'>
                            <div className='date'>
                                <p>{t('date')}</p>
                                <input type='date' required  onChange={(e)=>changeDate(e,'0')} className={hidden ? 'hidden' : 'black'} onKeyDown={(e) => e.preventDefault()} />
                            </div>
                            <div className='type'>
                                <p>{t('type')}</p>
                                <select>
                                    {Interviews}
                                </select>
                            </div>
                            <div className='start'>
                                <p>{t('start')}</p>
                                <input type='time' required onChange={(e)=>changeDate(e,'1')} className={hidden1 ? 'hidden' : 'black'} onKeyDown={(e) => e.preventDefault()} />
                            </div>
                            <div className='end'>
                                <p>{t('end')}</p>
                                <input type='time' required onChange={(e)=>changeDate(e,'2')} className={hidden2 ? 'hidden' : 'black'} onKeyDown={(e) => e.preventDefault()} />
                            </div>
                        </div>
                        <div className='interviewers'>
                            <p className='interviewers'>{t("interviewers")}</p>
                            <select className='interviewers' multiple={true}>
                                {employees}
                            </select>
                            <p className='ctrl'>{t("ctrl")}</p>
                        </div>
                        <div className='notes'>
                            <p className='notes'>{t("notes")}</p>
                            <textarea className='notes' placeholder={t("placeholder")}></textarea>
                        </div>
                        <div className='cancon'>
                            <button className='cancel' type='button'>{t("cancel")}</button>
                            <button className='confirm' type='submit'><i className='bi bi-check'></i> {t("confirm")}</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}