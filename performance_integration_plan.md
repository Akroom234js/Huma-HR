# خطة تكامل واجهات الأداء مع النظام الخلفي (Performance Module Integration Plan)

يوضح هذا المستند كافة واجهات نظام الأداء (Performance Module) في الواجهة الأمامية (Front-End) لجميع الأدوار، والمكونات الفرعية التابعة لها، وحالة ربطها مع روابط الباك اند (Laravel API)، مع توضيح الثغرات والتعديلات المطلوبة.

---

## 1. واجهات الموارد البشرية (HR / Admin Performance Hub)

### نظرة عامة على الشركة (Company Overview)
- **المسار**: `/performance`
- **ملف المكون**: `HRPerformance/CompanyOverview/CompanyOverview.jsx`
- **المكونات الفرعية**:
  - `Card.jsx`: إحصائيات عامة (عدد الموظفين، متوسط العلامات، اسم الدورة النشطة، نسبة الإنجاز).
  - `PerformanceDepartment.jsx`: رسم بياني لمتوسط تقييم الأقسام.
  - `TaskStatusPool.jsx`: رسم بياني دائري لحالات المهام.
  - `CycleTable.jsx`: جدول استعراض دورات التقييم الحالية والسابقة.
  - `TastsTable.jsx`: جدول المهام للقراءة فقط على مستوى الشركة.
- **روابط الباك اند المقابلة**:
  - `GET /api/performance/cycles` (منجز - جلب كل الدورات).
  - `GET /api/tasks` (منجز - جلب مهام الشركة).
  - `GET /api/performance/stats` (غير منجز - بحاجة لإنشائه في الباك اند لإرجاع إحصائيات الدورة والمهام ومعدل الأقسام دفعة واحدة).
- **الحالة**: الواجهة بالفرونت اند مكتملة كـ UI فقط وتعتمد على بيانات وهمية (Mock Data).
- **التعديل المطلوب**: ربط الـ Cards والرسوم البيانية وداعم الحساب بالـ API الإحصائي الجديد بعد بنائه.

### تقارير الأداء الموحدة (HR Performance Reports)
- **المسار**: `/performance/reports`
- **ملف المكون**: `HRPerformance/PerformanceReports/PerformanceReports.jsx`
- **المكونات الفرعية**:
  - `ReportsTable.jsx`: جدول علامات الموظفين التفصيلي (المهام، المدير، الزملاء، الحضور، الإضافي، التقييم النهائي، القرار المقترح).
  - `CycleModal.jsx`: نموذج إطلاق دورة أداء جديدة.
- **روابط الباك اند المقابلة**:
  - `GET /api/performance/evaluations/{cycleId}` (منجز - جلب الدرجات التفصيلية للموظفين بدورة معينة).
  - `POST /api/performance/cycles` (منجز - إطلاق دورة جديدة).
- **الحالة**: الواجهة مكتملة كـ UI ثابت ببيانات وهمية.
- **التعديل المطلوب**:
  - ربط جدول التقييمات لاسترجاع درجات الموظفين بالدورة المحددة.
  - ربط نموذج `CycleModal` لإرسال طلب إطلاق الدورة الجديدة (الاسم، الفترة، النطاق) للباك اند.
  - **ملاحظة برمجية**: يحتوي ملف `CycleModal.jsx` على استدعاءات مباشرة للـ DOM خارج الـ React Lifecycle مما قد يسبب مشاكل أثناء التشغيل، ويجب تعديلها لتستخدم React State (مثل تبديل النطاق وحساب المعاينة).

### مركز الإجراءات التلقائية (Auto Actions Hub)
- **المسار**: `/performance/actions`
- **ملف المكون**: `HRPerformance/AutoActionsHub/AutoActionsHub.jsx`
- **المكونات الفرعية**:
  - `PendingActions.jsx`: جدول الإجراءات المقترحة المعلقة مع أزرار الاعتماد والرفض.
  - `ActionsLog.jsx`: سجل الإجراءات التي تم البت فيها سابقاً.
- **روابط الباك اند المقابلة**:
  - `GET /api/performance/actions` (منجز - جلب الإجراءات التلقائية).
  - `PUT /api/performance/actions/{action}/approve` (منجز - اعتماد الإجراء).
  - `PUT /api/performance/actions/{action}/reject` (منجز - رفض الإجراء).
- **الحالة**: الواجهة مكتملة كـ UI ثابت.
- **التعديل المطلوب**: ربط الأزرار لتستدعي الروابط وتحديث القائمة محلياً بعد الاعتماد أو الرفض.

### منشئ قوالب التقييم (Eval Template Builder)
- **المسار**: `/performance/template-builder`
- **ملف المكون**: `HRPerformance/EvalTemplateBuilder/EvalTemplateBuilder.jsx`
- **المكونات الفرعية**:
  - نموذج تعديل الأوزان الرئيسية والفرعية وتحديد عتبات القرارات.
- **روابط الباك اند المقابلة**:
  - `POST /api/performance/templates` (غير منجز - حفظ قالب جديد).
  - `GET /api/performance/templates` (غير منجز - قائمة القوالب).
  - `PUT /api/performance/templates/{id}` (غير منجز - تعديل).
  - `DELETE /api/performance/templates/{id}` (غير منجز - حذف).
- **الحالة**: الواجهة منجزة وتعمل بكفاءة بالفرونت اند ومترجمة، لكنها تكتفي بطباعة الـ Payload في الـ Console عند الحفظ.
- **التعديل المطلوب**: إنشاء `PerformanceTemplateController` وتسجيل روابط الـ templates لحفظ القالب الهيكلي في حقل الـ JSON بالـ DB.

---

## 2. واجهات الموظف (Employee Performance Portal)

### بوابة مهام الأداء الخاصة بي (My Tasks Portal)
- **المسار**: `/portal/performance`
- **ملف المكون**: `EmployeePortal/Performance/MyTasksPortal/MyTasksPortal.jsx`
- **المكونات الفرعية**:
  - بطاقات الإحصاء لمهامي الحالية (معلقة، قيد العمل، للمراجعة، تحتاج تعديل، تم التقييم).
  - قائمة المهام النشطة.
- **روابط الباك اند المقابلة**:
  - `GET /api/tasks/my-tasks` (منجز - جلب مهام الموظف الحالي).
  - `PUT /api/tasks/{task}/start` (منجز - بدء العمل على المهمة).
- **الحالة**: الواجهة مكتملة كـ UI ثابت ببيانات وهمية.
- **التعديل المطلوب**: ربط القائمة والإحصاءات بـ `getMyTasks()` واستدعاء `startTask()` عند الضغط على زر "ابدأ العمل".

### تفاصيل تسليم المهمة (Task Details View)
- **المسار**: `/portal/performance/tasks/:id`
- **ملف المكون**: `EmployeePortal/Performance/TaskDetailsView/TaskDetailsView.jsx`
- **المكونات الفرعية**:
  - نموذج تسليم المخرجات (رابط النص + ملفات الارتفاكت).
  - شاشة تفصيل درجات المهمة بعد الاعتماد (TaskScoreBreakdown).
- **روابط الباك اند المقابلة**:
  - `GET /api/tasks/{task}` (منجز - تفاصيل المهمة).
  - `PUT /api/tasks/{task}/complete` (منجز - تسليم المخرجات).
- **الحالة**: الواجهة مكتملة كـ UI ثابت.
- **التعديل المطلوب**: ربط استرجاع تفاصيل المهمة الحالية بالمعرف `id` من الرابط، وتفعيل زر الإرسال لاستدعاء الـ API مع رفع النص/الملفات وتحديث حالة المهمة إلى `pending_review`.

### تقرير التقييم والتطوير بالذكاء الاصطناعي (Performance Report)
- **المسار**: `/portal/performance/report`
- **ملف المكون**: `EmployeePortal/Performance/PerformanceReport/PerformanceReport.jsx`
- **المكونات الفرعية**:
  - `ScoreWeightBar.jsx`: أشرطة رصد درجات المكونات الخمسة.
  - بطاقة تعليقات الزملاء المجهولة.
  - `AIRecommendationCard.jsx`: توصيات المسارات التدريبية من الذكاء الاصطناعي.
- **روابط الباك اند المقابلة**:
  - `GET /api/performance/my-evaluation` (غير منجز - جلب العلامة النهائية والمكونات الخمسة والتعليقات وتوصيات الذكاء الاصطناعي الخاصة بالموظف الحالي).
  - **ملاحظة**: يوجد في الباك اند حالياً رابط لجلب تفاصيل التقييم وموجه للـ HR فقط وهو `/evaluations/{cycleId}/{employeeId}`، بينما نحتاج رابطاً آمناً خاصاً بالموظف لا يستعرض إلا بياناته هو فقط دون تمرير `employeeId` بالرابط.
- **الحالة**: الواجهة مكتملة كـ UI ثابت بالكامل.
- **التعديل المطلوب**: بناء الرابط الجديد بالباك اند وجلب كود العلامات والتعليقات والتدريبات وربطها بالواجهة.

### نموذج تقييم الزملاء (Peer Review Form)
- **المسار**: `/portal/performance/peer-review`
- **ملف المكون**: `EmployeePortal/Performance/PeerReviewForm/PeerReviewForm.jsx`
- **المكونات الفرعية**:
  - نموذج رصد درجات الزميل بالقسم (العمل الجماعي، التعاون) وصندوق التعليقات.
- **روابط الباك اند المقابلة**:
  - `GET /api/my-department/employees` (منجز - جلب موظفي نفس القسم للتقييم).
  - `POST /api/performance/peer-evaluations` (منجز - حفظ تقييم زميل).
- **الحالة**: الواجهة مكتملة كـ UI ثابت.
- **التعديل المطلوب**:
  - استدعاء قائمة الموظفين واستبعاد الموظف الحالي منها تلقائياً.
  - إرسال العلامات والتعليق بصيغة JSON للباك اند عند الحفظ.

---

## 3. واجهات المدير / المشرف (Manager Performance Portal)

### لوحة مهام القسم (Department Tasks)
- **المسار**: `/portal/manager/tasks`
- **ملف المكون**: `EmployeePortal/Performance/Manager/DepartmentTasks/DepartmentTasks.jsx`
- **الحالة**: **منجزة بالكامل ومربوطة بالـ APIs الخاصة بـ `performanceService.js` وتعمل بكفاءة**.

### لوحة رصد درجات المهمة (Task Score Drawer)
- **المسار**: `/portal/manager/tasks/score/:id`
- **ملف المكون**: `EmployeePortal/Performance/Manager/TaskScoreDrawer/TaskScoreDrawer.jsx`
- **الحالة**: **منجزة بالكامل ومربوطة بالـ APIs الخاصة بـ `performanceService.js` وتعمل بكفاءة**.

### التقييم الدوري للموظفين (Periodic Evaluation)
- **المسار**: `/portal/manager/evaluate` و `/portal/manager/evaluate/:employee_id`
- **ملف المكون**: `EmployeePortal/Performance/Manager/PeriodicEvaluation/PeriodicEvaluation.jsx`
- **المكونات الفرعية**:
  - شريط اختيار موظفي القسم التابعين للمدير.
  - `ManagerEvalForm`: نموذج رصد الدرجات معايير المدير الثلاثة (Professionalism, Responsibility, Problem Solving) المحددة من 0 إلى 10 وملاحظات التقييم.
- **روابط الباك اند المقابلة**:
  - `GET /api/my-department/employees` (منجز - جلب الموظفين بالقسم).
  - `POST /api/performance/manager-evaluations` (منجز - حفظ التقييم الدوري للموظف بالدورة النشطة).
  - `GET /api/performance/manager-evaluations/{cycleId}/{employeeId}` (منجز - جلب التقييم السابق للتعديل أو العرض).
- **الحالة**: الواجهة مكتملة كـ UI ثابت.
- **التعديل المطلوب**: ربط شريط الموظفين بالـ API، وجلب التقييم السابق للموظف تلقائياً لتهيئته بالنموذج، وإرسال الدرجات والملاحظات عند الحفظ.

### إدارة دورات الأداء للقسم (Performance Cycles)
- **المسار**: `/portal/manager/cycles`
- **ملف المكون**: `EmployeePortal/Performance/Manager/PerformanceCycles/PerformanceCycles.jsx`
- **المكونات الفرعية**:
  - جدول دورات الأداء التاريخية وقسم مراقبة حالة العمليات الخلفية (Jobs).
  - `CycleResultsModal.jsx`: عرض درجات وقرارات موظفي القسم التابعين للمدير بدورة مغلقة.
- **روابط الباك اند المقابلة**:
  - `GET /api/performance/cycles` (منجز - قائمة الدورات).
  - `GET /api/performance/evaluations/{cycleId}` (منجز - استرجاع درجات الموظفين بالدورة لملء الـ Modal).
- **الحالة**: الواجهة مكتملة كـ UI ثابت.
- **التعديل المطلوب**: ربط جدول الدورات ونافذة استعراض نتائج القسم بـ APIs الباك اند.
