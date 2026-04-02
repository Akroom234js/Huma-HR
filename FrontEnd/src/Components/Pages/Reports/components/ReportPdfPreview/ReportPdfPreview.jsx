import { useRef, useState, useEffect } from "react";
import "./ReportPdfPreview.css";
import html2pdf from "html2pdf.js";

/**
 * Generic Report PDF Preview component
 * 
 * @param {boolean} show - Whether the preview modal is shown
 * @param {function} onClose - Function to close the modal
 * @param {string} title - The report title (e.g., Performance Report)
 * @param {string} date - The date to display (defaults to today)
 * @param {string} summary - Brief summary of the report
 * @param {Array} kpis - Array of { label, value } for the top row
 * @param {Array} sections - Array of { title, content } for the main sections
 * @param {string} filename - The name of the downloaded PDF file
 */
const ReportPdfPreview = ({ 
  show, 
  onClose, 
  title = "HR Report", 
  date, 
  summary = "This report provides key human resources metrics and insights.",
  kpis = [],
  sections = [],
  filename = "HR_Report.pdf"
}) => {
  const a4Ref = useRef();
  const previewScrollRef = useRef();
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);

  const today = date || new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Calculate scaling for responsiveness
  useEffect(() => {
    if (!show) return;

    const updateScale = () => {
      if (!previewScrollRef.current) return;
      const containerWidth = previewScrollRef.current.clientWidth - 40; // 40px padding
      const a4Width = 794; // Fixed A4 pixel width at 96dpi

      if (containerWidth < a4Width) {
        setScale(containerWidth / a4Width);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [show]);

  const handleDownload = () => {
    setLoading(true);
    const el = a4Ref.current;
    
    // Create a temporary clone for PDF generation to ensure perfect A4 sizing
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(el)
      .save()
      .then(() => setLoading(false))
      .catch(err => {
        console.error("PDF generation error:", err);
        setLoading(false);
      });
  };

  if (!show) return null;

  return (
    <div className="report-pdf-overlay">
      {/* ── Top Action Bar ── */}
      <div className="report-pdf-topbar">
        <div className="topbar-left">
          <button className="topbar-btn close-btn" onClick={onClose} title="Back">
            <i className="bi bi-chevron-left" /> Back to Dashboard
          </button>
        </div>
        <div className="topbar-center">
            <i className="bi bi-file-earmark-pdf" style={{marginRight: '8px', color: '#60a5fa'}} />
            {title} Preview
        </div>
        <div className="topbar-right">
          <button className="topbar-btn print-btn" onClick={() => window.print()}>
            <i className="bi bi-printer" /> Print
          </button>
          <button
            className="topbar-btn download-btn"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="bi bi-hourglass-split spin" /> Generating…
              </>
            ) : (
              <>
                <i className="bi bi-cloud-download" /> Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Scroll Area for Preview ── */}
      <div className="report-pdf-scroll" ref={previewScrollRef}>
        <div 
            className="report-pdf-wrapper" 
            style={{ 
                transform: `scale(${scale})`, 
                transformOrigin: 'top center',
                marginBottom: `${(scale - 1) * 1123}px` // Adjust for scale offset
            }}
        >
          <div className="report-a4" ref={a4Ref}>
            {/* ── Report Header ── */}
            <div className="report-header-inner">
               <div className="logo-section">
                  <div className="report-logo">
                    <i className="bi bi-building" />
                  </div>
                  <div className="report-titles">
                    <h1 className="report-main-title">{title}</h1>
                    <p className="report-subtitle">HR Management Dashboard</p>
                  </div>
               </div>
               <div className="date-section">
                  <span className="date-label">REPORT DATE</span>
                  <p className="date-value">{today}</p>
               </div>
            </div>

            <div className="report-header-gradient" />

            {/* ── Summary ── */}
            <div className="report-summary-box">
              <h2 className="report-section-header">
                  <i className="bi bi-info-circle-fill" /> OVERVIEW
              </h2>
              <p className="report-summary-content">{summary}</p>
            </div>

            {/* ── KPI Grid ── */}
            {kpis.length > 0 && (
                <div className="report-kpi-grid">
                  {kpis.map((kpi, idx) => (
                    <div className="report-kpi-item" key={idx}>
                      <span className="kpi-label">{kpi.label}</span>
                      <p className="kpi-value">{kpi.value}</p>
                    </div>
                  ))}
                </div>
            )}

            {/* ── Dynamic Sections ── */}
            <div className="report-sections-container">
                {sections.map((section, index) => (
                    <div className="report-section" key={index} style={{ pageBreakInside: 'avoid' }}>
                        {section.title && <h3 className="section-title">{section.title}</h3>}
                        <div className="section-content">
                            {section.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Footer ── */}
            <div className="report-footer-inner">
              <div className="footer-copyright">© {new Date().getFullYear()} Acme Corp. All rights reserved.</div>
              <div className="footer-tags">
                <span className="tag">CONFIDENTIAL</span>
                <span className="tag">INTERNAL USE ONLY</span>
              </div>
              <div className="footer-page">Page 1 of 1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPdfPreview;
