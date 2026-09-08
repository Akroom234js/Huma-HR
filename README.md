# Huma-HR

<p align="center">
  <b>An intelligent, all-in-one HR management platform built for Small & Medium Enterprises (SMEs)</b><br>
  <sub>منصة ذكاء اصطناعي متكاملة لإدارة الموارد البشرية، مصممة خصيصاً للشركات الصغيرة والمتوسطة</sub>
</p>

<p align="center">
  <img alt="Laravel" src="https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black">
  <img alt="PHP" src="https://img.shields.io/badge/PHP-8.x-777BB4?logo=php&logoColor=white">
  <img alt="Gemini" src="https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green">
</p>

---

## 📖 About / نبذة عن المشروع

**English**
Most SMEs still manage their most valuable asset — their people — through scattered tools: spreadsheets, chat apps, and manual tracking. Huma-HR replaces that chaos with a single, secure, AI-powered platform that covers the full employee lifecycle: from hiring to performance to payroll.

**عربي**
معظم الشركات الصغيرة والمتوسطة لسا عم تدير أهم أصل عندها — موظفيها — عبر أدوات مبعثرة زي Excel والواتساب. **Huma-HR** بيجمع كل هاد بمنصة واحدة آمنة ومدعومة بالذكاء الاصطناعي، بتغطي دورة حياة الموظف الكاملة: من التوظيف لغاية الرواتب.

---

## ✨ Key Features / الميزات الأساسية

| Module | English | عربي |
|---|---|---|
| 🔐 Auth & RBAC | 4-role access control (HR, Manager, Department Manager, Employee) via Sanctum + Spatie Permission | نظام صلاحيات بأربع مستويات مبني على Sanctum و Spatie Permission |
| 👤 Employee Management | Full employee profiles with a complete audit trail | ملفات موظفين كاملة مع سجل تدقيق لكل تعديل |
| 🤖 ATS + AI Resume Evaluation | Applicant Tracking System scored automatically by **Google Gemini AI** against job requirements | نظام تتبع متقدمين، بيقيّم السير الذاتية تلقائياً عبر **Gemini AI** حسب مطابقتها للوظيفة |
| 📊 360° Performance + AI Coaching | Anonymous peer reviews, manager evaluations, tasks & attendance — with AI-generated coaching recommendations | تقييم أداء ٣٦٠ درجة مع تقييمات مجهولة مشفّرة، وتوصيات تدريب مبنية على الذكاء الاصطناعي |
| 📍 Attendance & Leave | GPS-based check-in/out and fully digital leave requests | حضور وانصراف بالـ GPS وإدارة إجازات رقمية بالكامل |
| 💰 Automated Payroll | Salary, overtime, and deductions calculated automatically from a single source of truth | حساب رواتب أوتوماتيكي بمنطق موحد لمنع أي تعارض بالبيانات |
| 📈 Analytics & Reports | Role-based dashboards with real-time insights | داشبوردات تحليلية بصلاحيات محددة تعطي صورة لحظية عن أداء المؤسسة |

---

## 🛠️ Tech Stack / التقنيات المستخدمة

**Backend**
- Laravel 12 — Service Layer Architecture
- Laravel Sanctum — Authentication
- Spatie Permission — Role-Based Access Control (RBAC)
- Queue Jobs — Async processing for AI requests

**Frontend**
- React + Vite

**AI**
- Google Gemini API — resume evaluation & performance coaching

**Security**
- AES-256 encryption for sensitive/anonymous evaluation data
- HMAC token protection

**Deployment**
- Backend → Render
- Frontend → Vercel

---

## 🧱 Architecture / البنية المعمارية

Huma-HR follows a **Service Layer Architecture**, keeping business logic decoupled from controllers for better testability and maintainability. All API responses follow a unified structure (`status`, `message`, `data`) across every endpoint.

النظام مبني على **Service Layer Architecture** لفصل منطق الأعمال عن الـ Controllers، وكل استجابات الـ API موحدة بنفس البنية (`status`, `message`, `data`).

---

## 🎥 Demo

📺 Watch the demo video: **[Link here]**

---

## 📚 Documentation

Full setup and API documentation is available separately — please reach out if you'd like access.

التوثيق الكامل لتشغيل المشروع والـ API متوفر بشكل منفصل — تواصل معنا للحصول عليه.

---

## 👥 Team / الفريق

This project was built as a graduation project by a dedicated team, under the supervision of our academic advisors.

هاد المشروع تم بناؤه كمشروع تخرج من قبل فريق متكامل، تحت إشراف الدكاترة المشرفين على المشروع.

---

## 📄 License

This project is licensed under the MIT License.
