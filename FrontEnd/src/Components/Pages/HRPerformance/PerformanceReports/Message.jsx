import { useTranslation } from "react-i18next";
export default function Message (){
        const {t}=useTranslation("HrPerformance/PerformanceReports")
    
         const handleClose = (e) => {

            const container = document.querySelector('.del-cycle-hr');
            if (container) {
                document.body.style.overflow = 'auto';
                container.style.display = 'none';
              
              
             }
       
    };

    return(
        <>
           <div className="modal-box del-box">
             <div>
                 <button className="modal-close-btn" onClick={()=>handleClose()} title="Close">
          <i className="fa-solid fa-xmark"></i>
        </button>
             </div>
        <p>{t("message")}</p>
          <div className="ok-del">
            <button type="submit" className="btn-modal-submit" id="submitCycleBtn">
            {t("ok")}
          </button>
          </div>
           </div>
        </>
    )
}