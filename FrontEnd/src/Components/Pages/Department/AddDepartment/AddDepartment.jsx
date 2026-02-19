import './AddDepartment.css'
import '../../Recrutment/ScheduleInterview/ScheduleInterview'
import ThemeToggle from '../../../ThemeToggle/ThemeToggle'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
export default function AddDepartment(){
    const {t}=useTranslation('Department/AddDepartment')
    const [addemp,setAddemp]=useState(true)
     const employees = [];
         const addSub=(e,i)=>{
        const {id}=e.target.id
        const element=document.querySelector(`.addsub${i}`)
        console.log(i)
   if(element){
 
    console.log(element)
    if(  element.innerHTML=='+'){
        console.log(addemp)
        setAddemp(true)
      element.innerHTML='-'
      
   }else{
    console.log(addemp)
    setAddemp(false)
    element.innerHTML='+'
      
   }
   }
    }
        const e = ['p1', 'p2', 'p3', 'p4']
    for (let i = 0; i < 5; i++) {
        employees.push(
            <div>
                <p>{e[i]}</p>
                <button type='button' className={`addsub${i}`} id={i} onClick={(e)=>{addSub(e,i)}}>+</button>
            </div>
            // <option key={i} option={e[i]}></option>
        )
    }
    
    return(
        <div className='add-department'>

            <div className='add-department-co'>
                 <div className='add-department-title'>
                    <p>{t('add')}</p>
                    </div> 
                    <div className='details-dep'>
                        <p>{t('details')}</p>
                        <div className='name-head'>
                          <div>
                            <p className='name'>{t('name')}</p>
                              <input placeholder={t('e.g')}/>
                          </div>
                             <div>
                                 <p className='head'>{t('head')}</p>
                              <select>
                                <option></option>
                                <option></option>
                                <option></option>
                            </select>
                          </div>
                        </div>
                    </div>
                    <div className='assign'>
                        <p>{t('assign')}</p>
                        <div className='select-emp-role'>
                              <div>
                                 <p className='selectemp'>{t('selectemp')}</p>
                              <select>
                                <option></option>
                                <option></option>
                                <option></option>
                            </select>
                          </div>  
                          <div>
                                 <p className='selectpos'>{t('selectpos')}</p>
                              <select>
                                <option></option>
                                <option></option>
                                <option></option>
                            </select>
                          </div>
                        
                        </div>
                             <div className='selectinterviewers addemploy' >
                                {employees}
                            </div>
                    </div>
                   <div className='send-can-adddepartment cancon'>
                <button className='cancel'>{t('cancel')}</button>
                <button className='confirm'>{t('submit')}</button>
            </div> 
            </div>
            
        </div>
    )
}