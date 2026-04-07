import { useRef, useState, useEffect } from "react";
import "./ReportPdfPreview.css";
import html2pdf from "html2pdf.js";

/**
 * Generic Report PDF Preview component
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

  useEffect(() => {
    if (!show) return;

    const updateScale = () => {
      if (!previewScrollRef.current) return;
      const containerWidth = previewScrollRef.current.clientWidth - 40;
      const a4Width = 794;

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
      {/* ── Top Action Bar (Updated for Mobile) ── */}
      <div className="report-pdf-topbar">
        <div className="topbar-left">
          <button className="topbar-btn close-btn" onClick={onClose} title="Back">
            <i className="bi bi-chevron-left" />
            <span className="btn-text">Back</span>
          </button>
        </div>

        <div className="topbar-center">
          <i className="bi bi-file-earmark-pdf" />
          <span className="topbar-title">{title}</span>
        </div>

        <div className="topbar-right">
          <button className="topbar-btn print-btn" onClick={() => window.print()} title="Print">
            <i className="bi bi-printer" />
            <span className="btn-text">Print</span>
          </button>
          <button
            className="topbar-btn download-btn"
            onClick={handleDownload}
            disabled={loading}
            title="Download PDF"
          >
            {loading ? (
              <i className="bi bi-hourglass-split spin" />
            ) : (
              <>
                <i className="bi bi-cloud-download" />
                <span className="btn-text">Download</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="report-pdf-scroll" ref={previewScrollRef}>
        <div
          className="report-pdf-wrapper"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            marginBottom: `${(scale - 1) * 1123}px`
          }}
        >
          <div className="report-a4" ref={a4Ref}>
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

            <div className="report-summary-box">
              <h2 className="report-section-header">
                <i className="bi bi-info-circle-fill" /> OVERVIEW
              </h2>
              <p className="report-summary-content">{summary}</p>
            </div>

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