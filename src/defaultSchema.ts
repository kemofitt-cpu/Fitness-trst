import { FormSchema } from './types.ts';

export const DEFAULT_FORM_SCHEMA: FormSchema = {
  id: 'kemo-fitt-intake-form',
  title: 'استمارة تقييم واشتراك التدريب والتغذية أونلاين',
  subtitle: 'مع كابتن كريم - Kemo Fitt Coaching',
  description: 'يرجى ملء جميع البيانات بدقة وصدق تام حتى أتمكن من تفصيل البرنامج الرياضي والغذائي الأنسب لجسمك وهدفك وروتين يومك.',
  coachName: 'كابتن كريم',
  coachTitle: 'مدرب لياقة بدنية وتغذية رياضية معتمد',
  coachEmail: 'kemofitt@gmail.com',
  coachPhone: '+201000000000',
  coachBio: 'متخصص في تحويل الأجسام، خسارة الدهون العنيدة، زيادة الكتلة العضلية، وتحسين الصحة العامة بأحدث الطرق العلمية.',
  successMessage: 'تم إرسال استمارتك بنجاح إلى كابتن كريم! سيتم مراجعة تفاصيلك وإرسال البرنامج التدريبي والغذائي في أسرع وقت.',
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: 'personal_info',
      title: 'البيانات الشخصية ومعلومات الاتصال',
      description: 'معلوماتك الأساسية للتواصل ومتابعة البرنامج',
      icon: 'User',
      questions: [
        {
          id: 'full_name',
          label: 'الاسم بالكامل',
          placeholder: 'مثال: محمد أحمد علي',
          type: 'text',
          required: true,
        },
        {
          id: 'phone_number',
          label: 'رقم الهاتف / الواتساب (مع كود الدولة)',
          placeholder: 'مثال: 01012345678 أو +201012345678',
          type: 'tel',
          required: true,
        },
        {
          id: 'client_email',
          label: 'البريد الإلكتروني',
          placeholder: 'example@gmail.com',
          type: 'email',
          required: false,
        },
        {
          id: 'age',
          label: 'السن (العمر)',
          placeholder: 'مثال: 26',
          type: 'number',
          unit: 'سنة',
          min: 14,
          max: 90,
          required: true,
        },
        {
          id: 'location',
          label: 'الدولة والمدينة ومقر الإقامة الحالي',
          placeholder: 'مثال: مصر - القاهرة / السعودية - الرياض',
          type: 'text',
          required: true,
        },
        {
          id: 'occupation_activity',
          label: 'طبيعة عملك ومستوى النشاط البدني خلال اليوم',
          type: 'select',
          required: true,
          options: [
            'عمل مكتبي / قليل الحركة جداً (جلوس معظم اليوم)',
            'حركة متوسطة (وقوف ومشي متقطع)',
            'نشاط عالي / عمل ميداني ومجهود بدني مستمر',
            'طالب / فترات دراسة ومذاكرة متغيرة'
          ],
        },
        {
          id: 'sleep_hours',
          label: 'متوسط عدد ساعات نومك اليومية وجودته',
          type: 'select',
          required: true,
          options: [
            'أقل من 5 ساعات (نوم قليل / غير كافي)',
            'من 5 إلى 6 ساعات',
            'من 7 إلى 8 ساعات (نوم منتظم ومريح)',
            'أكثر من 8 ساعات',
            'نوم متقطع وشفتات عمل ليلية متغيرة'
          ],
        },
      ],
    },
    {
      id: 'body_measurements',
      title: 'القياسات البدنية والحالة الحالية',
      description: 'أرقامك ومقاساتك لتحديد نقطة البداية وحساب الاحتياجات',
      icon: 'Activity',
      questions: [
        {
          id: 'current_weight',
          label: 'الوزن الحالي بالكيلوجرام (على الريق صباحاً إن أمكن)',
          placeholder: 'مثال: 82.5',
          type: 'number',
          unit: 'كجم',
          min: 30,
          max: 250,
          required: true,
        },
        {
          id: 'height',
          label: 'الطول بالسنتيمتر',
          placeholder: 'مثال: 178',
          type: 'number',
          unit: 'سم',
          min: 120,
          max: 230,
          required: true,
        },
        {
          id: 'target_weight',
          label: 'الوزن المستهدف الذي تطمح للوصول إليه',
          placeholder: 'مثال: 72',
          type: 'number',
          unit: 'كجم',
          min: 35,
          max: 200,
          required: false,
        },
        {
          id: 'body_circumferences',
          label: 'قياسات الجسم بالسنتيمتر (محيط الصدر، الخصر/البطن عند السرة، الأرداف، الذراع)',
          placeholder: 'مثال: البطن: 88 سم، الصدر: 102 سم، الذراع: 36 سم...',
          type: 'textarea',
          required: false,
        },
        {
          id: 'inbody_status',
          label: 'هل قمت بعمل فحص InBody أو تحليل مكونات الجسم مؤخراً؟',
          type: 'radio',
          required: true,
          options: [
            'نعم، لدي فحص حديث (خلال آخر شهر)',
            'لا، ولكن سأقوم بعمله قريباً وأرسله لك',
            'غير متاح لدي فحص InBody حالياً'
          ],
        },
        {
          id: 'inbody_photo_link',
          label: 'رابط تقرير InBody أو صور القوام (Google Drive / Imgur / iCloud)',
          placeholder: 'انسخ رابط التقرير أو الصور هنا إن وجد',
          type: 'url',
          required: false,
        },
      ],
    },
    {
      id: 'fitness_goals',
      title: 'الهدف الرياضي وخطة التمرين',
      description: 'لتفصيل جدول التمارين المناسب لخبرتك وإمكانياتك',
      icon: 'Dumbbell',
      questions: [
        {
          id: 'primary_goal',
          label: 'ما هو هدفك الأساسي والأول مع كابتن كريم؟',
          type: 'select',
          required: true,
          options: [
            'خسارة دهون ونزول وزن ملحوظ',
            'تنشيف ونحت وتقسيم العضلات وإبراز عضلات البطن',
            'زيادة كتلة عضلية صافية وتضخيم نظيف (Clean Bulk)',
            'إعادة تشكيل الجسم (Body Recomposition) حرق دهون وبناء عضلات معاً',
            'تحسين اللياقة العامة، النشاط، والصحة العامة',
            'تأهيل إصابة وتصحيح انحناءات القوام (Posture)'
          ],
        },
        {
          id: 'workout_place',
          label: 'أين ستتمرن؟',
          type: 'radio',
          required: true,
          options: [
            'في الجيم (صالة رياضية متكاملة)',
            'في المنزل مع توفر دمبلز ومعدات بسيطة',
            'في المنزل بوزن الجسم فقط (بدون أي أوزان)'
          ],
        },
        {
          id: 'experience_level',
          label: 'مستوى خبرتك السابقة في تمارين الحديد والمقاومة',
          type: 'select',
          required: true,
          options: [
            'مبتدئ تماماً (لم أدخل الجيم من قبل أو أقل من 3 أشهر)',
            'متوسط (أتمرن منذ 6 أشهر إلى سنتين مع انقطاعات)',
            'متقدم (أكثر من سنتين تمرين منتظم وأعرف أداء التمارين بدقة)'
          ],
        },
        {
          id: 'weekly_days',
          label: 'كم عدد الأيام التي تستطيع الالتزام بالتمرين فيها أسبوعياً؟',
          type: 'select',
          required: true,
          options: [
            '3 أيام في الأسبوع (Full Body أو Upper/Lower)',
            '4 أيام في الأسبوع',
            '5 أيام في الأسبوع (Push/Pull/Legs)',
            '6 أيام في الأسبوع'
          ],
        },
        {
          id: 'preferred_time',
          label: 'الوقت المفضل لك لأداء التمرين',
          type: 'radio',
          required: false,
          options: [
            'صباحاً (قبل العمل أو الدراسة)',
            'عصراً',
            'مساءً / بعد انتهاء اليوم'
          ],
        },
      ],
    },
    {
      id: 'nutrition_diet',
      title: 'النظام الغذائي والعادات الغذائية',
      description: 'لتفصيل دايت مرن وصحي تحبه بدون حرمان',
      icon: 'Utensils',
      questions: [
        {
          id: 'daily_meals_count',
          label: 'كم عدد الوجبات التي تفضل تناولها في يومك؟',
          type: 'select',
          required: true,
          options: [
            'وجبتين فقط في اليوم (نظام الصيام المتقطع)',
            '3 وجبات رئيسية',
            '3 وجبات رئيسية + سناك صحي',
            '4 وجبات أو أكثر خلال اليوم'
          ],
        },
        {
          id: 'food_allergies',
          label: 'هل لديك أي حساسية طعام أو مشاكل هضمية من أطعمة معينة؟',
          placeholder: 'مثال: حساسية لاكتوز، حساسية جلوتين، فول سوداني، أو لا يوجد',
          type: 'text',
          required: true,
        },
        {
          id: 'favorite_foods',
          label: 'أطعمة أو مصادر بروتين وكاربوهيدرات تفضل وجودها في نظامك',
          placeholder: 'مثال: فراخ، لحوم، بيض، شوفان، رز، بطاطس، تونة، فواكه...',
          type: 'textarea',
          required: false,
        },
        {
          id: 'disliked_foods',
          label: 'أطعمة تكرهها تماماً ولا تريد رؤيتها في خطتك الغذائية',
          placeholder: 'مثال: سمك، بروكلي، كبدة، ألبان معينة...',
          type: 'textarea',
          required: false,
        },
        {
          id: 'daily_water',
          label: 'معدل شربك اليومي للماء',
          type: 'select',
          required: true,
          options: [
            'قليل جداً (أقل من لتر يومياً)',
            'متوسط (من 1.5 إلى 2.5 لتر)',
            'ممتاز (3 لتر أو أكثر يومياً)'
          ],
        },
        {
          id: 'supplements',
          label: 'هل تتناول أي مكملات غذائية حالياً؟ أو ترغب بإضافتها في خطتك؟',
          placeholder: 'مثال: واي بروتين، كرياتين، أوميجا 3، مالتي فيتامين، أو لا أستخدم',
          type: 'textarea',
          required: false,
        },
        {
          id: 'past_diet_experience',
          label: 'هل جربت أنظمة دايت من قبل؟ وما كان أكبر تحدي أو سبب عدم الاستمرار؟',
          placeholder: 'مثال: جربت الكيتو أو سعرات قاسية وكان التحدي هو الجوع والملل...',
          type: 'textarea',
          required: false,
        },
      ],
    },
    {
      id: 'health_medical',
      title: 'الحالة الصحية والإصابات',
      description: 'لضمان تمرين آمن يحميك من أي إصابات ويراعي صحتك',
      icon: 'ShieldAlert',
      questions: [
        {
          id: 'medical_conditions',
          label: 'هل تعاني من أي مشاكل صحية أو أمراض مزمنة؟ (اختر كل ما ينطبق)',
          type: 'checkbox',
          required: true,
          options: [
            'لا أعاني من أي مشاكل صحية ولله الحمد',
            'ضغط دم مرتفع أو منخفض',
            'مرض السكري (نوع 1 أو نوع 2)',
            'مشاكل في الغدة الدرقية',
            'القولون العصبي أو اضطرابات هضمية',
            'حساسية صدرية أو ربو',
            'حالة صحية أخرى'
          ],
        },
        {
          id: 'injuries_and_pain',
          label: 'هل تعاني من أي آلام مفاصل، إصابات قديمة، أو مشاكل في الظهر أو الركبة؟',
          placeholder: 'مثال: انزلاق غضروفي بالفقرات القطنية، ألم بالكتف الأيمن، خشونة ركبة، أو لا يوجد',
          type: 'textarea',
          required: true,
        },
        {
          id: 'current_medications',
          label: 'هل تتناول أي أدوية علاجية بشكل يومي أو منتظم؟',
          placeholder: 'اذكر أسماء الأدوية إن وجدت أو اكتب: لا يوجد',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      id: 'commitment_notes',
      title: 'الاشتراك والالتزام والملاحظات',
      description: 'الخطوة الأخيرة لبدء رحلة التغيير مع كابتن كريم',
      icon: 'Award',
      questions: [
        {
          id: 'package_type',
          label: 'باقة المتابعة المطلوبة',
          type: 'select',
          required: true,
          options: [
            'باقة الشهر الواحد (متابعة وتجديد شهري)',
            'باقة الـ 3 شهور (باقة التحول والتغيير الجذري - الأكثر طلباً)',
            'باقة الـ 6 شهور (VIP Coaching)',
            'باقة سنوية شاملة (VIP 12 Months)'
          ],
        },
        {
          id: 'commitment_pledge',
          label: 'هل أنت جاهز ومستعد للالتزام بنسبة 100% بالخطة للوصول لهدفك؟',
          type: 'radio',
          required: true,
          options: [
            'نعم، مستعد تماماً وجاهز للالتزام بالدايت والتمرين للوصول لأفضل نسخة مني! 💪',
            'نعم، ولكن أحتاج خطة مرنة وتوجيه وتشجيع مستمر خطوة بخطوة'
          ],
        },
        {
          id: 'special_notes',
          label: 'أي ملاحظات إضافية أو سؤال تحب توجيهه لكابتن كريم؟',
          placeholder: 'اكتب أي تفاصيل أخرى ترغب في مشاركتها مع الكوتش...',
          type: 'textarea',
          required: false,
        },
      ],
    },
  ],
};
