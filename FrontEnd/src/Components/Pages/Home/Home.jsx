import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Home.css";
import Footer from "./Footer";
import logo from "../../../assets/logo.png";
import dashboardMockup from "../../../assets/hr_dashboard_mockup.png";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import apiClient from "../../../apiConfig";
import Notification from "../../Notification/Notification";
import Avatar from "../../Shared/Avatar/Avatar";
import { useTranslation } from "react-i18next";
import LanSw from "../../LanSw";

function CountUp({
  from = 0,
  to = 100,
  separator = ",",
  duration = 2, // in seconds
  className = "count-up-text",
  delay = 0,
}) {
  const [count, setCount] = useState(from);
  const startTimeRef = useRef(null);
  const isStarted = useRef(false);

  useEffect(() => {
    let animationFrameId;

    const startAnimation = () => {
      const step = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const progress = Math.min((timestamp - startTimeRef.current) / (duration * 1000), 1);
        
        // Easing: easeOutQuad
        const easeProgress = progress * (2 - progress);
        
        const currentValue = from + (to - from) * easeProgress;
        setCount(currentValue);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setCount(to);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    const timer = setTimeout(() => {
      if (!isStarted.current) {
        isStarted.current = true;
        startAnimation();
      }
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [from, to, duration, delay]);

  const formatNumber = (num) => {
    const rounded = Math.round(num);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  return <span className={className}>{formatNumber(count)}</span>;
}

export default function Home() {
  const { t, i18n } = useTranslation('Home/Home');
  const isRtl = i18n.language === "ar";

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const [bubbles, setBubbles] = useState([]);
  useEffect(() => {
    const bubbleArray = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      size: Math.random() * 25 + 8,
      left: Math.random() * 100,
      delay: Math.random() * 25,
      duration: Math.random() * 20 + 25,
      drift: Math.random() * 60 - 30,
    }));
    setBubbles(bubbleArray);
  }, []);

  const [animatePillars, setAnimatePillars] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimatePillars(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const [step, setStep] = useState("login"); // login, forgot, verify, reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const loginBtnRef = useRef(null);

  useEffect(() => {
    if (step === "login") {
      emailInputRef.current?.focus();
    }
  }, [step]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null); // { message, type }
  const [showDemo, setShowDemo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemo(false);
    }, 6000); // يظهر لمدة 6 ثوانٍ ثم يختفي
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const userStr = localStorage.getItem('user');
      setUser(userStr ? JSON.parse(userStr) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    // Listen to standard storage events as well as custom window events triggered in the same window
    window.addEventListener('local-storage-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-update', handleStorageChange);
    };
  }, []);

  const getGoToWebsitePath = () => {
    if (!user) return "/";
    if (user.role === "hr") return "/dashboard/general";
    if (user.role === "employee" || user.role === "department supervisor") return "/portal/dashboard";
    return "/";
  };

  const handleGoToWebsite = (e) => {
    if (!user) {
      e.preventDefault();
      showNotification(t("notifications.pleaseLogin"), "warning");
      const loginSection = document.querySelector(".poop2");
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/sessions', {
        email,
        password
      });

      const { data } = response.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showNotification(t("notifications.loginSuccess"), "success");
      setTimeout(() => {
        if (data.user.role === "hr") {
          navigate("/dashboard/general");
        } else if (data.user.role === "employee" || data.user.role === "department supervisor") {
          navigate("/portal/dashboard");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        setErrors(err.response.data.errors || { message: err.response.data.message });
        if (err.response.data.message && !err.response.data.errors) {
          showNotification(err.response.data.message, "error");
        }
      } else {
        showNotification("Failed to connect to server.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!email) {
      showNotification("Please enter your email", "warning");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/password/forgot', { email });
      showNotification(t("notifications.forgotSuccess"), "success");
      setStep("verify");
    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.response) {
        setErrors(err.response.data.errors || { message: err.response.data.message });
        showNotification(err.response.data.message || "Failed to send reset code.", "error");
      } else {
        showNotification("Failed to connect to server.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      showNotification("Please enter the verification code", "warning");
      return;
    }
    setStep("reset");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    if (newPassword !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      await apiClient.put('/auth/password/reset', {
        email,
        code: verificationCode,
        password: newPassword,
        password_confirmation: confirmPassword
      });

      showNotification(t("notifications.resetSuccess"), "success");
      setStep("login");
      setNewPassword("");
      setConfirmPassword("");
      setVerificationCode("");
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response) {
        setErrors(err.response.data.errors || { message: err.response.data.message });
        showNotification(err.response.data.message || "Reset failed.", "error");
      } else {
        showNotification("Failed to connect to server.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="loader-content">
            <div className="loader-spinner"></div>
            <p>Processing, please wait...</p>
          </div>
        </div>
      )}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
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
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
            <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
              <div className="nav-item-wrapper">
                <NavLink to="/" end>{t("nav.home")}</NavLink>
              </div>
              <div className="nav-item-wrapper">
                <NavLink to="/jops">{t("nav.jobs")}</NavLink>
              </div>

              <div className="nav-item-wrapper">
                <NavLink to={getGoToWebsitePath()} onClick={handleGoToWebsite}>{t("nav.goToWebsite")}</NavLink>
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
          <span className="intro animate-fade-in-up delay-100">{t("intro.badge")}</span>
          <h2 className="title animate-fade-in-up delay-200">{t("intro.title")}</h2>
          <p className="description animate-fade-in-up delay-300">{t("intro.description")}</p>
        </div>
        <div className="wave-container">
          <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
            </defs>
            <g className="parallax">
              <use xlinkHref="#gentle-wave" x="48" y="0" className="wave-use1" />
              <use xlinkHref="#gentle-wave" x="48" y="3" className="wave-use2" />
              <use xlinkHref="#gentle-wave" x="48" y="5" className="wave-use3" />
              <use xlinkHref="#gentle-wave" x="48" y="7" className="wave-use4" />
            </g>
          </svg>
        </div>
        <div className="bubbles-container">
          {bubbles.map((b) => (
            <div
              key={b.id}
              className="bubble"
              style={{
                width: `${b.size}px`,
                height: `${b.size}px`,
                left: `${b.left}%`,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.duration}s`,
                "--bubble-drift": `${b.drift}px`,
              }}
            />
          ))}
        </div>
      </div >
      <div className={`main-content-sections ${isRtl ? "rtl" : "ltr"}`}>
        <div className="container2">
        <div className="poop1">
          <span style={{ color: "var(--primary-color)" }}>.</span>
          <div className="poop2">
            <div className="left-side">
              <span className="icon1">
                <i className="material-icons">badge</i>
              </span>
              <h2>{t("portal.title")}</h2>
              <p>{t("portal.description")}</p>
              <hr />
              <div className="icon_bottom">
                <span className="material-icons text-sm">verified_user</span>
                <p>{t("portal.security")}</p>
              </div>
            </div>

            <div className="right-side">
              <div className={`forms-slider show-${step}`}>
                {/* 1. Login Form */}
                <div className="form-content login-section">
                  <h3>{t("login.title")}</h3>
                  <p>{t("login.subtitle")}</p>
                  <div className="con-input">
                    <label>{t("login.emailLabel")}</label>
                    <input
                      ref={emailInputRef}
                      type="text"
                      placeholder={t("login.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          passwordInputRef.current?.focus();
                        }
                      }}
                    />
                    {errors.email && <span className="error-text">{errors.email[0]}</span>}

                    <label>{t("login.passwordLabel")}</label>
                    <input
                      ref={passwordInputRef}
                      type="password"
                      placeholder={t("login.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          loginBtnRef.current?.focus();
                        }
                      }}
                    />
                    {errors.password && <span className="error-text">{errors.password[0]}</span>}

                    <div className="con-forgetcheck">
                      <span>
                        <input type="checkbox" />
                        <label>{t("login.rememberMe")}</label>
                      </span>
                      <Link onClick={() => setStep("forgot")}>{t("login.forgetPassword")}</Link>
                    </div>
                    <div className="login-button-wrapper">
                      <button
                        ref={loginBtnRef}
                        className="ptn-login"
                        onClick={handleLogin}
                        disabled={loading}
                      >
                        {loading ? t("login.processing") : t("login.signInBtn")}
                      </button>
                    </div>

                  </div>
                </div>

                {/* 2. Forgot Password Form */}
                <div className="form-content forgot-section">
                  <h3>{t("forgot.title")}</h3>
                  <p>{t("forgot.subtitle")}</p>
                  <div className="con-input">
                    <label>{t("forgot.emailLabel")}</label>
                    <input
                      type="email"
                      placeholder={t("forgot.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <span className="error-text">{errors.email[0]}</span>}
                    <button className="ptn-login" onClick={handleForgotPassword} disabled={loading}>
                      {loading ? t("login.processing") : t("forgot.sendBtn")}
                    </button>

                    <button className="ptn-back-to-login" onClick={() => setStep("login")}>
                      <i className="fa-solid fa-arrow-left"></i> {t("forgot.backToLogin")}
                    </button>
                  </div>
                </div>{/* 3. Verification Code Flow */}
                <div className="form-content verify-section">
                  <h3>{t("verify.title")}</h3>
                  <p>{t("verify.subtitle")}</p>
                  <div className="con-input">
                    <label>{t("verify.codeLabel")}</label>
                    <input
                      type="text"
                      placeholder={t("verify.codePlaceholder")}
                      maxLength="6"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    {errors.code && <span className="error-text">{errors.code[0]}</span>}
                    <button className="ptn-login" onClick={handleVerifyCode} disabled={loading}>
                      {t("verify.confirmBtn")}
                    </button>

                    <button className="ptn-back-to-login" onClick={() => setStep("forgot")}>
                      <i className="fa-solid fa-arrow-left"></i> {t("verify.back")}
                    </button>
                  </div>
                </div>

                {/* 4. Reset Password Form */}
                <div className="form-content reset-section">
                  <h3>{t("reset.title")}</h3>
                  <p>{t("reset.subtitle")}</p>
                  <div className="con-input">
                    <label>{t("reset.newPasswordLabel")}</label>
                    <input
                      type="password"
                      placeholder="********"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <label>{t("reset.confirmPasswordLabel")}</label>
                    <input
                      type="password"
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {errors.password && <span className="error-text">{errors.password[0]}</span>}
                    <button className="ptn-login" onClick={handleResetPassword} disabled={loading}>
                      {loading ? t("login.processing") : t("reset.saveBtn")}
                    </button>

                    <button className="ptn-back-to-login" onClick={() => setStep("verify")}>
                      <i className="fa-solid fa-arrow-left"></i> {t("verify.back")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`container3 ${isRtl ? "rtl" : "ltr"}`}>
        <div className="con-tit">
          <h3>{t("whyChoose.title")}</h3>
          <p>{t("whyChoose.subtitle")}</p>
        </div>
        <div className="con_cart">
          <div onMouseMove={handleMouseMove}>
            <span style={{ backgroundColor: "rgba(19, 131, 237, 0.1)" }}>
              <i className="material-icons" style={{ color: "#1383ed" }}>analytics</i>
            </span>
            <h3>{t("whyChoose.analyticsTitle")}</h3>
            <p>{t("whyChoose.analyticsDesc")}</p>
          </div>
          <div onMouseMove={handleMouseMove}>
            <span style={{ backgroundColor: "rgba(19, 131, 237, 0.1)" }}>
              <i className="material-icons" style={{ color: "#1383ed" }}>hub</i>
            </span>
            <h3>{t("whyChoose.integrationTitle")}</h3>
            <p>{t("whyChoose.integrationDesc")}</p>
          </div>
          <div onMouseMove={handleMouseMove}>
            <span style={{ backgroundColor: "rgba(19, 131, 237, 0.1)" }}>
              <i className="material-icons" style={{ color: "#1383ed" }}>security</i>
            </span>
            <h3>{t("whyChoose.securityTitle")}</h3>
            <p>{t("whyChoose.securityDesc")}</p>
          </div>
          <div onMouseMove={handleMouseMove}>
            <span style={{ backgroundColor: "rgba(19, 131, 237, 0.1)" }}>
              <i className="material-icons" style={{ color: "#1383ed" }}>schedule</i>
            </span>
            <h3>{t("whyChoose.timeTitle")}</h3>
            <p>{t("whyChoose.timeDesc")}</p>
          </div>
          <div onMouseMove={handleMouseMove}>
            <span style={{ backgroundColor: "rgba(19, 131, 237, 0.1)" }}>
              <i className="material-icons" style={{ color: "#1383ed" }}>groups</i>
            </span>
            <h3>{t("whyChoose.teamTitle")}</h3>
            <p>{t("whyChoose.teamDesc")}</p>
          </div>
          <div onMouseMove={handleMouseMove}>
            <span style={{ backgroundColor: "rgba(19, 131, 237, 0.1)" }}>
              <i className="material-icons" style={{ color: "#1383ed" }}>psychology</i>
            </span>
            <h3>{t("whyChoose.aiTitle")}</h3>
            <p>{t("whyChoose.aiDesc")}</p>
          </div>
        </div>
      </div>

      <div className={`performance-showcase-section ${isRtl ? "rtl" : "ltr"}`}>
        <div className="perf-container">
          <div className="con-tit animate-fade-in-up delay-200">
            <h3>{isRtl ? "إدارة الأداء الذكي بالذكاء الاصطناعي" : "Smart AI-Powered Performance Management"}</h3>
            <p>
              {isRtl 
                ? "نظام تقييم متكامل من 5 ركائز أساسية مع تحليلات ذكية وتوصيات تدريبية فورية لتطوير كفاءات موظفيك." 
                : "An integrated 5-pillar evaluation system with smart analytics and instant training recommendations to grow employee skills."
              }
            </p>
          </div>

          <div className="perf-stats-grid">
            <div className="perf-stat-card animate-fade-in-up delay-100">
              <span className="perf-stat-number">
                <CountUp from={0} to={98} duration={2.5} />%
              </span>
              <div className="perf-stat-label">{isRtl ? "دقة تحليل الكفاءة" : "Competency Accuracy"}</div>
              <div className="perf-stat-desc">{isRtl ? "يقوم الذكاء الاصطناعي بتحليل الأداء بدقة متناهية مقارنة بالتقييمات اليدوية" : "AI evaluates competencies with high precision compared to manual ratings."}</div>
            </div>

            <div className="perf-stat-card animate-fade-in-up delay-200">
              <span className="perf-stat-number">
                <CountUp from={0} to={5} duration={1.5} />
              </span>
              <div className="perf-stat-label">{isRtl ? "مؤشرات قياس مرجحة" : "Weighted Indicators"}</div>
              <div className="perf-stat-desc">{isRtl ? "توزيع نسبي ذكي للأوزان يغطي كافة جوانب أداء الموظف المهنية والسلوكية" : "Smart weight distribution covering all professional and behavioral aspects."}</div>
            </div>

            <div className="perf-stat-card animate-fade-in-up delay-300">
              <span className="perf-stat-number">
                <CountUp from={0} to={10000} separator="," duration={3} />+
              </span>
              <div className="perf-stat-label">{isRtl ? "عملية تقييم منجزة" : "Processed Evaluations"}</div>
              <div className="perf-stat-desc">{isRtl ? "تمت معالجتها واحتساب نتائجها في الخلفية تلقائياً وبسرعة فائقة" : "Successfully processed and snapshot calculations run in background."}</div>
            </div>

            <div className="perf-stat-card animate-fade-in-up delay-400">
              <span className="perf-stat-number">
                <CountUp from={0} to={3} duration={1.2} />s
              </span>
              <div className="perf-stat-label">{isRtl ? "توليد التوصيات الذكية" : "AI Recommendations"}</div>
              <div className="perf-stat-desc">{isRtl ? "متوسط سرعة استدعاء OpenAI لتقديم خطط تدريب مخصصة لسد فجوات الأداء" : "Average response time to generate personal training recommendations."}</div>
            </div>
          </div>

          <div className="perf-pillars-grid">
            <div className="perf-pillars-list animate-fade-in-up delay-200">
              <h4 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "1rem" }}>
                {isRtl ? "توزيع أوزان التقييم الشامل" : "Comprehensive Evaluation Weights"}
              </h4>
              
              <div className="perf-pillar-progress-wrapper">
                <div className="perf-pillar-info">
                  <span className="perf-pillar-name">
                    <i className="fa-solid fa-list-check"></i>
                    {isRtl ? "درجة المهام والمخرجات" : "Tasks & Output Score"}
                  </span>
                  <span className="perf-pillar-weight">40%</span>
                </div>
                <div className="perf-pillar-bar">
                  <div className="perf-pillar-fill" style={{ width: animatePillars ? "40%" : "0%" }}></div>
                </div>
              </div>

              <div className="perf-pillar-progress-wrapper">
                <div className="perf-pillar-info">
                  <span className="perf-pillar-name">
                    <i className="fa-solid fa-user-tie"></i>
                    {isRtl ? "درجة تقييم المدير المباشر" : "Direct Manager Score"}
                  </span>
                  <span className="perf-pillar-weight">25%</span>
                </div>
                <div className="perf-pillar-bar">
                  <div className="perf-pillar-fill" style={{ width: animatePillars ? "25%" : "0%" }}></div>
                </div>
              </div>

              <div className="perf-pillar-progress-wrapper">
                <div className="perf-pillar-info">
                  <span className="perf-pillar-name">
                    <i className="fa-solid fa-users"></i>
                    {isRtl ? "درجة تقييم الزملاء (360°)" : "Peer Feedback Score (360°)"}
                  </span>
                  <span className="perf-pillar-weight">15%</span>
                </div>
                <div className="perf-pillar-bar">
                  <div className="perf-pillar-fill" style={{ width: animatePillars ? "15%" : "0%" }}></div>
                </div>
              </div>

              <div className="perf-pillar-progress-wrapper">
                <div className="perf-pillar-info">
                  <span className="perf-pillar-name">
                    <i className="fa-solid fa-calendar-check"></i>
                    {isRtl ? "درجة الحضور والالتزام" : "Attendance & Compliance Score"}
                  </span>
                  <span className="perf-pillar-weight">10%</span>
                </div>
                <div className="perf-pillar-bar">
                  <div className="perf-pillar-fill" style={{ width: animatePillars ? "10%" : "0%" }}></div>
                </div>
              </div>

              <div className="perf-pillar-progress-wrapper">
                <div className="perf-pillar-info">
                  <span className="perf-pillar-name">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    {isRtl ? "درجة العمل الإضافي والانتاجية" : "Overtime & Extra Productivity"}
                  </span>
                  <span className="perf-pillar-weight">10%</span>
                </div>
                <div className="perf-pillar-bar">
                  <div className="perf-pillar-fill" style={{ width: animatePillars ? "10%" : "0%" }}></div>
                </div>
              </div>
            </div>

            <div className="perf-ai-card animate-fade-in-up delay-400">
              <span className="perf-ai-icon">
                <i className="fa-solid fa-robot"></i>
              </span>
              <h3>{isRtl ? "القرارات المؤتمتة بالذكاء الاصطناعي" : "Automated AI-Driven Decisions"}</h3>
              <p>
                {isRtl 
                  ? "يقوم محرك الذكاء الاصطناعي برصد وتحليل فجوات الأداء تلقائياً بعد كل دورة تقييم لتوليد التوصيات والقرارات التلقائية."
                  : "The AI engine tracks performance gaps and generates training suggestions, alerts, or performance-based decisions automatically."}
              </p>
              
              <div className="perf-ai-features">
                <div className="perf-ai-feature">
                  <i className="fa-solid fa-circle-check"></i>
                  <span><strong>{isRtl ? "ترقية ومكافأة تلقائية" : "Automatic Promotion & Bonus"}:</strong> {isRtl ? "للموظفين الحاصلين على درجة 90 فما فوق" : "For employees scoring 90 and above."}</span>
                </div>
                <div className="perf-ai-feature">
                  <i className="fa-solid fa-circle-check"></i>
                  <span><strong>{isRtl ? "توصية بمسار تدريب مخصص" : "Tailored Training Recommendations"}:</strong> {isRtl ? "لسد فجوات المهارات بناءً على درجات المدير والزملاء" : "To close skill gaps based on Manager and Peer scores."}</span>
                </div>
                <div className="perf-ai-feature">
                  <i className="fa-solid fa-circle-check"></i>
                  <span><strong>{isRtl ? "تنبيهات وتأديب تلقائي" : "Automatic Warnings & Snapshots"}:</strong> {isRtl ? "في حال انخفاض المعدل التراكمي عن 60% لحماية الجودة" : "To flag underperforming accounts and recommend warning letters."}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`container4 ${isRtl ? "rtl" : "ltr"}`}>
        <div className="con-tit">
          <h3>{t("process.title")}</h3>
        </div>
        <div className="con_cart2">
          <div>
            <span>1</span>
            <h3>{t("process.step1Title")}</h3>
            <p>{t("process.step1Desc")}</p>
          </div>
          <div>
            <span>2</span>
            <h3>{t("process.step2Title")}</h3>
            <p>{t("process.step2Desc")}</p>
          </div>
          <div>
            <span>3</span>
            <h3>{t("process.step3Title")}</h3>
            <p>{t("process.step3Desc")}</p>
          </div>
        </div>
        <div className="container5">
          <div>
            <h2>{t("workplace.title")}</h2>
            <p>{t("workplace.desc")}</p>
            <button>{t("workplace.learnMore")}</button>
          </div>
          <div>
            <img src={dashboardMockup} alt="HR Dashboard Mockup" />
          </div>
        </div>
        
        <div className="con-tit">
          <h3>{t("testimonials.title")}</h3>
        </div>
        
        <div className="testimonial-cards-grid">
          <div className="testimonial-card spotlight-card" onMouseMove={handleMouseMove}>
            <span className="testimonial-quote-icon" style={{ backgroundColor: "rgba(19, 131, 237, 0.1)" }}>
              <i className="fa-solid fa-quote-left" style={{ color: "#1383ed" }}></i>
            </span>
            <p className="testimonial-quote">
              {t("testimonials.card1.quote")}
            </p>
            <div className="testimonial-footer">
              <div className="testimonial-avatar" style={{ background: "linear-gradient(135deg, #1383ed, #1d4ed8)" }}>
                MT
              </div>
              <div className="testimonial-meta">
                <h4 className="testimonial-author">{t("testimonials.card1.author")}</h4>
                <p className="testimonial-role">{t("testimonials.card1.role")}</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card spotlight-card" onMouseMove={handleMouseMove}>
            <span className="testimonial-quote-icon" style={{ backgroundColor: "rgba(19, 131, 237, 0.1)" }}>
              <i className="fa-solid fa-quote-left" style={{ color: "#1383ed" }}></i>
            </span>
            <p className="testimonial-quote">
              {t("testimonials.card2.quote")}
            </p>
            <div className="testimonial-footer">
              <div className="testimonial-avatar" style={{ background: "linear-gradient(135deg, #1383ed, #1d4ed8)" }}>
                ER
              </div>
              <div className="testimonial-meta">
                <h4 className="testimonial-author">{t("testimonials.card2.author")}</h4>
                <p className="testimonial-role">{t("testimonials.card2.role")}</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card spotlight-card" onMouseMove={handleMouseMove}>
            <span className="testimonial-quote-icon" style={{ backgroundColor: "rgba(19, 131, 237, 0.1)" }}>
              <i className="fa-solid fa-quote-left" style={{ color: "#1383ed" }}></i>
            </span>
            <p className="testimonial-quote">
              {t("testimonials.card3.quote")}
            </p>
            <div className="testimonial-footer">
              <div className="testimonial-avatar" style={{ background: "linear-gradient(135deg, #1383ed, #1d4ed8)" }}>
                DC
              </div>
              <div className="testimonial-meta">
                <h4 className="testimonial-author">{t("testimonials.card3.author")}</h4>
                <p className="testimonial-role">{t("testimonials.card3.role")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}

