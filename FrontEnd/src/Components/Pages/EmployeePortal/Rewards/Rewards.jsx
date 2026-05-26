import React from "react";
import "./Rewards.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";

export default function RewardsBonuses() {
  return (
    <div className="rewards-page">
      <h1 className="page-title">Rewards & Bonuses</h1>

      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="rewards-grid">
        <div className="row-flex">
          <div className="card rewards-total-card">
            <div className="rewards-total-content">
              <div className="reward-icon">💵</div>
              <div>
                <p>Total Rewards/Bonuses (2024)</p>
                <h2>$8,500.00</h2>
              </div>
            </div>
          </div>

          <div className="card recognition-card">
            <h2>Recent Recognition</h2>

            <div className="recognition-box">
              <img
                src="https://i.pravatar.cc/100"
                alt="employee"
                className="recognition-avatar"
              />

              <div>
                <p>
                  "Alex has been a rockstar this quarter, consistently going
                  above and beyond on the Alpha project. His positive attitude
                  and problem-solving skills are a huge asset to the team!"
                </p>

                <span>- Jane Smith (Manager)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card rewards-history-card">
          <h2>Rewards & Bonuses History</h2>

          <div className="table-wrapper">
            <table className="rewards-table">
              <thead>
                <tr>
                  <th>DATE RECEIVED</th>
                  <th>REWARD/BONUS TYPE</th>
                  <th>AMOUNT/VALUE</th>
                  <th>REASON/DESCRIPTION</th>
                  <th>AWARDED BY</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>July 15, 2024</td>
                  <td>Performance Bonus</td>
                  <td className="green">$2,500.00</td>
                  <td>Exceeding Q2 project goals</td>
                  <td>Jane Smith</td>
                </tr>

                <tr>
                  <td>April 1, 2024</td>
                  <td>Recognition Award</td>
                  <td className="green">$500.00</td>
                  <td>Peer-voted Employee of the Month</td>
                  <td>Peer Recognition Program</td>
                </tr>

                <tr>
                  <td>January 5, 2024</td>
                  <td>Annual Bonus</td>
                  <td className="green">$5,500.00</td>
                  <td>Based on 2023 company performance</td>
                  <td>Management</td>
                </tr>

                <tr>
                  <td>October 20, 2023</td>
                  <td>Spot Bonus</td>
                  <td className="green">$250.00</td>
                  <td>Exceptional handling of a client issue</td>
                  <td>Jane Smith</td>
                </tr>

                <tr>
                  <td>July 14, 2023</td>
                  <td>Performance Bonus</td>
                  <td className="green">$2,000.00</td>
                  <td>Strong performance in Q2 2023</td>
                  <td>Jane Smith</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy */}
        <div className="card policy-card">
          <h2>📋 Policy Information</h2>

          <p>
            Our rewards and bonus program is designed to recognize the hard work
            and dedication of our employees. For detailed information on
            eligibility and criteria, please refer to the official
            <span className="policy-link">
              {" "}
              Company Rewards Policy document.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
