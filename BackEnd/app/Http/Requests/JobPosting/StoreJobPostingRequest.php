public function rules(): array
{
    return [
        'title'       => 'required|string|max:255',

        // ✅ min:150 — يجبر الـ HR يكتب وصف مفصّل فيه Skills
        // بدون وصف مفصّل، الـ AI ما رح يقدر يقيّم صح
        'description' => 'required|string|min:150',

        // ✅ أضفنا position_id — مطلوب لربط الوظيفة بمنصب
        'position_id'    => 'required|exists:positions,id',

        'department_id'      => 'nullable|exists:departments,id',
        'salary_min'         => 'nullable|numeric|min:0',
        'salary_max'         => 'nullable|numeric|min:0|gte:salary_min',
        'salary_currency'    => 'nullable|string|max:10',
        'location'           => 'nullable|string|max:255',
        'employment_type'    => 'nullable|in:full-time,part-time,contract,temporary,internship',
        'experience_level'   => 'nullable|in:entry-level,associate,mid-senior,director,executive',
        'application_deadline' => 'nullable|date|after:today',
    ];
}

public function messages(): array
{
    return [
        'title.required'           => 'عنوان الوظيفة مطلوب.',
        'title.max'                => 'عنوان الوظيفة يجب أن لا يتجاوز 255 حرف.',

        // ✅ رسالة توجيهية للـ HR
        'description.required'     => 'وصف الوظيفة مطلوب.',
        'description.min'          => 'وصف الوظيفة قصير جداً — اكتب المهارات والمتطلبات بالتفصيل لتحسين دقة الـ AI.',

        'position_id.required'     => 'يجب تحديد المنصب الوظيفي.',
        'position_id.exists'       => 'المنصب المحدد غير موجود.',
        'department_id.exists'     => 'القسم المحدد غير موجود.',
        'salary_max.gte'           => 'الحد الأعلى للراتب يجب أن يكون أكبر من الحد الأدنى.',
        'application_deadline.after' => 'موعد التقديم يجب أن يكون بعد اليوم.',
    ];
}
