import { useTranslation } from "react-i18next"
import './Attachments.css'
import '../ScheduleInterview/ScheduleInterview'
import DocumentsAttachments from "../Documents-Attachments/DocumentsAttachments"
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
    const files = [
      {
        id: 1,
        name: "Resume_Final.pdf",
        size: 2.4,
        sizeUnit: "MB",
        type: "pdf",
        url: "/uploads/resume.pdf",
        previewUrl: "/previews/resume.jpg",
        uploadDate: "2024-01-20"
      },{
        id: 2,
        name: "Resume_Final.word",
        size: 2.5,
        sizeUnit: "MB",
        type: "word",
        url: "/uploads/resume.pdf",
        previewUrl: "/previews/resume.jpg",
        uploadDate: "2024-01-20"
      },{
        id: 3,
        name: "Resume_Final.excel",
        size: 2.6,
        sizeUnit: "MB",
        type: "excel",
        url: "/uploads/resume.pdf",
        previewUrl: "/previews/resume.jpg",
        uploadDate: "2024-01-20"
      },{
        id: 4,
        name: "Resume_Final.zip",
        size: 2.6,
        sizeUnit: "MB",
        type: "zip",
        url: "/uploads/resume.pdf",
        previewUrl: "/previews/resume.jpg",
        uploadDate: "2024-01-20"
      },{
        id: 5,
        name: "Resume_Final.excel",
        size: 2.6,
        sizeUnit: "MB",
        type: "excel",
        url: "/uploads/resume.pdf",
        previewUrl: "/previews/resume.jpg",
        uploadDate: "2024-01-20"
      },{
        id: 6,
        name: "Resume_Final.excel",
        size: 2.6,
        sizeUnit: "MB",
        type: "excel",
        url: "/uploads/resume.pdf",
        previewUrl: "/previews/resume.jpg",
        uploadDate: "2024-01-20"
      },]
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
                    <div className="doc">
                      {
                        files.map((file)=>(
                          <DocumentsAttachments key={file.id} files={file}/>
                        ))
                      }
                    </div>
                    <div className="total"><p>8 {t('Documents')} 100kb</p></div>
                </div>
            </div>
    </>)
}