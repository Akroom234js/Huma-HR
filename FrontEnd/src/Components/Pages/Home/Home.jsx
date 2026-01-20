import { Link } from "react-router-dom";
import "./Home.css";
import Footer from "./Footer";
export default function Home() {
  return (
    <>
      <div className="container1">
        <div className="navbar">
          <div className="logo-con">
            <Link to="/">
              {" "}
              <span>
                <i className="fa-solid fa-house"></i>
              </span>
              <div className="logo">Huma</div>
            </Link>
          </div>
          <div className="other-option-con">
            <Link to="/home">Home</Link>
            <Link to="/jops">Jops</Link>
            <Link to="/recruitment">Go to website</Link>
            <button className="ptn-switch"> ☀️</button>
            <div className="nav-profile"> </div>
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
      </div>
      <div className="container2">
        <div className="poop1">
          <span style={{ color: "#1e3a8a" }}>.</span>
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
              <h3> Welcome Back</h3>
              <p>Please enter your credentials to access your dashboard.</p>
              <div className="con-input">
                <label>Email Address</label>
                <input type="text" placeholder="name@company.com" />
                <label>Password</label>
                <input type="text" placeholder="e.g.vEMP-12345" />
                <div className="con-forgetcheck">
                  <span>
                    <input type="checkbox" />
                    <label>Remember me</label>
                  </span>
                  <Link>forget Password ?</Link>
                </div>
                <button className="ptn-login">Sign In to Dashboard</button>
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
            <img src="/dd.jpg" alt="er" width={"90%"} height={"85%"} />
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
                  color: "#ffff",
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
