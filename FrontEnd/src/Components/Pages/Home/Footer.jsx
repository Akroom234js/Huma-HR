export default function Footer() {
  return (
    <>
      <div className="footer">
        <div className="one">
          <h3>
            {" "}
            <span style={{ paddingRight: "10px" }}>
              <i className="fa-solid fa-house"></i>
            </span>
            Huma
          </h3>
          <p>
            Streamlining human resources for a digital world. Our platform
            connects talent with opportunity and simplifies workforce
            management.
          </p>
        </div>
        <div className="two">
          <h3>Contact</h3>
          <div style={{ marginBottom: "9px" }}>
            <span style={{ paddingRight: "10px" }}>
              <i className="fa-solid fa-house"></i>
            </span>{" "}
            contact@huma.com
          </div>
          <div>
            {" "}
            <span style={{ paddingRight: "10px" }}>
              <i className="fa-solid fa-house"></i>
            </span>
            +1 (234) 567-890
          </div>
        </div>
        <div className="three">
          <h3>Newsletter</h3>
          <p>
            <input type="" placeholder="     Enter your Email" />
            <button>Subscribe</button>
          </p>
        </div>
      </div>
      <hr
        style={{
          width: 70,
          height: 2,
          backgroundColor: "#ffffff",
          border: "none",
        }}
      />
      <div className="end">
        <p>© 2024 Huma. All Rights Reserved.</p>
        <div>
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
        </div>
      </div>
    </>
  );
}
