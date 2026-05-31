// import { useState } from 'react';
// import './SendRecognition.css';
// import { useEffect } from 'react';
// export default function SendRecognition(){
//     const [employee,setEmployee]=useState([])
//     const [loading, setLoading] = useState(true);
//      const handleClose = (e) => {

//             const container = document.querySelector('.SendRecognition');
//             if (container) {
//                 document.body.style.overflow = 'auto';
//                 container.style.display = 'none';
              
              
//              }
       
//     };

//        useEffect(() => {
//           const fetchEmployee = async () => {
//             try {
//               const res = await getAllEmployee();
//               const resRecognitions = await getEmployeeRecognitions();
//              const data = res.data?.data ?? res.data ?? [];
//               console.log(data)
//               setEmployee(Array.isArray(data) ? data : []);
             
//             } catch (err) {
//               console.error('Failed to fetch Rewards:', err);
//               setEmployee([]);
//             } finally {
//               setLoading(false);
//             }
//           };
//           fetchEmployee();
//         }, []);
//     const options=['sss','kk']
//     return(
//         <div className="send-rec">
//                  <div className="filter-dropdown-wrapper">
             
//                 <select
//                     className="filter-dropdown"
//                     value={value}
//                     onChange={(e) => onChange(e.target.value)}
//                 >
//                     {options.map((option) => (
//                         <option
//                          key={option.value}
//                           value={option.value}
//                           >
//                             {option}
//                             {option.label}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//               <div className="form-row-group">
//                             <label className="premium-label">{t('name') || "Leave Name (English)"}</label>
//                       <textarea 
//                                 className="premium-textarea-field"  
//                                 placeholder={t('details') || "Enter policy guidelines and eligibility criteria..."} 
//                                 rows="3"
//                                 value={descEn}
//                                 onChange={(e) => setDescEn(e.target.value)}
//                             ></textarea>
//                         </div>
//                                      <div className="form-footer-actions">
//                         <button onClick={handleClose} className="premium-btn-cancel" type="button">
//                             Cancel
//                         </button>
//                         <button className="premium-btn-submit" type="submit">
//                             <i className="bi bi-check2"></i> Submit
//                         </button>
//                     </div>
//         </div>
//     )
// }