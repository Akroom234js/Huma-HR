import { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Footer from "./Footer";
import logo from "../../../assets/logo.png";
import ff from "../../../assets/dd.jpg";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
export default function Home() {
  const [step, setStep] = useState("login"); // login, forgot, verify, reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        alert("Login successful!");
        // Redirect or update app state here
      } else if (response.status === 422) {
        setErrors(data.errors || { message: data.message });
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Failed to connect to server.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }
    // API logic for forgot password...
    setStep("verify");
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    // API logic for verify code...
    setStep("reset");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // API logic for reset password...
    alert("Password reset successfully!");
    setStep("login");
  };

  return (
    <>
      <div className="container1">
        <div className="navbar">
          <div className="logo-con">
            <Link to="/">
              <img src={logo} alt="Huma HR Logo" className="sidebar-logo" />
              <h1 className="sidebar-title" style={{ display: "inline-block" }}>
                Huma
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
              <Link to="/home">Home</Link>
              <Link to="/jops">Jops</Link>
              <Link to="/recruitment">Go to website</Link>
              <ThemeToggle />
              <div className="nav-profile"> </div>
            </div>
          </div>
        </div>
        <div className="intro-box">
          <span className="intro">Empowering the Future of Work</span>
          <h2 className="title">Join Our Innovative Team</h2>
          <p className="description">
            Welcome to our career portal. Whether you are an applicant looking
            for your next challenge or an employee managing your profile, we
            empower you with transparency.
          </p>
        </div>
      </div >
      <div className="container2">
        <div className="poop1">
          <span style={{ color: "var(--primary-color)" }}>.</span>
          <div className="poop2">
            <div className="left-side">
              <span className="icon1">
                <i className="fa-solid fa-house"></i>
              </span>
              <h2>Employee Portal</h2>
              <p>
                Seamlessly manage your professional profile, track attendance,
                and access internal resources.
              </p>
              <hr />
              <div className="icon_bottom">
                <span>
                  <i className="fa-solid fa-house"></i>
                </span>
                <p>Enterprise Grade Security</p>
              </div>
            </div>

            <div className="right-side">
              <div className={`forms-slider show-${step}`}>
                {/* 1. Login Form */}
                <div className="form-content login-section">
                  <h3> Welcome Back</h3>
                  <p>Please enter your credentials to access your dashboard.</p>
                  <div className="con-input">
                    <label>Email Address</label>
                    <input
                      type="text"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <span className="error-text">{errors.email[0]}</span>}

                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="e.g.vEMP-12345"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <span className="error-text">{errors.password[0]}</span>}

                    <div className="con-forgetcheck">
                      <span>
                        <input type="checkbox" />
                        <label>Remember me</label>
                      </span>
                      <Link onClick={() => setStep("forgot")}>forget Password ?</Link>
                    </div>
                    <button className="ptn-login" onClick={handleLogin}>Sign In to Dashboard</button>
                  </div>
                </div>

                {/* 2. Forgot Password Form */}
                <div className="form-content forgot-section">
                  <h3> Reset Password</h3>
                  <p>Enter your email to recover your account access.</p>
                  <div className="con-input">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className="ptn-login" onClick={handleForgotPassword}>Send Reset Link</button>
                    <button className="ptn-back-to-login" onClick={() => setStep("login")}>
                      <i className="fa-solid fa-arrow-left"></i> Back to Login
                    </button>
                  </div>
                </div>{/* 3. Verification Code Flow */}
                <div className="form-content verify-section">
                  <h3>Verify Your Email</h3>
                  <p>Enter the 6-digit code sent to your email address.</p>
                  <div className="con-input">
                    <label>Verification Code</label>
                    <input
                      type="text"
                      placeholder="000000"
                      maxLength="6"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    <button className="ptn-login" onClick={handleVerifyCode}>
                      Confirm Code
                    </button>
                    <button className="ptn-back-to-login" onClick={() => setStep("forgot")}>
                      <i className="fa-solid fa-arrow-left"></i> Back
                    </button>
                  </div>
                </div>

                {/* 4. Reset Password Form */}
                <div className="form-content reset-section">
                  <h3>New Password</h3>
                  <p>Please choose a strong and easy-to-remember password.</p>
                  <div className="con-input">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="********"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button className="ptn-login" onClick={handleResetPassword}>
                      Save and Update
                    </button>
                    <button className="ptn-back-to-login" onClick={() => setStep("verify")}>
                      <i className="fa-solid fa-arrow-left"></i> Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container3">
        <div className="con-tit">
          <h3>Why Choose Our Platform</h3>
          <p>
            Discover the powerful tools and features designed to streamline your
            HR processes.
          </p>
        </div>
        <div className="con_cart">
          <div>
            <span>
              <i
                className="fa-solid fa-chart-simple"
                style={{ color: "#1383ed " }}
              ></i>
            </span>
            <h3>Advanced Analytics</h3>
            <p>
              Gain insights into workforce trends with our comprehensive
              dashboard.
            </p>
          </div>
          <div>
            <span>
              {/* <i className="fa-solid fa-house"></i> */}
              <i
                className="fa-solid fa-circle-nodes"
                style={{ color: "#9333ea" }}
              ></i>
            </span>
            <h3>Seamless Integration</h3>
            <p>Connect easily with your favorite tools like Slack and Zoom.</p>
          </div>
          <div>
            <span>
              <i
                className="fa-solid fa-shield-halved"
                style={{ color: "#0d9448 " }}
              ></i>
            </span>
            <h3>Enterprise Security</h3>
            <p>Bank-grade encryption keeps your sensitive data protected.</p>
          </div>
          <div>
            <span>
              <i
                className="fa-solid fa-clock"
                style={{ color: "#ea580c " }}
              ></i>
            </span>
            <h3>Time Management</h3>
            <p>Automated attendance tracking and leave management systems.</p>
          </div>
          <div>
            <span>
              <i
                className="fa-solid fa-users"
                style={{ color: "#db2777 " }}
              ></i>
            </span>
            <h3>Team Collaboration</h3>
            <p>
              Foster a connected culture with built-in communication channels.
            </p>
          </div>
          <div>
            <span>
              <i
                className="fa-solid fa-brain"
                style={{ color: "#4f46e5 " }}
              ></i>
            </span>
            <h3>AI Recruiting</h3>
            <p>Leverage artificial intelligence to screen candidates faster.</p>
          </div>
        </div>
      </div>
      <div className="container4">
        <h4>
          <h3>Application Process</h3>
        </h4>
        <div className="con_cart2">
          <div>
            <span>1</span>
            <h3>Submit CV</h3>
            <p>
              Upload your resume directly to the opening. Our AI screening gives
              instant feedback.
            </p>
          </div>
          <div>
            <span>2</span>
            <h3>Review</h3>
            <p>
              Our HR team carefully reviews your profile against our
              requirements.
            </p>
          </div>
          <div>
            <span>3</span>
            <h3>Interview</h3>
            <p>
              Schedule a meeting with the team to discuss your future at Huma.
            </p>
          </div>
        </div>
        <div className="container5">
          <div>
            <h2>Experience the Digital Workplace</h2>
            <p>
              Our internal platform streamlines everything from attendance to
              analytics. Get a glimpse of the tools you'll use daily.
            </p>
            <button>Learn More</button>
          </div>
          <div>
            <img src={ff} alt="er" width={"90%"} height={"85%"} />
          </div>
        </div>
        {/* ww */}
        <h4>
          <h3>Trusted by HR Teams</h3>
        </h4>
        <div className="con_cart2">
          <div>
            <p style={{ marginTop: "10px", fontSize: "16px" }}>
              "The automated screening process has cut our recruitment time by
              40%. It's a game-changer for our small HR team."
            </p>

            <p className="dd">
              <span className="user1"> </span>
              <h4
                style={{
                  fontSize: "14px",
                  color: "var(--text-main)",
                  display: "inline-block",
                }}
              >
                Sarah Jenkins
              </h4>
              HR Director, TechFlow
            </p>
          </div>
          <div>
            <p style={{ marginTop: "10px", fontSize: "16px" }}>
              "The automated screening process has cut our recruitment time by
              40%. It's a game-changer for our small HR team."
            </p>

            <p className="dd">
              <span className="user1"> </span>
              <h4
                style={{
                  fontSize: "14px",
                  color: "var(--text-main)",
                  display: "inline-block",
                }}
              >
                Sarah Jenkins
              </h4>
              HR Director, TechFlow
            </p>
          </div>
          <div>
            <p style={{ marginTop: "10px", fontSize: "16px" }}>
              "The automated screening process has cut our recruitment time by
              40%. It's a game-changer for our small HR team."
            </p>

            <p className="dd">
              <span className="user1"> </span>
              <h4
                style={{
                  fontSize: "14px",
                  color: "var(--text-main)",
                  display: "inline-block",
                }}
              >
                Sarah Jenkins
              </h4>
              HR Director, TechFlow
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
