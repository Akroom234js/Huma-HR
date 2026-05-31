import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Home.css";
import Footer from "./Footer";
import logo from "../../../assets/logo.png";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import ApplyModal from "../Recrutment/ApplyModal/ApplyModal";
import { getJobPostings } from "../../../services/atsService";
import { useTranslation } from "react-i18next";
import LanSw from "../../LanSw";
import Avatar from "../../Shared/Avatar/Avatar";

export default function Jops() {
  const { t, i18n } = useTranslation("Home/Jops");
  const isRtl = i18n.language === "ar";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemo(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const getGoToWebsitePath = () => {
    if (!user) return "/";
    if (user.role === "hr") return "/dashboard/general";
    if (user.role === "employee" || user.role === "department supervisor")
      return "/portal/dashboard";
    return "/";
  };

  const handleGoToWebsite = (e) => {
    if (!user) {
      e.preventDefault();
      window.location.href = "/";
    }
  };

  // ── Fetch published / open job postings (Public — no auth) ──
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getJobPostings({ status: "open" });
        const data = res.data?.data ?? res.data ?? [];
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.department?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsApplyOpen(true);
  };

  const formatSalary = (job) => {
    if (!job.salary_min && !job.salary_max) return null;
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k – $${(
        job.salary_max / 1000
      ).toFixed(0)}k`;
    }
    return `$${((job.salary_min || job.salary_max) / 1000).toFixed(0)}k`;
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return t("time.today");
    if (days === 1) return t("time.oneDay");
    if (days < 30) return t("time.days", { count: days });
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? t("time.oneWeek") : t("time.weeks", { count: weeks });
  };

  return (
    <>
      <div className={`container1 ${isRtl ? "rtl" : "ltr"}`}>
        <div className="navbar">
          <div className="logo-con">
            <Link to="/">
              <img src={logo} alt="Huma HR Logo" className="sidebar-logo" />
              <h1 className="sidebar-title">
                <span className="brand-h">H</span>
                <span className="brand-uma">uma</span>
              </h1>
            </Link>
          </div>
          <div className="other-option-con">
            <button
              className="hamburger-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i
                className={`fa-solid ${
                  isMobileMenuOpen ? "fa-xmark" : "fa-bars"
                }`}
              ></i>
            </button>
            <div className={`nav-links ${isMobileMenuOpen ? "open" : ""}`}>
              <div className="nav-item-wrapper">
                <NavLink to="/" end>
                  {t("nav.home")}
                </NavLink>
              </div>
              <div className="nav-item-wrapper">
                <NavLink to="/jops">{t("nav.jobs")}</NavLink>
              </div>
              <div className="nav-item-wrapper">
                <NavLink to={getGoToWebsitePath()} onClick={handleGoToWebsite}>
                  {t("nav.goToWebsite")}
                </NavLink>
                {showDemo && (
                  <div className="tour-cloud bottom">
                    <span className="material-icons">directions</span>
                    <p>{t("nav.demoTooltip")}</p>
                  </div>
                )}
              </div>
              <div className="nav-item-wrapper">
                <LanSw />
              </div>
              <ThemeToggle />
              <div className="nav-profile">
                {user && <Avatar user={user} size="sm" />}
              </div>
            </div>
          </div>
        </div>
        <div className="intro-box">
          <span className="intro">{t("hero.badge")}</span>
          <h2 className="title">{t("hero.title")}</h2>
          <p className="description">{t("hero.description")}</p>
        </div>
      </div>

      <div className={`main-content-sections ${isRtl ? "rtl" : "ltr"}`}>
        <div className="container2">
          <div className="poop_jops">
            <div className="con_up">
              <div>
                <h2>{t("positions.title")}</h2>
                <p>{t("positions.subtitle")}</p>
              </div>
              <div className="search-box-modern">
                <span className="material-icons">search</span>
                <input
                  placeholder={t("positions.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="container_carts">
              {/* Loading skeleton */}
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="cart1 cart1--skeleton">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-sm" />
                  </div>
                ))}

              {/* Real job cards */}
              {!loading &&
                filteredJobs.map((job) => (
                  <div className="cart1" key={job.id}>
                    <div className="gg">
                      <div className="firstline">
                        <span className="prod">
                          {job.department?.name ||
                            job.experience_level ||
                            "General"}
                        </span>
                        <span className="time">
                          {timeAgo(job.posted_at || job.created_at)}
                        </span>
                      </div>
                      <h4>{job.title}</h4>
                      <p>
                        {job.description?.length > 120
                          ? job.description.slice(0, 120) + "…"
                          : job.description}
                      </p>
                      <div className="con-salary">
                        <span style={{ color: "var(--text-main)" }}>Huma</span>
                        <span>
                          {formatSalary(job) || job.employment_type || ""}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleApplyClick(job)}>
                      {t("positions.applyBtn")}
                    </button>
                  </div>
                ))}

              {/* Empty state */}
              {!loading && filteredJobs.length === 0 && (
                <div className="jops-empty-state">
                  <span className="material-symbols-outlined">work_off</span>
                  <p>
                    {search
                      ? t("positions.noMatch")
                      : t("positions.noJobs")}
                  </p>
                </div>
              )}

              {!loading && filteredJobs.length > 0 && (
                <button
                  className="ptn-more"
                  onClick={() =>
                    window.scrollTo({ top: 9999, behavior: "smooth" })
                  }
                >
                  {t("positions.showMore")}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container41">
          <h4>
            <h3>{t("howToApply.title")}</h3>
          </h4>
          <div className="con_cart2">
            <div>
              <span>1</span>
              <h3>{t("howToApply.step1Title")}</h3>
              <p>{t("howToApply.step1Desc")}</p>
            </div>
            <div>
              <span>2</span>
              <h3>{t("howToApply.step2Title")}</h3>
              <p>{t("howToApply.step2Desc")}</p>
            </div>
            <div>
              <span>3</span>
              <h3>{t("howToApply.step3Title")}</h3>
              <p>{t("howToApply.step3Desc")}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Apply Modal — connected to POST /api/job-postings/{id}/apply */}
      <ApplyModal
        isOpen={isApplyOpen}
        job={selectedJob}
        onClose={() => {
          setIsApplyOpen(false);
          setSelectedJob(null);
        }}
      />
    </>
  );
}
