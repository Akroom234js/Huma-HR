import { useTranslation } from "react-i18next"
export default function TaskStatusPool(){
    const {t}=useTranslation("HrPerformance/CompanyOverview")
    const num=['50%','30%','10%','5%','5%']
    const sum=parseFloat(num[0])+parseFloat(num[1])
    const sum1=parseFloat(sum)+parseFloat(num[2])
    const sum2=parseFloat(sum1)+parseFloat(num[3])
    const sum3=parseFloat(sum2)+parseFloat(num[4])
    const per=[`${sum}%`,`${sum1}%`,`${sum2}%`,`${sum3}%`]
    return(<>
       <div className="card" >
          <div className="card-title">{t('pie.StatusPool')}</div>
          <div className="pie-chart-mock-hr">
      <div
  className="pie-circle-hr"
  style={{
    background: `conic-gradient(
      var(--color-scored) 0% ${num[0]},
      var(--color-progress) ${num[0]} ${per[0]},
      var(--color-review) ${per[0]} ${per[1]},
      var(--color-pending) ${per[1]} ${per[2]},
      var(--color-revision) ${per[2]} ${per[3]}
    )`
  }}
></div>

            <div className="chart-legend-hr">
              <div className="legend-item-hr"><span className="legend-dot-hr Scored" ></span><span>{t("pie.Scored")} ({num[0]})</span></div>
              <div className="legend-item-hr"><span className="legend-dot-hr Progress" ></span><span>{t("pie.Progress")} ({num[1]})</span></div>
              <div className="legend-item-hr"><span className="legend-dot-hr Review" ></span><span>{t("pie.Review")} ({num[2]})</span></div>
              <div className="legend-item-hr"><span className="legend-dot-hr Unstarted" ></span><span>{t("Unstarted")} ({num[3]})</span></div>
              <div className="legend-item-hr" ><span className="legend-dot-hr Revision" ></span><span>{t("Revision")} ({num[4]})</span></div>
            </div>
          </div>
        </div>
    </>)
}