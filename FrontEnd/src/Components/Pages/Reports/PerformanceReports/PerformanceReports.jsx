import React from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import './PerformanceReports.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { useTranslation } from 'react-i18next';
const PerformanceReports = () => {
  const { t } = useTranslation("Reports/PerformanceReports")
  const data = [
    { range: "1.0-2.0", value: 4 },
    { range: "2.0-3.0", value: 12 },
    { range: "3.0-4.0", value: 95 },
    { range: "4.0-5.0", value: 48 },
  ].map(item => ({
    ...item,
    bg: item.value + 10
  }));
  const colors = ["#ff6b6b", "#f7b500", "#4a90e2", "#2ecc71"];
  const colorsa = ["rgba(255, 107, 107, 0.37)", "rgba(247, 181, 0, 0.37)", "rgba(74, 145, 226, 0.37)", "rgba(46, 204, 112, 0.37)"];

  return (
    <div className="reports-page">
      <PageHeader title={t("PerformanceReports")} Explanation={t("Detailed")} />
      <ReportsNavbar />
      <div className='leave-reports-co'>
        <div className='leave-reports'>
          <h5>{t("performance")}</h5>
          <div className='daily-attendance'>
            <p><i className='bi bi-star-fill blue'></i>   {t("Average")}</p>
            <p>4.2 <span className='score'>/5.0</span></p>
          </div>
          <div className='daily-attendance'>
            <p><i className='bi bi-check-circle-fill green'></i>   {t("rate")}</p>
            <p >94%</p>
          </div>
          <div className='daily-attendance'>
            <p><i className='bi bi-mortarboard blue'></i>   {t("Employees")}</p>
            <p>28</p>
          </div>
          <div className='daily-attendance daily-attendance-border'>
            <p><i className='bi bi-exclamation-triangle-fill red'></i>   {t("pips")}</p>
            <p className='red'>5</p>
          </div>


        </div>

        <div className='leave-reports'>
          <h5>{t("Key")}</h5>
          <div className='daily-attendance'>
            <p>  {t("achievement")}</p>
            <p>88%</p>
          </div>
          <div className='daily-attendance'>
            <p>   {t("competency")}</p>
            <p >3.9</p>
          </div>
          <div className='daily-attendance'>
            <p>   {t("High")} ({t("Top")} 10%)</p>
            <p className='green'>14 {t("Employee")}</p>
          </div>
          <div className='daily-attendance daily-attendance-border'>
            <p>   {t("low")} ({t("Bottom")} 5%)</p>
            <p className='red'>7 {t("Employee")}</p>
          </div>


        </div>


        {/* ========= */}
        <div className='leave-reports leave-reports-table-inf'>
          <h5>{t("breakdown")}</h5>
          <div className='daily-attendance wi'>
            <p className='gray st'>  {t("department")}</p>
            <p className='gray'>  {t("AVG")}</p>
            <p className='gray en'>  {t("completed")}</p>

          </div>
          <div className='daily-attendance wi'>
            <p className='st'>  {t("Engineering")}</p>
            <p>4.5</p>
            <p className='green en'>98%</p>
          </div>
          <div className='daily-attendance wi'>
            <p className='st'>   {t("Marketing")}</p>
            <p >4.1</p>
            <p className='en'>90%</p>
          </div>
          <div className='daily-attendance wi'>
            <p className='st'>   {t("Product")} </p>
            <p >4.3</p>
            <p className='green en'>100%</p>
          </div>
          <div className='daily-attendance wi'>
            <p className='st'>   {t("Sales")} </p>
            <p >3.8</p>
            <p className='orangered en'>82%</p>
          </div>
          <div className='daily-attendance wi daily-attendance-border'>
            <p className='st'>   {t("Human")} </p>
            <p >4.2</p>
            <p className='red en'>100%</p>
          </div>


        </div>
        {/* //////// */}
        <div className='leave-reports leave-reports-card-inf'>
          <h5>{t("breakdown")}</h5>
          <div className='daily-attendance daily-attendance-card-co'>
            <div className='daily-attendance-fl' >
              <p className='gray '>  {t("department")}</p>
              <p >  {t("Engineering")}</p>
            </div>
            <div className='daily-attendance-fl' ><p className='gray'>  {t("AVG")}</p>    <p>4.5</p></div>
            <div className='daily-attendance-fl' >    <p className='gray '>  {t("completed")}</p>  <p className='green en'>98%</p></div>

          </div>
          <div className='daily-attendance daily-attendance-card-co'>

            <div className='daily-attendance-fl' >
              <p className='gray '>  {t("department")}</p>
              <p >  {t("Marketing")}</p>
            </div>
            <div className='daily-attendance-fl' ><p className='gray'>  {t("AVG")}</p>    <p>4.1</p></div>
            <div className='daily-attendance-fl' >    <p className='gray '>  {t("completed")}</p>  <p className='green en'>90%</p></div>
          </div>
          <div className='daily-attendance daily-attendance-card-co'>

            <div className='daily-attendance-fl' >
              <p className='gray '>  {t("department")}</p>
              <p >  {t("Product")}</p>
            </div>
            <div className='daily-attendance-fl' ><p className='gray'>  {t("AVG")}</p>    <p>4.3</p></div>
            <div className='daily-attendance-fl' >    <p className='gray '>  {t("completed")}</p>  <p className='green en'>100%</p></div>

          </div>
          <div className='daily-attendance daily-attendance-card-co'>
            <div className='daily-attendance-fl' >
              <p className='gray '>  {t("department")}</p>
              <p >  {t("Sales")}</p>
            </div>
            <div className='daily-attendance-fl' ><p className='gray'>  {t("AVG")}</p>    <p>3.8</p></div>
            <div className='daily-attendance-fl' >    <p className='gray '>  {t("completed")}</p>       <p className='orangered '>82%</p></div>



          </div>
          <div className='daily-attendance daily-attendance-card-co daily-attendance-border'>
            <div className='daily-attendance-fl' >
              <p className='gray '>  {t("department")}</p>
              <p >  {t("Human")}</p>
            </div>
            <div className='daily-attendance-fl' ><p className='gray'>  {t("AVG")}</p>    <p>34.2</p></div>
            <div className='daily-attendance-fl' >    <p className='gray '>  {t("completed")}</p>       <p className='red '>100%</p></div>
          </div>


        </div>
        {/* ///////////// */}
        {/* ---------- */}
        <div className='leave-reports'>
          <h5>{t("distribution")}</h5>
          <div style={{ width: "100%", height: 250 }} className="char-mar">
            <ResponsiveContainer>
              <BarChart data={data} barGap={-90}>
                <XAxis
                  dataKey="range"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: "gray" }}
                />


                <Tooltip
                  cursor={{ fill: "transparent" }}

                  formatter={(value, name) =>
                    name === "bg" ? null : [value, "القيمة"]
                  }
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    color: "#000"

                  }}
                />
          
                <Bar dataKey="bg" barSize={90} radius={[12, 12, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`bg-${index}`}
                      fill={colorsa[index % colors.length]}
                    />
                  ))}
                </Bar>

                {/* الأمام */}
                <Bar
                  dataKey="value"
                  barSize={90}

                  radius={[12, 12, 0, 0]}
                  label={{
                    position: "top",
                    offset: 30,
                    fill: "var(--text-main)",
                    fontSize: 14,

                  }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`value-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReports;
