import { useState } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  Eye,
  AlertTriangle,
  Mail,
  Phone,
  Sparkles,
  Layers,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { FormSchema, SectionItem, QuestionItem, QuestionType } from '../types.ts';
import { saveFormSchema, resetFormSchema } from '../api.ts';

interface FormBuilderProps {
  schema: FormSchema;
  onSchemaUpdated: (newSchema: FormSchema) => void;
  onPreview: () => void;
}

export default function FormBuilder({
  schema: initialSchema,
  onSchemaUpdated,
  onPreview,
}: FormBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    initialSchema.sections[0]?.id || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // General schema fields updater
  const handleUpdateMeta = (field: keyof FormSchema, value: string) => {
    setSchema((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save changes to backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await saveFormSchema(schema);
      onSchemaUpdated(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default schema
  const handleReset = async () => {
    if (!window.confirm('هل أنت متأكد من استعادة نموذج استمارة كابتن كريم الافتراضية بجميع أسئلتها؟')) {
      return;
    }
    setIsSaving(true);
    try {
      const reset = await resetFormSchema();
      setSchema(reset);
      onSchemaUpdated(reset);
      setActiveSectionId(reset.sections[0]?.id || '');
      alert('تمت استعادة الأسئلة الافتراضية بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل الاستعادة');
    } finally {
      setIsSaving(false);
    }
  };

  // Current active section
  const currentSection = schema.sections.find((s) => s.id === activeSectionId) || schema.sections[0];

  // Update section title / desc
  const handleUpdateSection = (sectionId: string, updates: Partial<SectionItem>) => {
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
    }));
  };

  // Add new Section
  const handleAddSection = () => {
    const newId = 'sec_' + Date.now();
    const newSec: SectionItem = {
      id: newId,
      title: 'قسم تدريبي جديد',
      description: 'وصف إضافي لهذا القسم',
      questions: [],
    };
    setSchema((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
    setActiveSectionId(newId);
  };

  // Delete Section
  const handleDeleteSection = (sectionId: string) => {
    if (schema.sections.length <= 1) {
      alert('يجب أن تحتوي الاستمارة على قسم واحد على الأقل');
      return;
    }
    if (!window.confirm('هل تريد بالتأكيد حذف هذا القسم بجميع أسئلته؟')) return;

    const filtered = schema.sections.filter((s) => s.id !== sectionId);
    setSchema((prev) => ({ ...prev, sections: filtered }));
    setActiveSectionId(filtered[0]?.id || '');
  };

  // Move Section Up/Down
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...schema.sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    setSchema((prev) => ({ ...prev, sections: newSections }));
  };

  // Add Question to active section
  const handleAddQuestion = () => {
    if (!currentSection) return;
    const newQId = 'q_' + Date.now();
    const newQ: QuestionItem = {
      id: newQId,
      label: 'سؤال جديد',
      placeholder: 'أدخل إجابتك هنا...',
      type: 'text',
      required: false,
    };

    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === currentSection.id
          ? { ...sec, questions: [...sec.questions, newQ] }
          : sec
      ),
    }));
    setEditingQuestionId(newQId);
  };

  // Update Question
  const handleUpdateQuestion = (questionId: string, updates: Partial<QuestionItem>) => {
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => ({
        ...sec,
        questions: sec.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
      })),
    }));
  };

  // Delete Question
  const handleDeleteQuestion = (questionId: string) => {
    if (!window.confirm('هل تريد حذف هذا السؤال؟')) return;
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => ({
        ...sec,
        questions: sec.questions.filter((q) => q.id !== questionId),
      })),
    }));
    if (editingQuestionId === questionId) setEditingQuestionId(null);
  };

  // Move Question Up/Down
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!currentSection) return;
    const newQuestions = [...currentSection.questions];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newQuestions.length) return;
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIdx];
    newQuestions[targetIdx] = temp;

    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === currentSection.id ? { ...sec, questions: newQuestions } : sec
      ),
    }));
  };

  // Duplicate Question
  const handleDuplicateQuestion = (q: QuestionItem) => {
    if (!currentSection) return;
    const clone: QuestionItem = {
      ...q,
      id: 'q_' + Date.now(),
      label: `${q.label} (نسخة)`,
    };
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === currentSection.id
          ? { ...sec, questions: [...sec.questions, clone] }
          : sec
      ),
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-8 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              لوحة تعديل الأسئلة والاستمارة
            </h1>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              خاص بكابتن كريم
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            عدّل أي سؤال، أضف أسئلة جديدة، واضبط البريد المستلم <span className="text-amber-400 font-mono">({schema.coachEmail})</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-preview-as-client"
            onClick={onPreview}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-semibold border border-neutral-700 transition-all"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>معاينة كما يراها المتدرب</span>
          </button>

          <button
            id="btn-reset-schema"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-950 hover:bg-red-950/30 text-neutral-400 hover:text-red-300 text-xs sm:text-sm font-semibold border border-neutral-800 transition-all"
            title="استعادة استمارة كابتن كريم الأصلية بجميع تفاصيلها"
          >
            <RotateCcw className="w-4 h-4" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            id="btn-save-schema"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>تم الحفظ بنجاح!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Form Meta & Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Meta & Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coach Contact & Notification Settings Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>بيانات الإشعار والتواصل</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                بريد كابتن كريم لاستلام الردود (Gmail)
              </label>
              <input
                id="input-coach-email"
                type="email"
                value={schema.coachEmail}
                onChange={(e) => handleUpdateMeta('coachEmail', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                تصل جميع الاستمارات الجديدة والردود فوراً إلى هذا البريد.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                رقم واتساب كابتن كريم (مع كود الدولة)
              </label>
              <input
                id="input-coach-phone"
                type="text"
                value={schema.coachPhone}
                placeholder="+201012345678"
                onChange={(e) => handleUpdateMeta('coachPhone', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                يتيح للمتدربين مراسلتك بضغطة زر بعد إرسال الفورم فوراً.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                اسم الكوتش
              </label>
              <input
                type="text"
                value={schema.coachName}
                onChange={(e) => handleUpdateMeta('coachName', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                لقب أو صفة الكوتش
              </label>
              <input
                type="text"
                value={schema.coachTitle}
                onChange={(e) => handleUpdateMeta('coachTitle', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Form Header Text Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>نصوص واجهة الاستمارة</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                عنوان الاستمارة الرئيسي
              </label>
              <input
                type="text"
                value={schema.title}
                onChange={(e) => handleUpdateMeta('title', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                العنوان الفرعي
              </label>
              <input
                type="text"
                value={schema.subtitle}
                onChange={(e) => handleUpdateMeta('subtitle', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                رسالة الترحيب والتعليمات للمتدرب
              </label>
              <textarea
                rows={3}
                value={schema.description}
                onChange={(e) => handleUpdateMeta('description', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-y"
              />
            </div>
          </div>

          {/* Sections List Navigation */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">أقسام الاستمارة ({schema.sections.length})</h2>
              <button
                id="btn-add-section"
                onClick={handleAddSection}
                className="text-xs bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-neutral-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة قسم</span>
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {schema.sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    sec.id === currentSection?.id
                      ? 'bg-amber-500/10 border border-amber-500 text-white font-bold'
                      : 'bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xs text-amber-400 font-mono">{idx + 1}.</span>
                    <span className="text-xs sm:text-sm truncate">{sec.title}</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-full">
                      {sec.questions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleMoveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                      title="تحريك لأعلى"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(idx, 'down')}
                      disabled={idx === schema.sections.length - 1}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                      title="تحريك لأسفل"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Active Section Questions Builder (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentSection && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md space-y-6">
              
              {/* Section Details Header Edit */}
              <div className="border-b border-neutral-800 pb-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] text-neutral-400 mb-1 font-semibold">
                      عنوان هذا القسم
                    </label>
                    <input
                      type="text"
                      value={currentSection.title}
                      onChange={(e) => handleUpdateSection(currentSection.id, { title: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-base sm:text-lg font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      id="btn-delete-section"
                      onClick={() => handleDeleteSection(currentSection.id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:bg-red-950/40 border border-red-900/40 px-3 py-2 rounded-xl transition-colors"
                      title="حذف هذا القسم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف القسم</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-semibold">
                    وصف توضيحي للقسم (يظهر للمتدرب أسفل العنوان)
                  </label>
                  <input
                    type="text"
                    value={currentSection.description || ''}
                    placeholder="مثال: معلوماتك الأساسية للتواصل ومتابعة البرنامج"
                    onChange={(e) =>
                      handleUpdateSection(currentSection.id, { description: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-neutral-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Questions List Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    الأسئلة داخل هذا القسم ({currentSection.questions.length})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    يمكنك تعديل أي سؤال، تغيير نوعه أو جعله إجبارياً/اختيارياً
                  </p>
                </div>

                <button
                  id="btn-add-question"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>إضافة سؤال جديد</span>
                </button>
              </div>

              {/* Question Items List */}
              <div className="space-y-4">
                {currentSection.questions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400 text-sm mb-3">لا توجد أسئلة في هذا القسم حالياً</p>
                    <button
                      onClick={handleAddQuestion}
                      className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة أول سؤال</span>
                    </button>
                  </div>
                ) : (
                  currentSection.questions.map((q, qIdx) => {
                    const isEditing = editingQuestionId === q.id;
                    return (
                      <div
                        key={q.id}
                        className={`border rounded-2xl transition-all ${
                          isEditing
                            ? 'bg-neutral-950 border-amber-500/80 shadow-xl p-5'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 p-4'
                        }`}
                      >
                        {/* Collapsed Header / Summary */}
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-amber-500 font-mono font-bold">
                                #{qIdx + 1}
                              </span>
                              <span className="text-sm sm:text-base font-bold text-white">
                                {q.label}
                              </span>
                              {q.required ? (
                                <span className="text-[10px] bg-red-950/80 text-red-400 font-bold px-2 py-0.5 rounded-md border border-red-900/60">
                                  مطلوب
                                </span>
                              ) : (
                                <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-md">
                                  اختياري
                                </span>
                              )}
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 font-mono">
                                {translateType(q.type)}
                              </span>
                              {q.unit && (
                                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                                  {q.unit}
                                </span>
                              )}
                            </div>
                            {q.description && (
                              <p className="text-xs text-neutral-400 mt-1">{q.description}</p>
                            )}
                          </div>

                          {/* Quick Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleMoveQuestion(qIdx, 'up')}
                              disabled={qIdx === 0}
                              className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20"
                              title="تحريك لأعلى"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveQuestion(qIdx, 'down')}
                              disabled={qIdx === currentSection.questions.length - 1}
                              className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20"
                              title="تحريك لأسفل"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateQuestion(q)}
                              className="p-1.5 text-neutral-400 hover:text-amber-400"
                              title="نسخ السؤال"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                              className="p-1.5 text-neutral-400 hover:text-amber-400"
                              title={isEditing ? 'إغلاق التعديل' : 'تعديل السؤال'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-400"
                              title="حذف السؤال"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Question Form Editor */}
                        {isEditing && (
                          <div className="mt-5 pt-4 border-t border-neutral-850 space-y-4">
                            
                            {/* Label */}
                            <div>
                              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                                نص السؤال (العنوان)
                              </label>
                              <input
                                type="text"
                                value={q.label}
                                onChange={(e) => handleUpdateQuestion(q.id, { label: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Type */}
                              <div>
                                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                                  نوع الإدخال (Type)
                                </label>
                                <select
                                  value={q.type}
                                  onChange={(e) => {
                                    const newType = e.target.value as QuestionType;
                                    const updates: Partial<QuestionItem> = { type: newType };
                                    if (
                                      (newType === 'select' ||
                                        newType === 'radio' ||
                                        newType === 'checkbox') &&
                                      (!q.options || q.options.length === 0)
                                    ) {
                                      updates.options = ['خيار 1', 'خيار 2'];
                                    }
                                    handleUpdateQuestion(q.id, updates);
                                  }}
                                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                                >
                                  <option value="text">نص عادي (Text)</option>
                                  <option value="number">رقم (Number)</option>
                                  <option value="textarea">نص طويل وملاحظات (Textarea)</option>
                                  <option value="select">قائمة منسدلة (Select)</option>
                                  <option value="radio">اختيار مفرد (Radio Cards)</option>
                                  <option value="checkbox">اختيارات متعددة (Checkbox)</option>
                                  <option value="tel">رقم هاتف / واتساب (Tel)</option>
                                  <option value="email">بريد إلكتروني (Email)</option>
                                  <option value="url">رابط ملف / إنبادي (URL)</option>
                                </select>
                              </div>

                              {/* Required Toggle & Unit */}
                              <div className="flex items-center gap-4 pt-4">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={q.required}
                                    onChange={(e) =>
                                      handleUpdateQuestion(q.id, { required: e.target.checked })
                                    }
                                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-neutral-900 border-neutral-700"
                                  />
                                  <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                                    سؤال إجباري (Required)
                                  </span>
                                </label>

                                {q.type === 'number' && (
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      placeholder="الوحدة (كجم، سم...)"
                                      value={q.unit || ''}
                                      onChange={(e) =>
                                        handleUpdateQuestion(q.id, { unit: e.target.value })
                                      }
                                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Description & Placeholder */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                                  وصف توضيحي أو نصيحة للسؤال
                                </label>
                                <input
                                  type="text"
                                  value={q.description || ''}
                                  placeholder="ملاحظة توضيحية للمتدرب..."
                                  onChange={(e) =>
                                    handleUpdateQuestion(q.id, { description: e.target.value })
                                  }
                                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                                  نص تلميحي داخل الحقل (Placeholder)
                                </label>
                                <input
                                  type="text"
                                  value={q.placeholder || ''}
                                  placeholder="مثال: 80 كجم..."
                                  onChange={(e) =>
                                    handleUpdateQuestion(q.id, { placeholder: e.target.value })
                                  }
                                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                                />
                              </div>
                            </div>

                            {/* Options Editor for Select, Radio, Checkbox */}
                            {(q.type === 'select' || q.type === 'radio' || q.type === 'checkbox') && (
                              <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-amber-400">
                                    خيارات الإجابة ({q.options?.length || 0})
                                  </span>
                                  <button
                                    onClick={() => {
                                      const current = q.options ? [...q.options] : [];
                                      current.push(`خيار جديد ${current.length + 1}`);
                                      handleUpdateQuestion(q.id, { options: current });
                                    }}
                                    className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-2 py-1 rounded-lg flex items-center gap-1 font-semibold"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>إضافة خيار</span>
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {q.options?.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <span className="text-xs text-neutral-500 font-mono w-4">
                                        {optIdx + 1}.
                                      </span>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const newOpts = [...(q.options || [])];
                                          newOpts[optIdx] = e.target.value;
                                          handleUpdateQuestion(q.id, { options: newOpts });
                                        }}
                                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                                      />
                                      <button
                                        onClick={() => {
                                          const newOpts = [...(q.options || [])];
                                          newOpts.splice(optIdx, 1);
                                          handleUpdateQuestion(q.id, { options: newOpts });
                                        }}
                                        className="p-1.5 text-neutral-400 hover:text-red-400"
                                        title="حذف هذا الخيار"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Done editing button */}
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={() => setEditingQuestionId(null)}
                                className="flex items-center gap-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg font-semibold"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>تم إغلاق التعديل</span>
                              </button>
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}

function translateType(type: QuestionType): string {
  switch (type) {
    case 'text':
      return 'نص';
    case 'number':
      return 'رقم';
    case 'textarea':
      return 'نص تفصيلي';
    case 'select':
      return 'قائمة';
    case 'radio':
      return 'اختيار واحد';
    case 'checkbox':
      return 'متعدد';
    case 'tel':
      return 'هاتف';
    case 'email':
      return 'إيميل';
    case 'url':
      return 'رابط';
    default:
      return type;
  }
}
