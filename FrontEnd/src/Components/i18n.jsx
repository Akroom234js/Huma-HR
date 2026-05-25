import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
	.use(HttpBackend) // يسمح بتحميل ملفات JSON ديناميكيًا
	.use(initReactI18next)
	.init({
		lng: sessionStorage.getItem("lang") || "en",
		fallbackLng: "en",
		debug: false,
		backend: {
			loadPath: "/locales/{{lng}}/{{ns}}.json", // ns = namespace = اسم الصفحة
		},

		ns: [
			'Sidebar/Sidebar',
			'EmployeeMovement/EmployeeMovement',
			'SalaryManagement/SalaryStructure',
			'Dashboard/EmployeeReports',
			'Dashboard/Attendance',
			'Dashboard/Leaves',
			'EmployeePortal/Profile'
		], // أسماء الملفات

		defaultNS: "Sidebar/Sidebar",
		interpolation: { escapeValue: false },
	});

export default i18n;