import React, { useEffect, useState } from 'react';
import './Tabs.css';
import { Link } from 'react-router-dom';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
//     const [label1,setLabel]=useState('/recruitment')
//    useEffect(()=>{ if(tabs.label==='Interview Happening')
//     {setLabel('/recruitment')
//     }
//     else if(tabs.label==='To Schedule Interview'){
//         setLabel('/ToScheduleInterview')
//     }else{
//        setLabel('/recruitment') 
//     }},[])

    return (
        <div className="tabs-container">
            <div className="tabs-wrapper">
                {tabs.map((tab) => (
                    <Link
                        to={tab.id==='make-offer'?'/':tab.id}
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label} ({tab.count})
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Tabs;
