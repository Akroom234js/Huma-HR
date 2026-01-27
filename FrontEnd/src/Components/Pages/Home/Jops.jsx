import { Link } from "react-router-dom";
import "./Home.css";
import Footer from "./Footer";
import logo from "../../../assets/logo.png";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
export default function Jops() {
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
            <Link to="/home">Home</Link>
            <Link to="/jops">Jops</Link>
            <Link to="/recruitment">Go to website</Link>
            <ThemeToggle />

            <div className="nav-profile"> </div>
          </div>
        </div>
        <div className="intro-box">
          <span className="intro">Grow With Us</span>
          <h2 className="title">Find Your Dream Job</h2>
          <p className="description">
            Explore exciting opportunities at Huma. We are always looking for
            talented individuals to join our mission of revolutionizing HR.
          </p>
        </div>
      </div>
      <div className="container2">
        <div className="poop_jops">
          <div className="con_up">
            <div>
              <h2>Open Positions</h2>
              <p>Browse our latest job openings and apply today.</p>
            </div>
            <input placeholder="   🔍  Search by jop title ..." />
          </div>
          <div className="container_carts">
            <div className="cart1">
              <div className="gg">
                <div className="firstline">
                  <span className="prod">Product</span>
                  <span className="time">2 days ago</span>
                </div>
                <h4>Senior Product Designer</h4>
                <p>
                  We are seeking a creative Senior Product Designer to shape the
                  user experience of our platform.
                </p>
                <div className="con-salary">
                  <span style={{ color: "var(--text-main)" }}> Huma</span>
                  <span> 120$ -180$</span>
                </div>
              </div>
              <button>Apply Now</button>
            </div>
            <div className="cart1">
              <div className="gg">
                <div className="firstline">
                  <span className="prod">Engineering</span>
                  <span className="time">5 days ago</span>
                </div>
                <h4>Frontend Developer</h4>
                <p>
                  Join our engineering team to build the next generation of HR
                  tools. Experience with React needed.
                </p>
                <div className="con-salary">
                  <span style={{ color: "var(--text-main)" }}> Huma</span>
                  <span> 120$ -130$</span>
                </div>
              </div>
              <button>Apply Now</button>
            </div>
            <div className="cart1">
              <div className="gg">
                <div className="firstline">
                  <span className="prod">Marketing</span>
                  <span className="time">7 days ago</span>
                </div>
                <h4>Marketing Manager</h4>
                <p>
                  We are looking for a data-driven Marketing Manager to lead our
                  growth initiatives.
                </p>
                <div className="con-salary">
                  <span style={{ color: "var(--text-main)" }}> Huma</span>
                  <span> 120$ -180$</span>
                </div>
              </div>
              <button>Apply Now</button>
            </div>
            <div className="cart1">
              <div className="gg">
                <div className="firstline">
                  <span className="prod">Operations</span>
                  <span className="time">2 days ago</span>
                </div>
                <h4>HR Specialist</h4>
                <p>
                  Support our growing team by managing day-to-day HR operations.
                </p>
                <div className="con-salary">
                  <span style={{ color: "var(--text-main)" }}> Huma</span>
                  <span> 120$ -180$</span>
                </div>
              </div>
              <button>Apply Now</button>
            </div>
            <button className="ptn-more">Show more jobs</button>
          </div>
        </div>
      </div>

      <div className="container41">
        <h4>
          <h3>How to Apply</h3>
        </h4>
        <div className="con_cart2">
          <div>
            <span>1</span>
            <h3>Submit Application</h3>
            <p>Click apply on any listing. Upload your CV easily.</p>
          </div>
          <div>
            <span>2</span>
            <h3>Review</h3>
            <p>Our HR team reviews applications daily.</p>
          </div>
          <div>
            <span>3</span>
            <h3>Interview</h3>
            <p>If your profile matches, we will schedule a call.</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
