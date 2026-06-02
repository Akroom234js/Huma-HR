import { useTranslation } from "react-i18next"
export default function Card(){
     const {t}=useTranslation("HrPerformance/CompanyOverview")
    
    return(
        <>
            <div className="stats-grid-hr">
        <div className="stat-card-hr blue">
          <i className="fa-solid fa-circle-nodes stat-icon-hr"></i>
          <div className="stat-label-hr">{t('card.Departments')}</div>
          <div className="stat-value-hr">5</div>
          <div className="stat-desc-hr">IT, Sales, HR, Marketing, Finance</div>
        </div>
        <div className="stat-card-hr emerald">
          <i className="fa-solid fa-gauge-high stat-icon-hr"></i>
          <div className="stat-label-hr">{t('card.Score')}</div>
          <div className="stat-value-hr">81.2 / 100</div>
          <div className="stat-desc-hr gre"><i className="fa-solid fa-caret-up"></i> +2.4% vs last Q</div>
        </div>
        <div className="stat-card-hr purple">
          <i className="fa-solid-hr fa-network-wired stat-icon-hr"></i>
          <div className="stat-label-hr">{t("card.Pool")}</div>
          <div className="stat-value-hr">124 {t("card.Task")}</div>
          <div className="stat-desc-hr">{t('card.supervisor')}</div>
        </div>
        <div className="stat-card-hr pink">
          <i className="fa-solid fa-circle-exclamation stat-icon-hr"></i>
          <div className="stat-label-hr">{t('card.Requires')}</div>
          <div className="stat-value-hr">3 {t("card.Employees")}</div>
          <div className="stat-desc-hr">{t("card.gaps")} (60)</div>
        </div>
      </div>
        </>
    )
}