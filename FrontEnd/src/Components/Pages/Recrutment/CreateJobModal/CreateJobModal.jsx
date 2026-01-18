import React, { useState, useEffect } from 'react';
import './CreateJobModal.css';

const CreateJobModal = ({ isOpen, onClose, onSave, editingJob, departmentOptions }) => {
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        salary: '',
        description: ''
    });

    useEffect(() => {
        if (editingJob) {
            setFormData({
                title: editingJob.title,
                department: editingJob.department,
                salary: editingJob.salary,
                description: editingJob.description
            });
        } else {
            setFormData({
                title: '',
                department: '',
                salary: '',
                description: ''
            });
        }
    }, [editingJob, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingJob ? 'Edit Job' : 'Create New Job'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Job Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Senior Backend Engineer"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departmentOptions.map(opt => (
                                        <option key={opt.value} value={opt.label || opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Salary Range</label>
                                <input
                                    type="text"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. $120k - $150k"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Job Description</label>
                            <div className="editor-container">
                                <div className="editor-toolbar">
                                    <button type="button" className="editor-btn"><span className="material-symbols-outlined">format_bold</span></button>
                                    <button type="button" className="editor-btn"><span className="material-symbols-outlined">format_italic</span></button>
                                    <button type="button" className="editor-btn"><span className="material-symbols-outlined">format_list_bulleted</span></button>
                                    <button type="button" className="editor-btn"><span className="material-symbols-outlined">format_list_numbered</span></button>
                                    <button type="button" className="editor-btn"><span className="material-symbols-outlined">link</span></button>
                                </div>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the responsibilities and requirements..."
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-post">
                            {editingJob ? 'Update Job' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJobModal;
