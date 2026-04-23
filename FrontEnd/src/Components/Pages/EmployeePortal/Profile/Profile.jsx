import React from "react";
import "./Profile.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";

const Profile = () => {
  return (
    <div className="profile-page">
      <h1 className="page-title">My Profile</h1>

      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="avatar"></div>
          <h3>John Doe</h3>
          <p className="role">Senior Frontend Developer</p>
          <p className="department">Engineering Department</p>

          <button className="primary-btn">Switch Model</button>
          <button className="secondary-btn">Logout</button>
        </div>
        <div className="info-card">
          <h2>Personal & Job Information</h2>

          <div className="info-grid">
            <div>
              <label>Name</label>
              <p>John Doe</p>
            </div>

            <div>
              <label>Date of Birth</label>
              <p>1990-05-15</p>
            </div>

            <div>
              <label>Marital Status</label>
              <p>Single</p>
            </div>

            <div>
              <label>Phone Number</label>
              <p>+1123-456-7890</p>
            </div>

            <div>
              <label>Personal Email</label>
              <p>john.doe@email.com</p>
            </div>

            <div>
              <label>Address</label>
              <p>123 Main St, Anytown, USA</p>
            </div>

            <div>
              <label>Department</label>
              <p>Engineering</p>
            </div>

            <div>
              <label>Job Title</label>
              <p>Senior Frontend Developer</p>
            </div>

            <div>
              <label>City</label>
              <p>Anytown</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
