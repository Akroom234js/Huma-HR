import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation("Home/Footer");

  return (
    <>
      <div className="footer">
        <div className="one">
          <div className="brand-logo">
            <span className="material-icons">business</span>
            <h3>Huma</h3>
          </div>
          <p>{t("brand.desc")}</p>
        </div>
        <div className="two">
          <h3>{t("contact.title")}</h3>
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
            <span>{t("contact.location")}</span>
          </div>
        </div>
        <div className="three">
          <h3>{t("newsletter.title")}</h3>
          <p>{t("newsletter.subtitle")}</p>
          <div className="newsletter-box">
            <input type="email" placeholder={t("newsletter.placeholder")} />
            <button>{t("newsletter.btn")}</button>
          </div>
        </div>
      </div>
      <div className="end">
        <p>{t("bottom.rights")}</p>
        <div className="footer-links-bottom">
          <Link to="#">{t("bottom.privacy")}</Link>
          <Link to="#">{t("bottom.terms")}</Link>
        </div>
      </div>
    </>
  );
}
