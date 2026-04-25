import { useState } from 'react';
import './Requestaleave.css'
import { useTranslation } from 'react-i18next'
export default function Requestaleave() {
    const { t } = useTranslation("EmployeePortal/Requestaleave")
    const [hidden, setHidden] = useState(true)
    const [hidden1, setHidden1] = useState(true)
    const [hidden2, setHidden2] = useState(true)
    const [add, setAdd] = useState(true)
    const employees = [];
  
    const e = ['sick']
    const Interviews = []
    for (let i = 0; i < 1; i++) {
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
    const close=(e)=>{
       console.log('2')
        const element=document.querySelector('.reqleavecovi')
            document.body.style.overflow='auto'
        console.log(element)
        if(element){
               console.log('fff')

            element.className='reqleaveco'
        }
    }
    return (
        <>
            <div className="sh_In_scr ">
                <div className="sh_In_con ">
                    <form>
                        <div className="sh_In_tpx">
                            <div>
                                <p className="sh_In_tit">{t("Requestaleave")}</p>
                            
                            </div>
                        
                        </div>
                        <hr />
                        <div className='con'>
                          
                            <div className='type tyleave'>
                                <p>{t('type')}</p>
                                <select>
                                    {Interviews}
                                </select>
                            </div>
                            <div className='start tyleave'>
                                <p>{t('Dates')}</p>
                                <input type='date' required onChange={(e)=>changeDate(e,'1')} className={hidden1 ? 'hidden' : 'black'} onKeyDown={(e) => e.preventDefault()} />
                            </div>
                            <div className='enddate tyleave'>
                                <p >{t('duration')}</p>
                                <input type='number' required onChange={(e)=>changeDate(e,'2')} className={hidden2 ? 'hidden' : 'black'} onKeyDown={(e) => e.preventDefault()} />
                            </div>
                        </div>
                     
                        <div className='notes'>
                            <p className='notes'>{t("reason")}</p>
                            <textarea className='notes' placeholder={t("placeholder")}></textarea>
                        </div>
                         <div className='notes'>
                          <p className='notes'>{t("attah")}</p>
                        <div className='fileleave'>
                            <i className='bi bi-upload'></i>
                            <label class="custom-file-label" for="file-input"> {t("click")}</label>
                            <input type='file'  id="file-input"/>
                        </div>
                        </div>
                        <div className='cancon'>
                            <button className='cancel' type='button' onClick={(e)=>{close(e)}}>{t("cancel")}</button>
                            <button className='confirm' type='submit'><i className='bi bi-check'></i> {t("confirm")}</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}