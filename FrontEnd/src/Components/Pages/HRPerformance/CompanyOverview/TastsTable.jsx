import { useTranslation } from "react-i18next"
export default function TasksTable(){
    const {t}=useTranslation("HrPerformance/CompanyOverview")
    const department=["All Departments","IT Department","Sales Division","HR Department"];
    const task=["Optimize REST API Endpoints","Draft Client Pitch Slide Deck","Migrate Legacy Database to PostgreSQL","Structure Q3 Recruiting Templates","Structure Q3 Recruiting Templates"]
    const emp=["John Doe","Sara Connor","Alice Smith","Kevin Spacey","Kevin Spacey"]
    const status=["Pending Review","Scored","In Progress","Revision","Unstarted"]
    const grad=["Grading...","50%","Pending...","Pending...","Pending..."]
    const tasks=[]
    for(let i=0;i<5;i++){
        tasks.push(     <tr >
                <td >{task[i]}</td>
                <td>{emp[i]}</td>
                <td>IT Department</td>
                <td>Emily Mitchell</td>
                <td>May 30, 2026</td>
                <td><span className={`badge ${status[i]==="Scored"?"badge-scored":status[i]==="Pending Review"?"badge-review":status[i]==="Revision"?"badge-revision":status[i]==="Unstarted"?"badge-pending":"badge-progress"}`} >{status[i]}</span></td>
                <td className={`${status[i]==="Scored"?"Scored-text":"gray-text"}`}>{grad[i]}</td>
              </tr>)
    }
    return(
        <>
        
      {/* <!-- Read-Only Company-wide Tasks Table --> */}
      <div className="card-hr">
        <div className="card-title-hr">
          <span>{t("table.Tasks")}</span>
          <span ><i className="fa-solid fa-lock"></i> {t("table.view")}</span>
        </div>

        {/* <!-- Read Only filter --> */}
        <div className="filter-bar">
          <div className="search-wrapper">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="taskGlobalSearch" className="search-input" placeholder={t("table.title")} onkeyup="filterGlobalTable()"/>
          </div>
          <div className="filter-group">
            <span className="filter-label">{t("table.Department")}</span>
            <select id="deptGlobalFilter" className="select-input" onchange="filterGlobalTable()">
            {
                department.map((op)=>(
                      <option value={op}>{op}</option>
                ))
            }

            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="custom-table" id="globalTasksTable">
            <thead>
              <tr>
                <th>{t("table.Task")}</th>
                <th>{t("table.Employee")}</th>
                <th>{t("table.Department")}</th>
                <th>{t("table.Supervisor")}</th>
                <th>{t("table.Date")}</th>
                <th>{t("table.Status")}</th>
                <th>{t("table.Grade")}</th>
              </tr>
            </thead>
            <tbody>
                {tasks}
              {/* <tr data-dept="it">
                <td >Optimize REST API Endpoints</td>
                <td>John Doe</td>
                <td>IT Department</td>
                <td>Emily Mitchell</td>
                <td>May 30, 2026</td>
                <td><span className="badge badge-review">Pending Review</span></td>
                <td >Grading...</td>
              </tr>
              <tr data-dept="sales">
                <td>Draft Client Pitch Slide Deck</td>
                <td>Sara Connor</td>
                <td>Sales Division</td>
                <td>Marcus Aurelius</td>
                <td>May 25, 2026</td>
                <td><span className="badge badge-scored">Scored</span></td>
                <td >95.0</td>
              </tr>
              <tr data-dept="it">
                <td >Migrate Legacy Database to PostgreSQL</td>
                <td>Alice Smith</td>
                <td>IT Department</td>
                <td>Emily Mitchell</td>
                <td>Jun 04, 2026</td>
                <td><span className="badge badge-progress">In Progress</span></td>
                <td >Pending...</td>
              </tr>
              <tr data-dept="hr">
                <td >Structure Q3 Recruiting Templates</td>
                <td>Kevin Spacey</td>
                <td>HR Department</td>
                <td>Rachel Vance</td>
                <td>May 22, 2026</td>
                <td><span className="badge badge-scored">Scored</span></td>
                <td >84.0</td>
              </tr> */}
            </tbody>
          </table>
        </div>
      </div>
        </>
    )
}