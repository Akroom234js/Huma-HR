import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <>
      <div className="footer">
        <div className="one">
          <div className="brand-logo">
            <span className="material-icons">business</span>
            <h3>Huma</h3>
          </div>
          <p>
            Streamlining human resources for a digital world. Our platform
            connects talent with opportunity and simplifies workforce
            management.
          </p>
        </div>
        <div className="two">
          <h3>Contact Us</h3>
          <div className="contact-item">
            <span className="material-icons text-sm">email</span>
            <span>contact@huma.com</span>
          </div>
          <div className="contact-item">
            <span className="material-icons text-sm">phone</span>
            <span>+1 (234) 567-890</span>
          </div>
          <div className="contact-item">
            <span className="material-icons text-sm">location_on</span>
            <span>San Francisco, CA</span>
          </div>
        </div>
        <div className="three">
          <h3>Newsletter</h3>
          <p>Subscribe to get the latest HR news and updates.</p>
          <div className="newsletter-box">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>
      <div className="end">
        <p>© 2024 Huma. All Rights Reserved.</p>
        <div className="footer-links-bottom">
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms of Use</Link>
        </div>
      </div>
    </>
  );
}
