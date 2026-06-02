import { useTranslation } from "react-i18next";
export default function PerformanceDepartment(){
    const {t}=useTranslation("HrPerformance/CompanyOverview")
      
   const width=['85.5%','60%','75%','50%','90.2%'];

   const name=['IT Dept','Sales','HR Dept','Marketing','Finance']
   const dep=[]
    for(let i=0;i<5;i++){
     dep.push(<>
       <div className="bar-row">
              <div className="bar-label">{name[i]}</div>
              <div className="bar-fill-track"><div className="bar-fill-amount" style={{width:width[i]}}></div></div>
              <div className="bar-value">{width[i]}</div>
            </div>
     </>)
    }
    return(
        <>
          {/* <!-- Charts & Visual representation --> */}
      
        {/* <!-- Bar chart card --> */}
        <div className="card">
          <div className="card-title">{t("bartitle")}</div>
          <div className="bar-chart-container">
           {dep}
          </div>
        </div>
      
        </>
    )
}