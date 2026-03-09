import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import '../Components/Sidebar/Sidebar'
const LanguageSwitcher = () => {
	const { i18n } = useTranslation();
	const [isEnglish, setIsEnglish] = useState(i18n.language === "en");

	const toggleLanguage = () => {
		const newLang = isEnglish ? "ar" : "en";
		i18n.changeLanguage(newLang);
		sessionStorage.setItem("lang", newLang);
		setIsEnglish(!isEnglish);
	};

	useEffect(() => {
		const dir = isEnglish ? "ltr" : "rtl";
		document.body.dir = dir;
		document.body.style.textAlign = isEnglish ? "left" : "right";
	}, [isEnglish]);

	return (
		<button onClick={toggleLanguage} className="translation">
			<div className="translation">
				<i className="bi bi-globe"></i>

				<p> {isEnglish ? "Change Language" : "تغيير اللغة"}</p>
			</div>
		</button>
	);
};

export default LanguageSwitcher;
