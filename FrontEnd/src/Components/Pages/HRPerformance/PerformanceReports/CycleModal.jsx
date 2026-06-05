import './Model.css'
import { useTranslation } from 'react-i18next';
export default function CycleModal(){
      const {t}=useTranslation("HrPerformance/PerformanceReports")
const dep=["IT Department","IT Department","IT Department"]
  function closeCycleModal() {
      document.getElementById('cycleModal').classList.remove('open');
      document.body.style.overflow = '';
    }

     const handleClose = (e) => {

            const container = document.querySelector('.cycle-modal-hr');
            if (container) {
                document.body.style.overflow = 'auto';
                container.style.display = 'none';
              
              
             }
       
    };

    // Scope selector toggle
    document.querySelectorAll('.scope-option').forEach(option => {
      option.addEventListener('click', function() {
        document.querySelectorAll('.scope-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        this.querySelector('input[type="radio"]').checked = true;
        const isSpecific = this.dataset.scope === 'specific';
        document.getElementById('specificDeptWrapper').style.display = isSpecific ? 'block' : 'none';
        updateCyclePreview();
      });
    });

    // Live preview update
    function updateCyclePreview() {
      const name      = document.getElementById('cycleName').value.trim();
      const startDate = document.getElementById('cycleStartDate').value;
      const endDate   = document.getElementById('cycleEndDate').value;
      const scopeEl   = document.querySelector('.scope-option.selected');
      const scope     = scopeEl ? scopeEl.dataset.scope : 'company';

      let previewParts = [];
      if (name)      previewParts.push(`"${name}"`);
      if (startDate) previewParts.push(formatDateDisplay(startDate));
      if (endDate)   previewParts.push(`→ ${formatDateDisplay(endDate)}`);
      if (scope === 'specific') {
        const dept = document.getElementById('specificDept').value;
        if (dept) previewParts.push(`[${dept}]`);
      } else {
        previewParts.push('[All Departments]');
      }

      document.getElementById('cyclePreviewText').textContent =
        previewParts.length ? previewParts.join('  ·  ') : 'Fill the form above to preview...';

      // Enable/disable submit
      const canSubmit = name && startDate && endDate && new Date(endDate) > new Date(startDate);
      document.getElementById('submitCycleBtn').disabled = !canSubmit;
    }

    return(
        <>
        <div className="modal-box">

      {/* <!-- Header --> */}
      <div className="modal-header">
        <div className="modal-header-title">
          <div className="modal-icon-circle">
            <i className="fa-solid fa-circle-play"></i>
          </div>
          <div>
            <div className="modal-title">{t("new.Start")}</div>
            <div className="modal-subtitle">{t("new.Define")}</div>
          </div>
        </div>
        <button className="modal-close-btn" onClick={()=>handleClose()} title="Close">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="modal-divider"></div>

      {/* <!-- Form --> */}
      <form id="newCycleForm">

        {/* <!-- Cycle Name --> */}
        <div className="modal-form-group">
          <label className="modal-label" for="cycleName">
            {t("new.Name")} <span className="req">*</span>
          </label>
          <input type="text" id="cycleName" className="modal-input" placeholder="e.g. Q3 2026, H1 2026, Annual Review..." onInput={()=>updateCyclePreview()} required=""/>
        </div>

        {/* <!-- Date Range --> */}
        <div className="modal-form-group">
          <label className="modal-label">
            {t("new.Period")} <span className="req">*</span>
          </label>
          <div className="modal-date-grid">
            <div>
              <label className="modal-label">{t("new.Date")}</label>
              <input type="date" id="cycleStartDate" className="modal-input" onInput={()=>updateCyclePreview()} required=""/>
            </div>
            <div>
              <label className="modal-label" >{t("new.End")}</label>
              <input type="date" id="cycleEndDate" className="modal-input" onInput={()=>updateCyclePreview()} required=""/>
            </div>
          </div>
        </div>

        {/* <!-- Scope --> */}
        <div className="modal-form-group">
          <label className="modal-label">{t("new.Scope")} <span className="req">*</span></label>
          <div className="modal-scope-grid">
            <label className="scope-option selected" data-scope="company">
              <input type="radio" name="cycleScope" value="company" checked/>
              <div className="scope-icon"><i className="fa-solid fa-building"></i></div>
              <div>
                <div >{t("new.Entire")}</div>
                <div >{t("new.departments")}</div>
              </div>
            </label>
            <label className="scope-option" data-scope="specific">
              <input type="radio" name="cycleScope" value="specific"/>
              <div className="scope-icon"><i className="fa-solid fa-sitemap"></i></div>
              <div>
                <div>{t("new.Specific")}</div>
                <div >{t("new.Single")}</div>
              </div>
            </label>
          </div>
          <br/>
          {/* <!-- Specific department dropdown (hidden by default) --> */}
          <div id="specificDeptWrapper" >
            <select id="specificDept" className="modal-input" onChange={()=>updateCyclePreview()}>
              <option value="">— {t("new.Select")} —</option>
              {
                dep.map((dep)=><option value={dep}>{dep}</option>)
              }
              {/* <option value="IT Department">IT Department</option>
              <option value="Sales Division">Sales Division</option>
              <option value="HR Department">HR Department</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option> */}
            </select>
          </div>
        </div>

        {/* <!-- Live Preview Banner --> */}
        <div className="modal-preview-banner">
          <i className="fa-solid fa-eye"></i>
          <div>
            <div >{t("new.PREVIEW")}</div>
            <div id="cyclePreviewText">[{t("new.Departments")}]</div>
          </div>
        </div>

        {/* <!-- Footer --> */}
        <div className="modal-footer">
          <button type="button" className="btn-modal-cancel" onClick={()=>handleClose()}>
            {t("new.Cancel")}
          </button>
          <button type="submit" className="btn-modal-submit" id="submitCycleBtn">
            <i className="fa-solid fa-circle-play"></i>
            {t("new.Launch")}
          </button>
        </div>

      </form>
    </div>
        </>
    )
}