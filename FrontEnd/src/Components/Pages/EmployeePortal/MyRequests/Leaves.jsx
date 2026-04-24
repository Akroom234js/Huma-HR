import React from 'react';
import './Leaves.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import { useState } from 'react';
import Requestaleave from './Requestaleave';
const Leaves = () => {
     const [leaveType, setLeaveType] = useState("");
       const [status, setStatus] = useState("");
    const {t}=useTranslation("EmployeePortal/EmployeePortalLeaves")
     const type1=["Sick1"]
     const type=["Sick"]
     const Type = [
        { label: t('stats.sick'), value: "15" },
        { label: t('stats.Annual'), value: "24" },

    ];
    
    const leaveRequests = [
        {
            id: 1,
            type: "Annual",
            dates: "2023-11-01",
            datee: " 2023-11-03",
            duration: 3,
            status: "approved",
   Discounts:100,
    reson:"-"
        },
        {
            id: 2,
            type: "Sick",
            dates: "2023-10-26",
            datee: "2023-10-27",
            duration: 1,
            status: "pending",
  Discounts:100,
    reson:"-"
        },
        {
            id: 3,
            type: "Emergency",
            dates: "2023-10-20",
            datee: "2023-10-21",
            duration: 1,
            status: "rejected",
    Discounts:"-",
    reson:"More dayes than the default number of days."
        },
        {
            id: 4,
      
            type: "Annual",
            dates: "2023-12-20",
            datee: "2024-01-01",
            duration: 12,
            status: "pending",
      Discounts:100,
    reson:"-"
        },
        {
            id: 5,

            type: "Sick",
            dates: "2023-11-05",
            datee: "2023-11-06",
            duration: 1,
            status: "pending",
Discounts:"--",
    reson:"-"
        },
        {
            id: 6,

            type: "Annual",
            dates: "2023-11-10",
            datee: "2023-11-15",
            duration: 5,
            status: "pending",
Discounts:100,
    reson:"-"
        },
        {
            id: 7,  
            type: "Annual",
            dates: "2023-11-12",
            datee: "2023-11-14",
            duration: 2,
            status: "pending",
            Discounts:100,
    reson:"-"
        }
    ];
      // States for Modal
        const [modalOpen, setModalOpen] = useState(false);
        const [selectedReason, setSelectedReason] = useState("");
   // Opening Modal
    const openModal = (reason) => {
        setSelectedReason(reason);
        setModalOpen(true);
        document.body.style.overflow = 'hidden'; // prevent background scrolling
        
        // Push ThemeToggle behind blur if necessary
        const themeToggle = document.querySelector(".mobile-toggle");
        if(themeToggle) themeToggle.style.zIndex = "-1";
    };

    // Closing Modal
    const closeModal = () => {
        setModalOpen(false);
        setSelectedReason("");
        document.body.style.overflow = 'auto'; // allow background scrolling
        
        // Restore ThemeToggle z-index
        const themeToggle = document.querySelector(".mobile-toggle");
        if(themeToggle) themeToggle.style.zIndex = "10";
    };

        const typesLeaves=[]
    for(let i=0;i<1;i++){
        
                          typesLeaves.push(  <li><span className="typesLeaves">{t(type[`${i}`])}</span> {t(type1[`${i}`])}</li>)
    }
        const open=(e)=>{
       console.log('2')
        const element=document.querySelector('.reqleaveco')
            document.body.style.overflow='hidden'
        console.log(element)
        if(element){
               console.log('fff')

            element.className='reqleavecovi'
        }
    }
    return (
        <div className="portal-page-container-leaves">
            <div className='reqleaveco'>
                <Requestaleave/>
            </div>
            {/* <h1>My Leaves</h1> */}
              <div className='leaves-emp-header'>
                
                    <div className='addRequestaleaveTitle'>
                        <h1>{t("title")}</h1>
                         <button className='addRequestaleave' onClick={()=>{open()}}>{t("Requestaleave")}</button> 
              
                    </div>
                      <ThemeToggle/>
              </div>
                 <div className="stats-grid">
                {Type.map((s, i) => (
                    <div className="stat-card" key={i}>
                        <span className="stat-label">{s.label}</span>
                        <span className="stat-value">{s.value} {t("Days")}</span>
                    </div>
                ))}
            </div>

                  {/* Filter Section */}
                        <div className="leaves-filters">
                        <div className='logfilter'>
                              <h3>{t("log")}</h3>
                            <div className="filters-row">
                                    <FilterDropdown
                        value={leaveType}
                        onChange={setLeaveType}
                        options={[{ value: "", label: t('filters.leave_type') }, { value: "annual", label: t("Type.Annual") }, { value: "sick", label: t("Type.Sick") }]}
                    />
                    <FilterDropdown
                        value={status}
                        onChange={setStatus}
                        options={[{ value: "", label: t('filters.status') }, { value: "approved", label: t('status.approved') }, { value: "pending", label: t('status.pending') }, { value: "rejected", label: t('status.rejected') }]}
                    />
                           
                            </div>
                        </div>

                         <div className="adjustments-table-container">
                    <table className="adjustments-table">
                        <thead>
                            <tr className='leavreq'>
                                <th>{t("TypeLeave")}</th>
                                <th>{t('Dates')}</th>
                                <th>{t('Datee')}</th>
                                <th>{t('duration')}</th>
                                <th>{t('Discounts')}</th>
                                
                                <th>{t('statusleave')}</th>
                                <th>{t('Details')}</th>
                              
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.length > 0 ? leaveRequests.map(row => (
                                <tr key={row.id} className='leavreq'>
                              
                                    <td className="adj-old-salary">{row.type}</td>
                                    <td >{row.dates}</td>
                                    
                                    <td>{row.datee}</td>
                                    <td>{row.duration}</td>
                                    <td>{row.Discounts}</td>
                                    <td ><span className={` ${row.status=="approved"?"approved":row.status=="pending"?"pending":"reject"}`}>{row.status}</span></td>
                                  
                                    <td>
                                        {
                                           row.status=="rejected"?  <button className="btn-view-reason" onClick={() => openModal(row.reson)}>
                                       {t('View')}{/* View text instead of Icon */}
                                        </button>:<span>-</span>
                                        }
                                    
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" style={{textAlign: 'center', padding: '30px', color: 'var(--text-muted)'}}>
                                        {t('NoData', 'No matching records found')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                        </div>
                             <div className="leaves-filters">
                <h3 className="PolicyOverview">{t("PolicyOverview")}</h3>
                <div className="Eligibility">
                
                    <div className="Types">
                        <h4 >{t("Types")}</h4>
                        <ul >{typesLeaves}</ul>
                    </div>
                   
                </div>
            </div>
               {/* Reason Modal */}
            {modalOpen && (
                <div className="reason-modal-overlay" onClick={closeModal}>
                    <div className="reason-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="reason-modal-header">
                            <h3>{t('MoreDetails')}</h3>
                            <button onClick={closeModal}><i className="bi bi-x"></i></button>
                        </div>
                        <div className="reason-modal-body">
                            <p className="reason-text">{selectedReason}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;
