import React from 'react';
import './ExportModal.css';

const ExportModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Export Report</h3>
                    <button className="close-icon" onClick={onClose}>&times;</button>
                </div>
                <div className="export-options">
                    <button className="export-btn pdf">
                        <i className="bi bi-file-earmark-pdf"></i>
                        <span>Export as PDF</span>
                    </button>
                    <button className="export-btn excel">
                        <i className="bi bi-file-earmark-excel"></i>
                        <span>Export as Excel</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
