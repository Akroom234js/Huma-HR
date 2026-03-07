import React, { useState } from 'react';
import './AddEmployeeModal.css';

const AddEmployeeModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        // Account
        email: '',
        password: '',
        // Personal
        fullName: '',
        idNumber: '',
        phone: '',
        dob: '',
        address: '',
        emergencyContact: '',
        // Employment
        employeeId: '',
        jobTitle: '',
        department: '',
        joiningDate: '',
        basicSalary: '',
        directManager: '',
        // Media
        profilePicture: null
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <div className="header-title">
                        <span>Employee Management / Add New Employee</span>
                        <h2>Add New Employee</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-scroll-area">
                        {/* Section 1: Personal Information */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <div className="section-text">
                                    <h3>Personal Information</h3>
                                    <p>Basic details and login credentials.</p>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input type="text" name="fullName" placeholder="e.g. John Doe" required onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>ID Number (National ID)</label>
                                    <input type="text" name="idNumber" placeholder="e.g. 1234567890" required onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" placeholder="john.doe@company.com" required onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Password</label>
                                    <input type="password" name="password" placeholder="Huma@2024!" required onChange={handleChange} />
                                </div>
                                <div className="input-group full-width">
                                    <label>Address</label>
                                    <input type="text" name="address" placeholder="Street address, City, State, Zip" onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <input type="tel" name="phone" placeholder="+1 234 567 890" onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Date of Birth</label>
                                    <input type="date" name="dob" onChange={handleChange} />
                                </div>
                                <div className="input-group full-width">
                                    <label>Emergency Contact</label>
                                    <input type="text" name="emergencyContact" placeholder="Name - Phone Number" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Employment & Contract */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <span className="material-symbols-outlined">badge</span>
                                </div>
                                <div className="section-text">
                                    <h3>Employment & Contract</h3>
                                    <p>Role definition and organizational placement.</p>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Start Date</label>
                                    <input type="date" name="joiningDate" required onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Job Title</label>
                                    <input type="text" name="jobTitle" placeholder="e.g. Senior Product Designer" required onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Department</label>
                                    <select name="department" onChange={handleChange} required>
                                        <option value="">Select Department</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="HR">HR</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Direct Supervisor</label>
                                    <div className="input-with-icon">
                                        <span className="material-symbols-outlined">search</span>
                                        <input type="text" name="directManager" placeholder="Search Supervisor..." onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Employee ID</label>
                                    <input type="text" name="employeeId" placeholder="EMP-12345" required onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Basic Salary</label>
                                    <input type="number" name="basicSalary" placeholder="Enter amount" onChange={handleChange} />
                                </div>
                                <div className="input-group full-width">
                                    <label>Profile Picture</label>
                                    <input type="file" name="profilePicture" accept="image/*" onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save">
                            <span className="material-symbols-outlined">check_circle</span>
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;