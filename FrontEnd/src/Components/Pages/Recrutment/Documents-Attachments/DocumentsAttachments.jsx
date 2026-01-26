import excel from '../../../../assets/excel.jpg'
import word from '../../../../assets/word.jpg'
import zip from '../../../../assets/zip.jpg'
import pdf from '../../../../assets/pdf.jpg'
import './DocumentsAttachments.css'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
export default function DocumentsAttachments({files}){
    const {t}=useTranslation("Recrutment/Attachments")
    const [image,setImage]=useState('')
    const {id,name,size,sizeUnit,type}=files
    useEffect(()=>{if(type==='pdf'){
        setImage(pdf)
    }
    else  if(type==='word'){
        setImage(word)
    }else  if(type==='zip'){
        setImage(zip)
    }else  if(type==='excel'){
        setImage(excel)
    }},[])
    return(<>
    <div className='doc-att'>
       <img className='doc' src={image} alt='no image'/>
       <p  className='name-doc'>{name}</p>
       <p className='size-doc'>{size}{ sizeUnit}</p>
       <div className='preview-download'>
        <button className='eye'><i className="bi bi-eye "></i><span>{t('preview')}</span></button>
        <button className='down-doc'><i className="bi bi-download"></i></button>
       </div>
    </div>
    </>)
}